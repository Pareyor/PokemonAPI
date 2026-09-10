package com.pokepulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 30, message = "El usuario debe tener entre 3 y 30 caracteres")
    String username,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 4, max = 50, message = "La contraseña debe tener al menos 4 caracteres")
    String password,

    @NotBlank(message = "El nombre de entrenador es obligatorio")
    String trainerName
) {}
