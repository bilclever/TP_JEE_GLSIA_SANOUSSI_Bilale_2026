package com.ega.bank_system.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EGA Bank API")
                        .version("1.0.0")
                        .description("API de gestion bancaire EGA")
                        .contact(new Contact()
                                .name("Support EGA Bank")
                                .email("support@ega-bank.tn")
                                .url("https://www.ega-bank.tn"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://www.ega-bank.tn/terms")));
    }
}