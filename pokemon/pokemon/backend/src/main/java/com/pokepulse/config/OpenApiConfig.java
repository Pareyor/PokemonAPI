package com.pokepulse.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("PokéPulse TCG & Battle Arena API")
                .version("1.0.0")
                .description("API REST para la gestión de cartas Pokémon, apertura de sobres con animaciones, forjado de cartas personalizadas y arena de combates elementales.")
                .contact(new Contact().name("Profesor Oak").email("oak@pokepulse.local")));
    }
}
