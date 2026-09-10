package com.pokepulse.dto;

public record UpdateUserDTO(
    String username,
    String password, // opcional: solo si se desea cambiar
    String trainerName,
    String role,     // "USER" o "ADMIN"
    Integer coins
) {}
