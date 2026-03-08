package xin.rexy.developmenthubbackend.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("employees")
public class EmployeeEntity {

    @TableId
    private Long id;

    private String username;

    @JsonIgnore
    private String password;

    private String name;
    private String role;
    private Long deptId;
    private String department;
    private String position;
    private String employeeId;
    private String phone;
    private String email;
    private String avatar;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joinDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonIgnore
    private LocalDateTime deletedAt;
}
