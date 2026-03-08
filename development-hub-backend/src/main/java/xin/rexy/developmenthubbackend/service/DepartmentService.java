package xin.rexy.developmenthubbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.DepartmentMapper;
import xin.rexy.developmenthubbackend.mapper.EmployeeMapper;
import xin.rexy.developmenthubbackend.model.entity.DepartmentEntity;
import xin.rexy.developmenthubbackend.model.request.DepartmentCreateRequest;
import xin.rexy.developmenthubbackend.model.request.DepartmentUpdateRequest;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class DepartmentService {

    private final DepartmentMapper departmentMapper;
    private final EmployeeMapper employeeMapper;

    public DepartmentService(DepartmentMapper departmentMapper, EmployeeMapper employeeMapper) {
        this.departmentMapper = departmentMapper;
        this.employeeMapper = employeeMapper;
    }

    public List<DepartmentEntity> list() {
        return departmentMapper.selectDepartmentList();
    }

    public DepartmentEntity getById(Long id) {
        DepartmentEntity department = departmentMapper.selectDepartmentById(id);
        if (department == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "部门不存在");
        }
        return department;
    }

    @Transactional
    public DepartmentEntity create(DepartmentCreateRequest request) {
        requireAdmin();
        validateParent(request.parentId(), null);
        DepartmentEntity entity = new DepartmentEntity();
        entity.setName(request.name());
        entity.setParentId(request.parentId());
        entity.setManager(request.manager());
        entity.setMemberCount(0);
        departmentMapper.insert(entity);
        return departmentMapper.selectDepartmentById(entity.getId());
    }

    @Transactional
    public DepartmentEntity update(Long id, DepartmentUpdateRequest request) {
        requireAdmin();
        DepartmentEntity existing = departmentMapper.selectDepartmentById(id);
        if (existing == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "部门不存在");
        }
        validateParent(request.parentId(), id);
        String originalName = existing.getName();
        existing.setName(request.name());
        existing.setParentId(request.parentId());
        existing.setManager(request.manager());
        departmentMapper.updateById(existing);
        if (!originalName.equals(request.name())) {
            employeeMapper.updateDepartmentNameByDeptId(id, request.name());
        }
        return departmentMapper.selectDepartmentById(id);
    }

    @Transactional
    public void remove(Long id) {
        requireAdmin();
        DepartmentEntity existing = departmentMapper.selectDepartmentById(id);
        if (existing == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "部门不存在");
        }
        if (employeeMapper.countActiveByDeptId(id) > 0) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "该部门下仍有员工，无法删除");
        }
        if (departmentMapper.countActiveChildren(id) > 0) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "请先删除子部门");
        }
        departmentMapper.softDeleteById(id, LocalDateTime.now());
    }

    private void validateParent(Long parentId, Long selfId) {
        if (parentId == null) {
            return;
        }
        if (selfId != null && selfId.equals(parentId)) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "上级部门不能是自己");
        }
        DepartmentEntity parent = departmentMapper.selectDepartmentById(parentId);
        if (parent == null) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "上级部门不存在");
        }
    }

    private CurrentUser requireAdmin() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        return currentUser;
    }
}
