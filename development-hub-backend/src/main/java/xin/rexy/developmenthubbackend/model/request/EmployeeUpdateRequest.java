package xin.rexy.developmenthubbackend.model.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public record EmployeeUpdateRequest(
        String name,
        String department,
        String position,
        String phone,
        String email,
        String avatar,
        String role,
        String password,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate joinDate
) {
}
