package xin.rexy.developmenthubbackend.controller;

import java.time.LocalDate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xin.rexy.developmenthubbackend.common.api.ApiResponse;
import xin.rexy.developmenthubbackend.service.StatisticsService;
import xin.rexy.developmenthubbackend.service.StatisticsService.ExportFile;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/personal")
    public ApiResponse<?> personal(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return ApiResponse.ok("查询成功", statisticsService.getPersonalStats(userId, year, month));
    }

    @GetMapping("/departments")
    public ApiResponse<?> departments(@RequestParam(required = false) LocalDate date) {
        return ApiResponse.ok("查询成功", statisticsService.getDepartmentStats(date));
    }

    @GetMapping("/dashboard")
    public ApiResponse<?> dashboard() {
        return ApiResponse.ok("查询成功", statisticsService.getDashboard());
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String format
    ) {
        ExportFile exportFile = statisticsService.exportReport(year, month, department, format);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, exportFile.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + exportFile.fileName() + "\"")
                .body(exportFile.content());
    }
}
