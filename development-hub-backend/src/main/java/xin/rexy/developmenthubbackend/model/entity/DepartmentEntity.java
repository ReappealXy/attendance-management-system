package xin.rexy.developmenthubbackend.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
@TableName("departments")
public class DepartmentEntity {

    @TableId
    private Long id;

    private String name;
    private Long parentId;
    private String manager;
    private Integer memberCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private LocalDateTime deletedAt;

    @TableField(exist = false)
    private List<DepartmentEntity> children;
}
