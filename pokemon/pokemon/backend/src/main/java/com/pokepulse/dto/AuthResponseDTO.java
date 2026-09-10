package com.pokepulse.dto;

public record AuthResponseDTO(
    String token,
    Long id,
    String username,
    String role,
    String trainerName,
    Integer coins
) {}
