package xin.rexy.developmenthubbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xin.rexy.developmenthubbackend.common.exception.BusinessException;
import xin.rexy.developmenthubbackend.common.util.SecurityUtils;
import xin.rexy.developmenthubbackend.mapper.CompanyConfigMapper;
import xin.rexy.developmenthubbackend.mapper.EmployeeMapper;
import xin.rexy.developmenthubbackend.model.entity.CompanyConfigEntity;
import xin.rexy.developmenthubbackend.model.entity.EmployeeEntity;
import xin.rexy.developmenthubbackend.model.request.CompanyLocationRequest;
import xin.rexy.developmenthubbackend.model.response.CompanyLocationResponse;
import xin.rexy.developmenthubbackend.security.CurrentUser;

@Service
public class CompanyConfigService {

    private static final String LOCATION_KEY = "location";

    private final CompanyConfigMapper companyConfigMapper;
    private final EmployeeMapper employeeMapper;
    private final ObjectMapper objectMapper;

    public CompanyConfigService(
            CompanyConfigMapper companyConfigMapper,
            EmployeeMapper employeeMapper,
            ObjectMapper objectMapper
    ) {
        this.companyConfigMapper = companyConfigMapper;
        this.employeeMapper = employeeMapper;
        this.objectMapper = objectMapper;
    }

    public CompanyLocationResponse getLocation() {
        CompanyConfigEntity config = companyConfigMapper.selectByConfigKey(LOCATION_KEY);
        if (config == null) {
            return new CompanyLocationResponse(29.5647, 106.2965, "重庆人文科技学院", 500, null, null);
        }
        try {
            CompanyLocationResponse response = objectMapper.readValue(config.getConfigValue(), CompanyLocationResponse.class);
            response.setUpdatedAt(config.getUpdatedAt());
            if (config.getUpdatedBy() != null) {
                EmployeeEntity updater = employeeMapper.selectActiveById(config.getUpdatedBy());
                response.setUpdatedBy(updater == null ? null : updater.getName());
            }
            return response;
        } catch (JsonProcessingException ex) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, 500, "公司配置解析失败");
        }
    }

    @Transactional
    public CompanyLocationResponse updateLocation(CompanyLocationRequest request) {
        CurrentUser currentUser = SecurityUtils.currentUser();
        if (!currentUser.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, 403, "无权限执行此操作");
        }

        CompanyConfigEntity config = companyConfigMapper.selectByConfigKey(LOCATION_KEY);
        try {
            String json = objectMapper.writeValueAsString(new CompanyLocationResponse(
                    request.latitude(),
                    request.longitude(),
                    request.name(),
                    request.radius(),
                    null,
                    null
            ));
            if (config == null) {
                config = new CompanyConfigEntity();
                config.setConfigKey(LOCATION_KEY);
                config.setConfigValue(json);
                config.setUpdatedBy(currentUser.id());
                companyConfigMapper.insert(config);
            } else {
                config.setConfigValue(json);
                config.setUpdatedBy(currentUser.id());
                companyConfigMapper.updateById(config);
            }
        } catch (JsonProcessingException ex) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, 500, "公司配置写入失败");
        }
        return getLocation();
    }
}
