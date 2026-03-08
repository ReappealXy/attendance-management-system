package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CompanyLocationRequest(
        @NotNull(message = "纬度不能为空")
        Double latitude,
        @NotNull(message = "经度不能为空")
        Double longitude,
        @NotBlank(message = "地点名称不能为空")
        String name,
        @NotNull(message = "打卡范围不能为空")
        Integer radius
) {
}
