package com.pokepulse.service;

import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;

/** Plantilla base de una carta antes de imprimirse en un sobre. */
public record CardArchetype(
    int num, String name, PokemonType type, CardRarity rarity,
    int hp, int atk, int def, int spd,
    String m1Name, int m1Dmg, String m1Desc,
    String m2Name, int m2Dmg, String m2Desc, String m2Effect
) {}
