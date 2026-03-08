package xin.rexy.developmenthubbackend.model.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;
import java.util.List;
import lombok.Data;

@Data
public class DashboardResponse {

    private Integer todayPresent;
    private Integer todayAbsent;
    private Integer todayLate;
    private Integer pendingApprovals;
    private Integer totalEmployees;
    private Double monthlyAttendanceRate;
    private List<RecentAnomaly> recentAnomalies;
    private Boolean todayClockedIn;
    private Boolean todayClockedOut;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime todayClockInTime;

    private Integer monthNormalDays;
    private Integer monthLateDays;
    private Integer monthEarlyDays;
    private Integer pendingRequests;
}
