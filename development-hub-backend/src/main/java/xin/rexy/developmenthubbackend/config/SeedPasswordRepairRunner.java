package xin.rexy.developmenthubbackend.config;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import java.security.SecureRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import xin.rexy.developmenthubbackend.mapper.EmployeeMapper;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;

@Component
@Order(1)
public class SeedPasswordRepairRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedPasswordRepairRunner.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String PASSWORD_CHAR_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    private static final int GENERATED_PASSWORD_LENGTH = 16;

    private static final String SUPER_ADMIN_USERNAME = "super_admin";
    private static final String SUPER_ADMIN_PLACEHOLDER = "__SEED_PASSWORD_SUPER_ADMIN__";
    private static final String COMMON_USER_PLACEHOLDER = "__SEED_PASSWORD_COMMON__";

    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;
    private final String configuredSuperAdminPassword;
    private final String configuredCommonUserPassword;

    public SeedPasswordRepairRunner(
            EmployeeMapper employeeMapper,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.super-admin-password:}") String configuredSuperAdminPassword,
            @Value("${app.seed.common-user-password:}") String configuredCommonUserPassword
    ) {
        this.employeeMapper = employeeMapper;
        this.passwordEncoder = passwordEncoder;
        this.configuredSuperAdminPassword = configuredSuperAdminPassword;
        this.configuredCommonUserPassword = configuredCommonUserPassword;
    }

    @Override
    public void run(String... args) {
        boolean hasSeededSuperAdmin = employeeMapper.selectCount(
                Wrappers.<EmployeeEntity>lambdaQuery()
                        .eq(EmployeeEntity::getUsername, SUPER_ADMIN_USERNAME)
                        .eq(EmployeeEntity::getPassword, SUPER_ADMIN_PLACEHOLDER)
        ) > 0;
        boolean hasSeededCommonUsers = employeeMapper.selectCount(
                Wrappers.<EmployeeEntity>lambdaQuery()
                        .eq(EmployeeEntity::getPassword, COMMON_USER_PLACEHOLDER)
        ) > 0;

        if (!hasSeededSuperAdmin && !hasSeededCommonUsers) {
            return;
        }

        String superAdminPassword = hasSeededSuperAdmin ? resolveSeedPassword(configuredSuperAdminPassword) : null;
        String commonUserPassword = hasSeededCommonUsers ? resolveSeedPassword(configuredCommonUserPassword) : null;

        int repairedSuperAdmin = 0;
        int repairedCommonUsers = 0;
        if (hasSeededSuperAdmin && superAdminPassword != null) {
            repairedSuperAdmin = employeeMapper.update(
                    null,
                    Wrappers.<EmployeeEntity>lambdaUpdate()
                            .eq(EmployeeEntity::getUsername, SUPER_ADMIN_USERNAME)
                            .eq(EmployeeEntity::getPassword, SUPER_ADMIN_PLACEHOLDER)
                            .set(EmployeeEntity::getPassword, passwordEncoder.encode(superAdminPassword))
            );
        }
        if (hasSeededCommonUsers && commonUserPassword != null) {
            repairedCommonUsers = employeeMapper.update(
                    null,
                    Wrappers.<EmployeeEntity>lambdaUpdate()
                            .eq(EmployeeEntity::getPassword, COMMON_USER_PLACEHOLDER)
                            .set(EmployeeEntity::getPassword, passwordEncoder.encode(commonUserPassword))
            );
        }

        if (repairedSuperAdmin > 0 || repairedCommonUsers > 0) {
            log.warn(
                    "Initialized seeded employee passwords. superAdmin={}, commonUsers={}, superAdminPassword={}, commonUserPassword={}. Please sign in and reset these passwords immediately.",
                    repairedSuperAdmin,
                    repairedCommonUsers,
                    superAdminPassword == null ? "<unchanged>" : superAdminPassword,
                    commonUserPassword == null ? "<unchanged>" : commonUserPassword
            );
        }
    }

    private String resolveSeedPassword(String configuredPassword) {
        if (configuredPassword != null && !configuredPassword.isBlank()) {
            return configuredPassword.trim();
        }
        return generateRandomPassword();
    }

    private String generateRandomPassword() {
        StringBuilder builder = new StringBuilder(GENERATED_PASSWORD_LENGTH);
        for (int i = 0; i < GENERATED_PASSWORD_LENGTH; i++) {
            builder.append(PASSWORD_CHAR_POOL.charAt(SECURE_RANDOM.nextInt(PASSWORD_CHAR_POOL.length())));
        }
        return builder.toString();
    }
}
