package xin.rexy.developmenthubbackend.model.request;

import jakarta.validation.constraints.NotBlank;

public record DepartmentUpdateRequest(
        @NotBlank(message = "部门名称不能为空")
        String name,
        Long parentId,
        String manager
) {
}
