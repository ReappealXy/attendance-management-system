package xin.rexy.developmenthubbackend.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.EmployeeMapper;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;
import xin.rexy.developmenthubbackend.model.request.LoginRequest;
import xin.rexy.developmenthubbackend.model.request.PasswordChangeRequest;
import xin.rexy.developmenthubbackend.model.response.LoginResponse;
import xin.rexy.developmenthubbackend.security.CurrentUser;
import xin.rexy.developmenthubbackend.security.JwtTokenProvider;

@Service
public class AuthService {

    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            EmployeeMapper employeeMapper,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.employeeMapper = employeeMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        EmployeeEntity employee = employeeMapper.selectAuthByUsername(request.username());
        if (employee == null || !passwordEncoder.matches(request.password(), employee.getPassword())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, 401, "用户名或密码错误");
        }
        String token = jwtTokenProvider.generateToken(toCurrentUser(employee));
        employee.setPassword(null);
        return new LoginResponse(token, "Bearer", jwtTokenProvider.getExpirationSeconds(), employee);
    }

    public EmployeeEntity getCurrentUserProfile() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        EmployeeEntity employee = loadAuthUserById(currentUser.id());
        employee.setPassword(null);
        return employee;
    }

    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        if (!Objects.equals(request.newPassword(), request.confirmPassword())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "两次输入的新密码不一致");
        }
        EmployeeEntity employee = loadAuthUserById(SecurityUtils.currentUser().id());
        if (!passwordEncoder.matches(request.oldPassword(), employee.getPassword())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, 422, "原密码错误");
        }
        employeeMapper.update(null, Wrappers.<EmployeeEntity>lambdaUpdate()
                .eq(EmployeeEntity::getId, employee.getId())
                .set(EmployeeEntity::getPassword, passwordEncoder.encode(request.newPassword())));
    }

    public void logout() {
        // JWT 为无状态认证，前端清理 token 即可。
    }

    public EmployeeEntity loadAuthUserById(Long id) {
        EmployeeEntity employee = employeeMapper.selectActiveById(id);
        if (employee == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, 401, "未登录或登录已过期");
        }
        return employee;
    }

    private CurrentUser toCurrentUser(EmployeeEntity employee) {
        return new CurrentUser(
                employee.getId(),
                employee.getUsername(),
                employee.getName(),
                employee.getRole(),
                employee.getDepartment()
        );
    }
}
