package com.pokepulse.dto;

import com.pokepulse.battle.StatusCondition;
import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;

/** Pokémon en combate tal como lo ve el jugador. Los del rival aún no revelados llegan con revealed=false y sin datos. */
public record CombatantDTO(
    boolean revealed,
    Long cardId,
    Integer pokedexNumber,
    String name,
    PokemonType type,
    CardRarity rarity,
    Boolean holo,
    String imageUrl,
    Integer level,
    int hp,
    int maxHp,
    Integer attack,
    Integer defense,
    Integer speed,
    String move1Name,
    Integer move1Power,
    String move2Name,
    Integer move2Power,
    String move2Effect,
    StatusCondition status
) {}
