package com.pokepulse.dto;

import java.util.List;

public record BattleOpponentDTO(
    String id,
    String name,
    String title,
    String avatarUrl,
    String difficulty,
    int rewardCoins,
    List<PokemonCardResponseDTO> team
) {}
