package xin.rexy.developmenthubbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.AttendanceRuleMapper;
import xin.rexy.developmenthubbackend.mapper.LeaveTypeMapper;
import xin.rexy.developmenthubbackend.model.entity.AttendanceRuleEntity;
import xin.rexy.developmenthubbackend.model.entity.LeaveTypeEntity;
import xin.rexy.developmenthubbackend.model.request.AttendanceRuleRequest;
import xin.rexy.developmenthubbackend.model.request.LeaveTypeRequest;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class RuleService {

    private final AttendanceRuleMapper attendanceRuleMapper;
    private final LeaveTypeMapper leaveTypeMapper;

    public RuleService(AttendanceRuleMapper attendanceRuleMapper, LeaveTypeMapper leaveTypeMapper) {
        this.attendanceRuleMapper = attendanceRuleMapper;
        this.leaveTypeMapper = leaveTypeMapper;
    }

    public List<AttendanceRuleEntity> listRules() {
        return attendanceRuleMapper.selectActiveList();
    }

    @Transactional
    public AttendanceRuleEntity createRule(AttendanceRuleRequest request) {
        requireAdmin();
        if (Boolean.TRUE.equals(request.isDefault())) {
            clearDefaultRule();
        }
        AttendanceRuleEntity entity = toRuleEntity(new AttendanceRuleEntity(), request);
        attendanceRuleMapper.insert(entity);
        return attendanceRuleMapper.selectById(entity.getId());
    }

    @Transactional
    public AttendanceRuleEntity updateRule(Long id, AttendanceRuleRequest request) {
        requireAdmin();
        AttendanceRuleEntity entity = attendanceRuleMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "考勤规则不存在");
        }
        if (Boolean.TRUE.equals(request.isDefault())) {
            clearDefaultRule();
        }
        entity = toRuleEntity(entity, request);
        attendanceRuleMapper.updateById(entity);
        return attendanceRuleMapper.selectById(id);
    }

    @Transactional
    public void deleteRule(Long id) {
        requireAdmin();
        AttendanceRuleEntity entity = attendanceRuleMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "考勤规则不存在");
        }
        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "默认考勤规则不可删除");
        }
        attendanceRuleMapper.softDeleteById(id, LocalDateTime.now());
    }

    public List<LeaveTypeEntity> listLeaveTypes() {
        return leaveTypeMapper.selectActiveList();
    }

    @Transactional
    public LeaveTypeEntity createLeaveType(LeaveTypeRequest request) {
        requireAdmin();
        LeaveTypeEntity entity = new LeaveTypeEntity();
        entity.setName(request.name());
        entity.setMaxDays(request.maxDays());
        entity.setRequireApproval(request.requireApproval() == null || request.requireApproval());
        leaveTypeMapper.insert(entity);
        return leaveTypeMapper.selectById(entity.getId());
    }

    @Transactional
    public LeaveTypeEntity updateLeaveType(Long id, LeaveTypeRequest request) {
        requireAdmin();
        LeaveTypeEntity entity = leaveTypeMapper.selectActiveById(id);
        if (entity == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "假期类型不存在");
        }
        entity.setName(request.name());
        entity.setMaxDays(request.maxDays());
        entity.setRequireApproval(request.requireApproval() == null || request.requireApproval());
        leaveTypeMapper.updateById(entity);
        return leaveTypeMapper.selectById(id);
    }

    @Transactional
    public void deleteLeaveType(Long id) {
        requireAdmin();
        LeaveTypeEntity entity = leaveTypeMapper.selectActiveById(id);
        if (entity == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "假期类型不存在");
        }
        leaveTypeMapper.softDeleteById(id, LocalDateTime.now());
    }

    private AttendanceRuleEntity toRuleEntity(AttendanceRuleEntity entity, AttendanceRuleRequest request) {
        entity.setName(request.name());
        entity.setClockInTime(request.clockInTime());
        entity.setClockOutTime(request.clockOutTime());
        entity.setLateThreshold(request.lateThreshold() == null ? 15 : request.lateThreshold());
        entity.setEarlyThreshold(request.earlyThreshold() == null ? 15 : request.earlyThreshold());
        entity.setIsDefault(Boolean.TRUE.equals(request.isDefault()));
        return entity;
    }

    private void clearDefaultRule() {
        attendanceRuleMapper.selectActiveList().stream()
                .filter(rule -> Boolean.TRUE.equals(rule.getIsDefault()))
                .forEach(rule -> {
                    rule.setIsDefault(false);
                    attendanceRuleMapper.updateById(rule);
                });
    }

    private CurrentUser requireAdmin() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        return currentUser;
    }
}
