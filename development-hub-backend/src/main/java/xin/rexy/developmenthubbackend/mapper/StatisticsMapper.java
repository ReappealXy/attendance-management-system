package xin.rexy.developmenthubbackend.mapper;

import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.response.DepartmentStatsResponse;
import xin.rexy.developmenthubbackend.model.response.PersonalStatsResponse;
import xin.rexy.developmenthubbackend.model.response.RecentAnomaly;

public interface StatisticsMapper {

    PersonalStatsResponse selectPersonalStats(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("year") Integer year,
            @Param("month") Integer month
    );

    List<DepartmentStatsResponse> selectDepartmentStats(@Param("date") LocalDate date);

    long countTotalEmployees();

    long countPresentByDate(@Param("date") LocalDate date);

    long countAbsentByDate(@Param("date") LocalDate date);

    long countLateByDate(@Param("date") LocalDate date);

    Double calculateMonthlyAttendanceRate(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<RecentAnomaly> selectRecentAnomalies(@Param("date") LocalDate date);
}
