package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.constraints.NotBlank;

public record PasswordChangeRequest(
        @NotBlank(message = "原密码不能为空")
        String oldPassword,
        @NotBlank(message = "新密码不能为空")
        String newPassword,
        @NotBlank(message = "确认密码不能为空")
        String confirmPassword
) {
}
