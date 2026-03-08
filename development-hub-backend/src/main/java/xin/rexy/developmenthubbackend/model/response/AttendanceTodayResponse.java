package xin.rexy.developmenthubbackend.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceTodayResponse {

    private Boolean hasClockedIn;
    private Boolean hasClockedOut;
    private String clockInTime;
    private String clockOutTime;
    private String status;
}
