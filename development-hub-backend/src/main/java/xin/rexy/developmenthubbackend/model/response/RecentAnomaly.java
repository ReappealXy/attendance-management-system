package xin.rexy.developmenthubbackend.model.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import lombok.Data;

@Data
public class RecentAnomaly {

    private Long userId;
    private String userName;
    private String department;
    private String type;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String detail;
}
