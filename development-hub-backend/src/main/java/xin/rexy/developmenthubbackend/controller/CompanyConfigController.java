package xin.rexy.developmenthubbackend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xin.rexy.developmenthubbackend.common.api.ApiResponse;
import xin.rexy.developmenthubbackend.model.request.CompanyLocationRequest;
import xin.rexy.developmenthubbackend.service.CompanyConfigService;

@RestController
@RequestMapping("/api/company-config")
public class CompanyConfigController {

    private final CompanyConfigService companyConfigService;

    public CompanyConfigController(CompanyConfigService companyConfigService) {
        this.companyConfigService = companyConfigService;
    }

    @GetMapping("/location")
    public ApiResponse<?> getLocation() {
        return ApiResponse.ok("查询成功", companyConfigService.getLocation());
    }

    @PutMapping("/location")
    public ApiResponse<?> updateLocation(@Valid @RequestBody CompanyLocationRequest request) {
        return ApiResponse.ok("公司位置已更新", companyConfigService.updateLocation(request));
    }
}
