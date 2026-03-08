package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.LeaveTypeEntity;

public interface LeaveTypeMapper extends BaseMapper<LeaveTypeEntity> {

    List<LeaveTypeEntity> selectActiveList();

    LeaveTypeEntity selectActiveById(@Param("id") Long id);

    int softDeleteById(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);
}
