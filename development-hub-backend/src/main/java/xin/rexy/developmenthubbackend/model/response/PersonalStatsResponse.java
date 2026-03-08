package xin.rexy.developmenthubbackend.model.response;

import lombok.Data;

@Data
public class PersonalStatsResponse {

    private Long userId;
    private String userName;
    private Integer year;
    private Integer month;
    private Integer totalDays;
    private Integer normalDays;
    private Integer lateDays;
    private Integer earlyDays;
    private Integer absentDays;
    private Integer leaveDays;
    private Double overtimeHours;
    private Double attendanceRate;
}
