package com.pokepulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BattleStartRequestDTO(
    @NotBlank String opponentId,
    @NotEmpty @Size(max = 6, message = "El equipo admite como máximo 6 cartas") List<Long> cardIds
) {}
