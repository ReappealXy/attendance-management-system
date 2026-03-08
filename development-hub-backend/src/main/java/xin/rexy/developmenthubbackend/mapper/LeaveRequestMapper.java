package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.LeaveRequestEntity;

public interface LeaveRequestMapper extends BaseMapper<LeaveRequestEntity> {

    List<LeaveRequestEntity> selectLeavePage(
            @Param("currentUserId") Long currentUserId,
            @Param("isAdmin") boolean isAdmin,
            @Param("status") String status,
            @Param("type") String type,
            @Param("userId") Long userId
    );

    LeaveRequestEntity selectLeaveById(@Param("id") Long id);

    long countPendingByUserId(@Param("userId") Long userId);

    long countPendingAll();

    int softDeleteById(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);
}
