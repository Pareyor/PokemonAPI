package com.pokepulse.config;

import com.pokepulse.security.CurrentUser;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    static {
        // El usuario se resuelve desde la cabecera Authorization, no es un parámetro que deba rellenarse en Swagger
        SpringDocUtils.getConfig().addAnnotationsToIgnore(CurrentUser.class);
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("PokéPulse TCG & Battle Arena API")
                .version("2.0.0")
                .description("API REST de cartas Pokémon: colección por usuario, sobres estilo TCG con probabilidades publicadas "
                    + "y arena de combates. Inicia sesión en /api/auth/login y pulsa Authorize con el token recibido.")
                .contact(new Contact().name("Profesor Oak").email("oak@pokepulse.local")))
            .components(new Components().addSecuritySchemes(BEARER,
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer")))
            .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}
