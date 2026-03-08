package xin.rexy.developmenthubbackend.model.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record AttendanceRuleRequest(
        @NotBlank(message = "规则名称不能为空")
        String name,
        @NotNull(message = "上班时间不能为空")
        @JsonFormat(pattern = "HH:mm")
        LocalTime clockInTime,
        @NotNull(message = "下班时间不能为空")
        @JsonFormat(pattern = "HH:mm")
        LocalTime clockOutTime,
        Integer lateThreshold,
        Integer earlyThreshold,
        Boolean isDefault
) {
}
