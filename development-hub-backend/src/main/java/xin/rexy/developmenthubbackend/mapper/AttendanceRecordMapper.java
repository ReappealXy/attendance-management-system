package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.AttendanceRecordEntity;

public interface AttendanceRecordMapper extends BaseMapper<AttendanceRecordEntity> {

    AttendanceRecordEntity selectTodayRecord(@Param("userId") Long userId, @Param("date") LocalDate date);

    List<AttendanceRecordEntity> selectMyPage(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") String status
    );

    List<AttendanceRecordEntity> selectAllPage(
            @Param("userId") Long userId,
            @Param("department") String department,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") String status
    );

    List<AttendanceRecordEntity> selectExportRecords(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("department") String department
    );
}
