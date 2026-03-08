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
import xin.rexy.developmenthubbackend.model.request.AttendanceRuleRequest;
import xin.rexy.developmenthubbackend.service.RuleService;

@RestController
@RequestMapping("/api/attendance-rules")
public class AttendanceRuleController {

    private final RuleService ruleService;

    public AttendanceRuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.ok("查询成功", ruleService.listRules());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody AttendanceRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("创建成功", ruleService.createRule(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable Long id, @Valid @RequestBody AttendanceRuleRequest request) {
        return ApiResponse.ok("更新成功", ruleService.updateRule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ruleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
}
