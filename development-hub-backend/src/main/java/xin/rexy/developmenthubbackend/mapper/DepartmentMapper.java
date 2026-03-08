package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.DepartmentEntity;

public interface DepartmentMapper extends BaseMapper<DepartmentEntity> {

    List<DepartmentEntity> selectDepartmentList();

    DepartmentEntity selectDepartmentById(@Param("id") Long id);

    long countActiveChildren(@Param("parentId") Long parentId);

    int softDeleteById(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);
}
