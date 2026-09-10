package com.pokepulse.dto;

import java.util.List;

public record BoosterPackResultDTO(
    String packName,
    int coinsSpent,
    int coinsRemaining,
    List<PokemonCardResponseDTO> cardsObtained
) {}
