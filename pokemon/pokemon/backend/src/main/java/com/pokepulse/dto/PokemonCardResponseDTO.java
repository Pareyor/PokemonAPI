package com.pokepulse.dto;

import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;
import java.time.LocalDateTime;

public record PokemonCardResponseDTO(
    Long id,
    Integer pokedexNumber,
    String name,
    PokemonType type,
    CardRarity rarity,
    Integer hp,
    Integer attack,
    Integer defense,
    Integer speed,
    Integer level,
    Boolean isHolo,
    String imageUrl,
    String move1Name,
    Integer move1Damage,
    String move1Description,
    String move2Name,
    Integer move2Damage,
    String move2Description,
    String move2SpecialEffect,
    Boolean isInDeck,
    Boolean isCustom,
    LocalDateTime createdAt
) {}
