package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;

public interface EmployeeMapper extends BaseMapper<EmployeeEntity> {

    EmployeeEntity selectAuthByUsername(@Param("username") String username);

    EmployeeEntity selectActiveById(@Param("id") Long id);

    List<EmployeeEntity> selectEmployeePage(
            @Param("keyword") String keyword,
            @Param("department") String department,
            @Param("role") String role
    );

    long countActiveByDeptId(@Param("deptId") Long deptId);

    int softDeleteById(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);

    int updateDepartmentNameByDeptId(@Param("deptId") Long deptId, @Param("departmentName") String departmentName);
}
