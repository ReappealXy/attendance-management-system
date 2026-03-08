package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.AttendanceRuleEntity;

public interface AttendanceRuleMapper extends BaseMapper<AttendanceRuleEntity> {

    List<AttendanceRuleEntity> selectActiveList();

    AttendanceRuleEntity selectDefaultRule();

    int softDeleteById(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);
}
