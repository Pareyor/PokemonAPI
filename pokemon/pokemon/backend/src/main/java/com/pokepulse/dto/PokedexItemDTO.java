package com.pokepulse.dto;

import com.pokepulse.entity.PokemonType;

public record PokedexItemDTO(
    Integer pokedexNumber,
    String name,
    PokemonType primaryType,
    PokemonType secondaryType,
    Integer baseHp,
    Integer baseAttack,
    Integer baseDefense,
    Integer baseSpeed,
    String description,
    String imageUrl,
    boolean isOwned,
    int ownedCount,
    int highestLevel
) {}
