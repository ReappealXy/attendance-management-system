package xin.rexy.developmenthubbackend.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String tokenType;
    private long expiresIn;
    private EmployeeEntity user;
}
