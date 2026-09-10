package com.pokepulse.dto;

import java.time.LocalDateTime;

public record UserDTO(
    Long id,
    String username,
    String role,
    String trainerName,
    Integer coins,
    LocalDateTime createdAt
) {}
