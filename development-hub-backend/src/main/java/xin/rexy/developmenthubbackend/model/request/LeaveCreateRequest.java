package xin.rexy.developmenthubbackend.model.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record LeaveCreateRequest(
        @NotBlank(message = "请假类型不能为空")
        String type,
        @NotNull(message = "开始日期不能为空")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate startDate,
        @NotNull(message = "结束日期不能为空")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate endDate,
        @NotBlank(message = "请假原因不能为空")
        String reason
) {
}
