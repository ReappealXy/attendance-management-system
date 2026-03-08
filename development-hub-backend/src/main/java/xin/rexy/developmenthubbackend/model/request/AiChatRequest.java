package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record AiChatRequest(
        @NotEmpty(message = "消息列表不能为空")
        List<@Valid AiMessagePayload> messages
) {
}
