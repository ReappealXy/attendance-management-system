package xin.rexy.developmenthubbackend.model.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Data;

@Data
@TableName("attendance_rules")
public class AttendanceRuleEntity {

    @TableId
    private Long id;
    private String name;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime clockInTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime clockOutTime;

    private Integer lateThreshold;
    private Integer earlyThreshold;
    private Boolean isDefault;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
