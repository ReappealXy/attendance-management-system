package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.constraints.NotNull;

public record ClockActionRequest(
        @NotNull(message = "纬度不能为空")
        Double latitude,
        @NotNull(message = "经度不能为空")
        Double longitude
) {
}
