package xin.rexy.developmenthubbackend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.AttendanceRecordMapper;
import xin.rexy.developmenthubbackend.mapper.StatisticsMapper;
import xin.rexy.developmenthubbackend.model.entity.AttendanceRecordEntity;
import xin.rexy.developmenthubbackend.model.response.AttendanceTodayResponse;
import xin.rexy.developmenthubbackend.model.response.DashboardResponse;
import xin.rexy.developmenthubbackend.model.response.DepartmentStatsResponse;
import xin.rexy.developmenthubbackend.model.response.PersonalStatsResponse;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class StatisticsService {

    private final StatisticsMapper statisticsMapper;
    private final AttendanceRecordMapper attendanceRecordMapper;
    private final LeaveRequestService leaveRequestService;
    private final AttendanceService attendanceService;

    public StatisticsService(
            StatisticsMapper statisticsMapper,
            AttendanceRecordMapper attendanceRecordMapper,
            LeaveRequestService leaveRequestService,
            AttendanceService attendanceService
    ) {
        this.statisticsMapper = statisticsMapper;
        this.attendanceRecordMapper = attendanceRecordMapper;
        this.leaveRequestService = leaveRequestService;
        this.attendanceService = attendanceService;
    }

    public PersonalStatsResponse getPersonalStats(Long userId, Integer year, Integer month) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        Long targetUserId = userId == null ? currentUser.id() : userId;
        if (!currentUser.isAdmin() && !currentUser.id().equals(targetUserId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }

        YearMonth targetMonth = YearMonth.of(
                year == null ? LocalDate.now().getYear() : year,
                month == null ? LocalDate.now().getMonthValue() : month
        );
        PersonalStatsResponse response = statisticsMapper.selectPersonalStats(
                targetUserId,
                targetMonth.atDay(1),
                targetMonth.atEndOfMonth(),
                targetMonth.getYear(),
                targetMonth.getMonthValue()
        );
        if (response == null) {
            response = new PersonalStatsResponse();
            response.setUserId(targetUserId);
            response.setYear(targetMonth.getYear());
            response.setMonth(targetMonth.getMonthValue());
            response.setTotalDays(0);
            response.setNormalDays(0);
            response.setLateDays(0);
            response.setEarlyDays(0);
            response.setAbsentDays(0);
            response.setLeaveDays(0);
            response.setAttendanceRate(0D);
        }
        return response;
    }

    public List<DepartmentStatsResponse> getDepartmentStats(LocalDate date) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        return statisticsMapper.selectDepartmentStats(date == null ? LocalDate.now() : date);
    }

    public DashboardResponse getDashboard() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        DashboardResponse response = new DashboardResponse();
        if (currentUser.isAdmin()) {
            LocalDate today = LocalDate.now();
            YearMonth currentMonth = YearMonth.now();
            response.setTodayPresent((int) statisticsMapper.countPresentByDate(today));
            response.setTodayAbsent((int) statisticsMapper.countAbsentByDate(today));
            response.setTodayLate((int) statisticsMapper.countLateByDate(today));
            response.setPendingApprovals((int) leaveRequestService.countPendingAll());
            response.setTotalEmployees((int) statisticsMapper.countTotalEmployees());
            response.setMonthlyAttendanceRate(statisticsMapper.calculateMonthlyAttendanceRate(
                    currentMonth.atDay(1),
                    currentMonth.atEndOfMonth()
            ));
            response.setRecentAnomalies(statisticsMapper.selectRecentAnomalies(today));
            return response;
        }

        AttendanceTodayResponse today = attendanceService.getToday();
        PersonalStatsResponse personalStats = getPersonalStats(currentUser.id(), null, null);
        response.setTodayClockedIn(today.getHasClockedIn());
        response.setTodayClockedOut(today.getHasClockedOut());
        if (today.getClockInTime() != null) {
            response.setTodayClockInTime(java.time.LocalTime.parse(today.getClockInTime()));
        }
        response.setMonthNormalDays(personalStats.getNormalDays());
        response.setMonthLateDays(personalStats.getLateDays());
        response.setMonthEarlyDays(personalStats.getEarlyDays());
        response.setPendingRequests((int) leaveRequestService.countPendingByCurrentUser());
        return response;
    }

    public ExportFile exportReport(Integer year, Integer month, String department, String format) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        if (year == null || month == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, 400, "年份和月份不能为空");
        }

        YearMonth targetMonth = YearMonth.of(year, month);
        List<AttendanceRecordEntity> rows = attendanceRecordMapper.selectExportRecords(
                targetMonth.atDay(1),
                targetMonth.atEndOfMonth(),
                department
        );
        String normalizedFormat = format == null || format.isBlank() ? "xlsx" : format.toLowerCase();
        if ("csv".equals(normalizedFormat)) {
            return new ExportFile(
                    "text/csv",
                    "attendance_%d_%02d.csv".formatted(year, month),
                    buildCsv(rows)
            );
        }
        return new ExportFile(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "attendance_%d_%02d.xlsx".formatted(year, month),
                buildXlsx(rows)
        );
    }

    private byte[] buildCsv(List<AttendanceRecordEntity> rows) {
        StringBuilder builder = new StringBuilder("姓名,部门,日期,签到,签退,状态\n");
        for (AttendanceRecordEntity row : rows) {
            builder.append(nullToEmpty(row.getUserName())).append(',')
                    .append(nullToEmpty(row.getDepartment())).append(',')
                    .append(row.getDate()).append(',')
                    .append(row.getClockIn() == null ? "" : row.getClockIn()).append(',')
                    .append(row.getClockOut() == null ? "" : row.getClockOut()).append(',')
                    .append(nullToEmpty(row.getStatus())).append('\n');
        }
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] buildXlsx(List<AttendanceRecordEntity> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("attendance");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("姓名");
            header.createCell(1).setCellValue("部门");
            header.createCell(2).setCellValue("日期");
            header.createCell(3).setCellValue("签到");
            header.createCell(4).setCellValue("签退");
            header.createCell(5).setCellValue("状态");

            int rowIndex = 1;
            for (AttendanceRecordEntity row : rows) {
                Row dataRow = sheet.createRow(rowIndex++);
                dataRow.createCell(0).setCellValue(nullToEmpty(row.getUserName()));
                dataRow.createCell(1).setCellValue(nullToEmpty(row.getDepartment()));
                dataRow.createCell(2).setCellValue(row.getDate() == null ? "" : row.getDate().toString());
                dataRow.createCell(3).setCellValue(row.getClockIn() == null ? "" : row.getClockIn().toString());
                dataRow.createCell(4).setCellValue(row.getClockOut() == null ? "" : row.getClockOut().toString());
                dataRow.createCell(5).setCellValue(nullToEmpty(row.getStatus()));
            }
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException ex) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, 500, "导出报表失败");
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    public record ExportFile(String contentType, String fileName, byte[] content) {
    }
}
