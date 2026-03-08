package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.constraints.NotBlank;

public record AiMessagePayload(
        @NotBlank(message = "角色不能为空")
        String role,
        @NotBlank(message = "内容不能为空")
        String content
) {
}
