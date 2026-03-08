package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LeaveTypeRequest(
        @NotBlank(message = "假期名称不能为空")
        String name,
        @NotNull(message = "最大天数不能为空")
        Integer maxDays,
        Boolean requireApproval
) {
}
