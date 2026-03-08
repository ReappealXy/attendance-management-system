package xin.rexy.developmenthubbackend.controller;

import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xin.rexy.developmenthubbackend.common.api.ApiResponse;
import xin.rexy.developmenthubbackend.model.request.ClockActionRequest;
import xin.rexy.developmenthubbackend.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/clock-in")
    public ResponseEntity<ApiResponse<?>> clockIn(@Valid @RequestBody ClockActionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("签到成功", attendanceService.clockIn(request)));
    }

    @PostMapping("/clock-out")
    public ApiResponse<?> clockOut(@Valid @RequestBody ClockActionRequest request) {
        return ApiResponse.ok("签退成功", attendanceService.clockOut(request));
    }

    @GetMapping("/today")
    public ApiResponse<?> today() {
        return ApiResponse.ok("查询成功", attendanceService.getToday());
    }

    @GetMapping("/my")
    public ApiResponse<?> myRecords(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "15") long pageSize,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.ok("查询成功", attendanceService.getMyRecords(page, pageSize, startDate, endDate, status));
    }

    @GetMapping
    public ApiResponse<?> allRecords(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "15") long pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.ok("查询成功", attendanceService.getAllRecords(page, pageSize, userId, department, startDate, endDate, status));
    }
}
