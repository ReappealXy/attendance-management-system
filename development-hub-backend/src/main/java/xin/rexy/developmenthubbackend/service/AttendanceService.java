package xin.rexy.developmenthubbackend.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.api.PageResult;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.GeoUtils;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.AttendanceRecordMapper;
import xin.rexy.developmenthubbackend.mapper.AttendanceRuleMapper;
import xin.rexy.developmenthubbackend.model.entity.AttendanceRecordEntity;
import xin.rexy.developmenthubbackend.model.entity.AttendanceRuleEntity;
import xin.rexy.developmenthubbackend.model.entity.LocationPoint;
import xin.rexy.developmenthubbackend.model.request.ClockActionRequest;
import xin.rexy.developmenthubbackend.model.response.AttendanceTodayResponse;
import xin.rexy.developmenthubbackend.model.response.CompanyLocationResponse;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class AttendanceService {

    private final AttendanceRecordMapper attendanceRecordMapper;
    private final AttendanceRuleMapper attendanceRuleMapper;
    private final CompanyConfigService companyConfigService;

    public AttendanceService(
            AttendanceRecordMapper attendanceRecordMapper,
            AttendanceRuleMapper attendanceRuleMapper,
            CompanyConfigService companyConfigService
    ) {
        this.attendanceRecordMapper = attendanceRecordMapper;
        this.attendanceRuleMapper = attendanceRuleMapper;
        this.companyConfigService = companyConfigService;
    }

    @Transactional
    public AttendanceRecordEntity clockIn(ClockActionRequest request) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        CompanyLocationResponse companyLocation = companyConfigService.getLocation();
        int distance = validateRange(request.latitude(), request.longitude(), companyLocation);
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);
        AttendanceRecordEntity existing = attendanceRecordMapper.selectTodayRecord(currentUser.id(), today);
        if (existing != null && existing.getClockIn() != null) {
            throw new BusinessException(HttpStatus.CONFLICT, 409, "今日已签到，请勿重复打卡");
        }

        AttendanceRuleEntity rule = getDefaultRule();
        boolean late = now.isAfter(rule.getClockInTime().plusMinutes(rule.getLateThreshold()));

        if (existing == null) {
            existing = new AttendanceRecordEntity();
            existing.setUserId(currentUser.id());
            existing.setDate(today);
            existing.setClockIn(now);
            existing.setStatus(late ? "late" : "normal");
            existing.setClockInLat(request.latitude());
            existing.setClockInLng(request.longitude());
            attendanceRecordMapper.insert(existing);
        } else {
            existing.setClockIn(now);
            existing.setStatus(late ? "late" : "normal");
            existing.setClockInLat(request.latitude());
            existing.setClockInLng(request.longitude());
            attendanceRecordMapper.updateById(existing);
        }

        AttendanceRecordEntity saved = attendanceRecordMapper.selectTodayRecord(currentUser.id(), today);
        hydrateRecord(saved);
        saved.setDistance(distance);
        saved.setIsLate(late);
        return saved;
    }

    @Transactional
    public AttendanceRecordEntity clockOut(ClockActionRequest request) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        CompanyLocationResponse companyLocation = companyConfigService.getLocation();
        int distance = validateRange(request.latitude(), request.longitude(), companyLocation);
        LocalDate today = LocalDate.now();
        AttendanceRecordEntity existing = attendanceRecordMapper.selectTodayRecord(currentUser.id(), today);
        if (existing == null || existing.getClockIn() == null) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "今日尚未签到");
        }
        if (existing.getClockOut() != null) {
            throw new BusinessException(HttpStatus.CONFLICT, 409, "今日已签退，请勿重复打卡");
        }

        AttendanceRuleEntity rule = getDefaultRule();
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);
        boolean early = now.isBefore(rule.getClockOutTime().minusMinutes(rule.getEarlyThreshold()));

        existing.setClockOut(now);
        existing.setClockOutLat(request.latitude());
        existing.setClockOutLng(request.longitude());
        if (!"late".equals(existing.getStatus())) {
            existing.setStatus(early ? "early" : "normal");
        }
        attendanceRecordMapper.updateById(existing);

        AttendanceRecordEntity saved = attendanceRecordMapper.selectTodayRecord(currentUser.id(), today);
        hydrateRecord(saved);
        saved.setDistance(distance);
        saved.setIsEarly(early);
        return saved;
    }

    public AttendanceTodayResponse getToday() {
        AttendanceRecordEntity record = attendanceRecordMapper.selectTodayRecord(SecurityUtils.currentUser().id(), LocalDate.now());
        if (record == null) {
            return new AttendanceTodayResponse(false, false, null, null, null);
        }
        return new AttendanceTodayResponse(
                record.getClockIn() != null,
                record.getClockOut() != null,
                record.getClockIn() == null ? null : record.getClockIn().toString().substring(0, 5),
                record.getClockOut() == null ? null : record.getClockOut().toString().substring(0, 5),
                record.getStatus()
        );
    }

    public PageResult<AttendanceRecordEntity> getMyRecords(long page, long pageSize, LocalDate startDate, LocalDate endDate, String status) {
        PageHelper.startPage(Math.toIntExact(page), Math.toIntExact(pageSize));
        List<AttendanceRecordEntity> records = attendanceRecordMapper.selectMyPage(
                SecurityUtils.currentUser().id(),
                startDate,
                endDate,
                status
        );
        records.forEach(this::hydrateRecord);
        return PageResult.from(new PageInfo<>(records));
    }

    public PageResult<AttendanceRecordEntity> getAllRecords(
            long page,
            long pageSize,
            Long userId,
            String department,
            LocalDate startDate,
            LocalDate endDate,
            String status
    ) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        PageHelper.startPage(Math.toIntExact(page), Math.toIntExact(pageSize));
        List<AttendanceRecordEntity> records = attendanceRecordMapper.selectAllPage(
                userId,
                department,
                startDate,
                endDate,
                status
        );
        records.forEach(this::hydrateRecord);
        return PageResult.from(new PageInfo<>(records));
    }

    private int validateRange(Double latitude, Double longitude, CompanyLocationResponse companyLocation) {
        double distance = GeoUtils.distanceMeters(
                latitude,
                longitude,
                companyLocation.getLatitude(),
                companyLocation.getLongitude()
        );
        int roundedDistance = (int) Math.round(distance);
        if (roundedDistance > companyLocation.getRadius()) {
            Map<String, Object> data = new HashMap<>();
            data.put("distance", roundedDistance);
            data.put("maxDistance", companyLocation.getRadius());
            data.put("companyName", companyLocation.getName());
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "您不在打卡范围内", data);
        }
        return roundedDistance;
    }

    private AttendanceRuleEntity getDefaultRule() {
        AttendanceRuleEntity rule = attendanceRuleMapper.selectDefaultRule();
        if (rule == null) {
            rule = new AttendanceRuleEntity();
            rule.setClockInTime(LocalTime.of(9, 0));
            rule.setClockOutTime(LocalTime.of(18, 0));
            rule.setLateThreshold(15);
            rule.setEarlyThreshold(15);
        }
        return rule;
    }

    private void hydrateRecord(AttendanceRecordEntity record) {
        if (record == null) {
            return;
        }
        if (record.getClockInLat() != null && record.getClockInLng() != null) {
            record.setClockInLocation(new LocationPoint(record.getClockInLat(), record.getClockInLng()));
        }
        if (record.getClockOutLat() != null && record.getClockOutLng() != null) {
            record.setClockOutLocation(new LocationPoint(record.getClockOutLat(), record.getClockOutLng()));
        }
    }
}
