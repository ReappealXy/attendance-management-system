package xin.rexy.developmenthubbackend.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.api.PageResult;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.DepartmentMapper;
import xin.rexy.developmenthubbackend.mapper.EmployeeMapper;
import xin.rexy.developmenthubbackend.model.entity.DepartmentEntity;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;
import xin.rexy.developmenthubbackend.model.request.EmployeeCreateRequest;
import xin.rexy.developmenthubbackend.model.request.EmployeeUpdateRequest;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class EmployeeService {

    private final EmployeeMapper employeeMapper;
    private final DepartmentMapper departmentMapper;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            EmployeeMapper employeeMapper,
            DepartmentMapper departmentMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeMapper = employeeMapper;
        this.departmentMapper = departmentMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public PageResult<EmployeeEntity> list(long page, long pageSize, String keyword, String department, String role) {
        requireAdmin();
        PageHelper.startPage(Math.toIntExact(page), Math.toIntExact(pageSize));
        List<EmployeeEntity> records = employeeMapper.selectEmployeePage(keyword, department, role);
        records.forEach(item -> item.setPassword(null));
        return PageResult.from(new PageInfo<>(records));
    }

    public EmployeeEntity getById(Long id) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin() && !currentUser.id().equals(id)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        EmployeeEntity employee = employeeMapper.selectActiveById(id);
        if (employee == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "员工不存在");
        }
        employee.setPassword(null);
        return employee;
    }

    @Transactional
    public EmployeeEntity create(EmployeeCreateRequest request) {
        CurrentUser currentUser = requireAdmin();
        if (employeeMapper.selectAuthByUsername(request.username()) != null) {
            throw new BusinessException(HttpStatus.CONFLICT, 409, "用户名已存在");
        }

        String role = request.role() == null || request.role().isBlank() ? "employee" : request.role();
        if ("super_admin".equals(role)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "不能创建超级管理员");
        }
        if (!"employee".equals(role) && !"admin".equals(role)) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "角色值不合法");
        }
        if ("admin".equals(role) && !currentUser.isSuperAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "仅超级管理员可创建管理员");
        }

        DepartmentEntity departmentEntity = resolveDepartment(request.department());

        EmployeeEntity employee = new EmployeeEntity();
        employee.setUsername(request.username());
        employee.setPassword(passwordEncoder.encode(request.password()));
        employee.setName(request.name());
        employee.setRole(role);
        if (departmentEntity != null) {
            employee.setDeptId(departmentEntity.getId());
            employee.setDepartment(departmentEntity.getName());
        }
        employee.setPosition(request.position());
        employee.setPhone(request.phone());
        employee.setEmail(request.email());
        employee.setAvatar(request.avatar());
        employee.setJoinDate(request.joinDate() == null ? LocalDate.now() : request.joinDate());
        employee.setEmployeeId(generateEmployeeId());

        employeeMapper.insert(employee);
        EmployeeEntity created = employeeMapper.selectActiveById(employee.getId());
        created.setPassword(null);
        return created;
    }

    @Transactional
    public EmployeeEntity update(Long id, EmployeeUpdateRequest request) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        EmployeeEntity existing = employeeMapper.selectActiveById(id);
        if (existing == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "员工不存在");
        }

        if (!currentUser.isAdmin() && !currentUser.id().equals(id)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        if ("super_admin".equals(existing.getRole()) && !currentUser.isSuperAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "仅超级管理员可操作超级管理员账号");
        }
        if (!currentUser.isAdmin() && (
                request.role() != null
                        || request.department() != null
                        || request.joinDate() != null
                        || request.password() != null)
        ) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限修改该字段");
        }

        if (request.name() != null) {
            existing.setName(request.name());
        }
        if (request.position() != null) {
            existing.setPosition(request.position());
        }
        if (request.phone() != null) {
            existing.setPhone(request.phone());
        }
        if (request.email() != null) {
            existing.setEmail(request.email());
        }
        if (request.avatar() != null) {
            existing.setAvatar(request.avatar());
        }
        if (request.password() != null && !request.password().isBlank()) {
            if (!currentUser.isAdmin()) {
                throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限重置密码");
            }
            if (request.password().length() < 6) {
                throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "密码长度不能少于6位");
            }
            existing.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.joinDate() != null && currentUser.isAdmin()) {
            existing.setJoinDate(request.joinDate());
        }
        if (request.department() != null && currentUser.isAdmin()) {
            DepartmentEntity departmentEntity = resolveDepartment(request.department());
            if (departmentEntity == null) {
                existing.setDeptId(null);
                existing.setDepartment(null);
            } else {
                existing.setDeptId(departmentEntity.getId());
                existing.setDepartment(departmentEntity.getName());
            }
        }
        if (request.role() != null && currentUser.isAdmin()) {
            if ("super_admin".equals(request.role())) {
                throw new BusinessException(HttpStatus.FORBIDDEN, 403, "不能修改为超级管理员");
            }
            if (!"employee".equals(request.role()) && !"admin".equals(request.role())) {
                throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "角色值不合法");
            }
            if ("admin".equals(request.role()) && !currentUser.isSuperAdmin()) {
                throw new BusinessException(HttpStatus.FORBIDDEN, 403, "仅超级管理员可修改管理员角色");
            }
            existing.setRole(request.role());
        }

        employeeMapper.updateById(existing);
        EmployeeEntity updated = employeeMapper.selectActiveById(id);
        updated.setPassword(null);
        return updated;
    }

    @Transactional
    public void remove(Long id) {
        CurrentUser currentUser = requireAdmin();
        EmployeeEntity existing = employeeMapper.selectActiveById(id);
        if (existing == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, 404, "员工不存在");
        }
        if (currentUser.id().equals(id)) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "不能删除当前登录账号");
        }
        if ("super_admin".equals(existing.getRole()) && !currentUser.isSuperAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "仅超级管理员可删除超级管理员");
        }
        if ("admin".equals(existing.getRole()) && !currentUser.isSuperAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "仅超级管理员可删除管理员");
        }
        employeeMapper.softDeleteById(id, LocalDateTime.now());
    }

    private String generateEmployeeId() {
        long count = employeeMapper.selectCount(Wrappers.<EmployeeEntity>lambdaQuery());
        return "EMP" + String.format("%03d", count + 1);
    }

    private DepartmentEntity resolveDepartment(String departmentName) {
        if (departmentName == null || departmentName.isBlank()) {
            return null;
        }
        DepartmentEntity departmentEntity = departmentMapper.selectOne(Wrappers.<DepartmentEntity>lambdaQuery()
                .eq(DepartmentEntity::getName, departmentName)
                .isNull(DepartmentEntity::getDeletedAt)
                .last("LIMIT 1"));
        if (departmentEntity == null) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "部门不存在");
        }
        return departmentEntity;
    }

    private CurrentUser requireAdmin() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }
        return currentUser;
    }
}
