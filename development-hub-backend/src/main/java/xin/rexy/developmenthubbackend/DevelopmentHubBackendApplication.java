package xin.rexy.developmenthubbackend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("xin.rexy.developmenthubbackend.mapper")
public class DevelopmentHubBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevelopmentHubBackendApplication.class, args);
    }

}
