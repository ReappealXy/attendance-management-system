package xin.rexy.developmenthubbackend.model.response;

import lombok.Data;

@Data
public class DepartmentStatsResponse {

    private String department;
    private Integer total;
    private Integer present;
    private Integer late;
    private Integer absent;
    private Double rate;
}
