package xin.rexy.developmenthubbackend.model.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;

public record AiSummaryRequest(
        @NotBlank(message = "分析类型不能为空")
        String type,
        Long userId,
        JsonNode data
) {
}
