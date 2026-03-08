package xin.rexy.developmenthubbackend.model.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record EmployeeCreateRequest(
        @NotBlank(message = "用户名不能为空")
        String username,
        @NotBlank(message = "密码不能为空")
        String password,
        @NotBlank(message = "姓名不能为空")
        String name,
        String role,
        String department,
        String position,
        String phone,
        String email,
        String avatar,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate joinDate
) {
}
