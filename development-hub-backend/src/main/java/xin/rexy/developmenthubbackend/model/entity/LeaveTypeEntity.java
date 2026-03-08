package xin.rexy.developmenthubbackend.model.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("leave_types")
public class LeaveTypeEntity {

    @TableId
    private Long id;
    private String name;
    private Integer maxDays;
    private Boolean requireApproval;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
