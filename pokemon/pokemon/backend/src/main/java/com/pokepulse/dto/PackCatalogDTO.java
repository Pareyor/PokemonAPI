package com.pokepulse.dto;

import com.pokepulse.entity.BoosterPackType;

import java.util.List;

/** Ficha pública de una expansión, incluidas sus probabilidades (publicarlas es obligatorio en muchos mercados). */
public record PackCatalogDTO(
    BoosterPackType id,
    String name,
    String description,
    int cost,
    int cardCount,
    int mascotPokedexNumber,
    String accentColor,
    double godPackChance,
    int pityThreshold,
    int packsUntilPity,
    List<PackSlotOddsDTO> slots
) {}
