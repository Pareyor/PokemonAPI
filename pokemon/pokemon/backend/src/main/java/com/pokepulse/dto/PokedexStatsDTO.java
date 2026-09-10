package com.pokepulse.dto;

public record PokedexStatsDTO(
    int totalSpecies,
    int ownedSpecies,
    int missingSpecies,
    double completionPercentage
) {}
