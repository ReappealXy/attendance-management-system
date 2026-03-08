package xin.rexy.developmenthubbackend.config;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import xin.rexy.developmenthubbackend.mapper.EmployeeMapper;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;

@Component
@Order(1)
public class SeedPasswordRepairRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedPasswordRepairRunner.class);

    private static final String SUPER_ADMIN_USERNAME = "super_admin";
    private static final String SUPER_ADMIN_DEFAULT_PASSWORD = "ChangeMe123!";
    private static final String COMMON_USER_DEFAULT_PASSWORD = "123456";
    private static final String SUPER_ADMIN_PLACEHOLDER = "__SEED_PASSWORD_SUPER_ADMIN__";
    private static final String COMMON_USER_PLACEHOLDER = "__SEED_PASSWORD_COMMON__";

    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;

    public SeedPasswordRepairRunner(EmployeeMapper employeeMapper, PasswordEncoder passwordEncoder) {
        this.employeeMapper = employeeMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        int repairedSuperAdmin = employeeMapper.update(
                null,
                Wrappers.<EmployeeEntity>lambdaUpdate()
                        .eq(EmployeeEntity::getUsername, SUPER_ADMIN_USERNAME)
                        .eq(EmployeeEntity::getPassword, SUPER_ADMIN_PLACEHOLDER)
                        .set(EmployeeEntity::getPassword, passwordEncoder.encode(SUPER_ADMIN_DEFAULT_PASSWORD))
        );

        int repairedCommonUsers = employeeMapper.update(
                null,
                Wrappers.<EmployeeEntity>lambdaUpdate()
                        .eq(EmployeeEntity::getPassword, COMMON_USER_PLACEHOLDER)
                        .set(EmployeeEntity::getPassword, passwordEncoder.encode(COMMON_USER_DEFAULT_PASSWORD))
        );

        if (repairedSuperAdmin > 0 || repairedCommonUsers > 0) {
            log.info(
                    "Repaired seeded employee passwords: superAdmin={}, commonUsers={}",
                    repairedSuperAdmin,
                    repairedCommonUsers
            );
        }
    }
}
