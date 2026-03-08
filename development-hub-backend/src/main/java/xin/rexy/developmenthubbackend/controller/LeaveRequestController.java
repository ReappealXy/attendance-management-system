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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xin.rexy.developmenthubbackend.common.api.ApiResponse;
import xin.rexy.developmenthubbackend.model.request.ApprovalActionRequest;
import xin.rexy.developmenthubbackend.model.request.LeaveCreateRequest;
import xin.rexy.developmenthubbackend.service.LeaveRequestService;

@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping
    public ApiResponse<?> list(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "15") long pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long userId
    ) {
        return ApiResponse.ok("查询成功", leaveRequestService.list(page, pageSize, status, type, userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return ApiResponse.ok("查询成功", leaveRequestService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody LeaveCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("申请提交成功", leaveRequestService.create(request)));
    }

    @PutMapping("/{id}/approve")
    public ApiResponse<?> approve(@PathVariable Long id, @RequestBody(required = false) ApprovalActionRequest request) {
        return ApiResponse.ok("审批通过", leaveRequestService.approve(id, request == null ? null : request.comment()));
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<?> reject(@PathVariable Long id, @RequestBody(required = false) ApprovalActionRequest request) {
        return ApiResponse.ok("已驳回", leaveRequestService.reject(id, request == null ? null : request.comment()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        leaveRequestService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
