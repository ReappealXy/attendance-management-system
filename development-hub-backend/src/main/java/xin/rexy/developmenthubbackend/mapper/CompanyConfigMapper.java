package xin.rexy.developmenthubbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import xin.rexy.developmenthubbackend.model.entity.CompanyConfigEntity;

public interface CompanyConfigMapper extends BaseMapper<CompanyConfigEntity> {

    CompanyConfigEntity selectByConfigKey(@Param("configKey") String configKey);
}
