package xin.rexy.developmenthubbackend.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Data;

@Data
@TableName("attendance_records")
public class AttendanceRecordEntity {

    @TableId
    private Long id;

    private Long userId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime clockIn;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime clockOut;

    private String status;
    private Double clockInLat;
    private Double clockInLng;
    private Double clockOutLat;
    private Double clockOutLng;
    private String remark;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField(exist = false)
    private String userName;

    @TableField(exist = false)
    private String department;

    @TableField(exist = false)
    private LocationPoint clockInLocation;

    @TableField(exist = false)
    private LocationPoint clockOutLocation;

    @TableField(exist = false)
    private Integer distance;

    @TableField(exist = false)
    private Boolean isLate;

    @TableField(exist = false)
    private Boolean isEarly;
}
