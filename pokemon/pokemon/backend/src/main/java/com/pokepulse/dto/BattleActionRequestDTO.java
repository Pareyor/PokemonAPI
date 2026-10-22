package com.pokepulse.dto;

import com.pokepulse.battle.BattleAction;
import jakarta.validation.constraints.NotNull;

public record BattleActionRequestDTO(
    @NotNull BattleAction action,
    // Índice del equipo al que cambiar; solo para SWITCH
    Integer switchTo
) {}
