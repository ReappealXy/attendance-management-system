package xin.rexy.developmenthubbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xin.rexy.developmenthubbackend.common.api.ApiResponse;
import xin.rexy.developmenthubbackend.model.request.LeaveTypeRequest;
import xin.rexy.developmenthubbackend.service.RuleService;

@RestController
@RequestMapping("/api/leave-types")
public class LeaveTypeController {

    private final RuleService ruleService;

    public LeaveTypeController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.ok("查询成功", ruleService.listLeaveTypes());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("创建成功", ruleService.createLeaveType(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable Long id, @Valid @RequestBody LeaveTypeRequest request) {
        return ApiResponse.ok("更新成功", ruleService.updateLeaveType(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ruleService.deleteLeaveType(id);
        return ResponseEntity.noContent().build();
    }
}
