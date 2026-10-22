package com.pokepulse.battle;

import com.pokepulse.entity.PokemonType;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

import static com.pokepulse.entity.PokemonType.*;

/**
 * Tabla de tipos de los juegos principales (generación 6+), suavizada para un juego de cartas de un solo tipo:
 * súper eficaz ×1.5, poco eficaz ×0.7 y las inmunidades se convierten en ×0.4 para que ningún Pokémon quede inútil.
 */
public final class TypeChart {

    public static final double SUPER_EFFECTIVE = 1.5;
    public static final double NOT_VERY_EFFECTIVE = 0.7;
    public static final double IMMUNE = 0.4;

    private static final Map<PokemonType, Set<PokemonType>> STRONG = new EnumMap<>(PokemonType.class);
    private static final Map<PokemonType, Set<PokemonType>> WEAK = new EnumMap<>(PokemonType.class);
    private static final Map<PokemonType, Set<PokemonType>> NONE = new EnumMap<>(PokemonType.class);

    static {
        rule(NORMAL,   Set.of(),                                   Set.of(ROCK, STEEL),                                   Set.of(GHOST));
        rule(FIRE,     Set.of(GRASS, ICE, BUG, STEEL),             Set.of(FIRE, WATER, ROCK, DRAGON),                     Set.of());
        rule(WATER,    Set.of(FIRE, GROUND, ROCK),                 Set.of(WATER, GRASS, DRAGON),                          Set.of());
        rule(ELECTRIC, Set.of(WATER, FLYING),                      Set.of(ELECTRIC, GRASS, DRAGON),                       Set.of(GROUND));
        rule(GRASS,    Set.of(WATER, GROUND, ROCK),                Set.of(FIRE, GRASS, POISON, FLYING, BUG, DRAGON, STEEL), Set.of());
        rule(ICE,      Set.of(GRASS, GROUND, FLYING, DRAGON),      Set.of(FIRE, WATER, ICE, STEEL),                       Set.of());
        rule(FIGHTING, Set.of(NORMAL, ICE, ROCK, DARK, STEEL),     Set.of(POISON, FLYING, PSYCHIC, BUG, FAIRY),           Set.of(GHOST));
        rule(POISON,   Set.of(GRASS, FAIRY),                       Set.of(POISON, GROUND, ROCK, GHOST),                   Set.of(STEEL));
        rule(GROUND,   Set.of(FIRE, ELECTRIC, POISON, ROCK, STEEL), Set.of(GRASS, BUG),                                   Set.of(FLYING));
        rule(FLYING,   Set.of(GRASS, FIGHTING, BUG),               Set.of(ELECTRIC, ROCK, STEEL),                         Set.of());
        rule(PSYCHIC,  Set.of(FIGHTING, POISON),                   Set.of(PSYCHIC, STEEL),                                Set.of(DARK));
        rule(BUG,      Set.of(GRASS, PSYCHIC, DARK),               Set.of(FIRE, FIGHTING, POISON, FLYING, GHOST, STEEL, FAIRY), Set.of());
        rule(ROCK,     Set.of(FIRE, ICE, FLYING, BUG),             Set.of(FIGHTING, GROUND, STEEL),                       Set.of());
        rule(GHOST,    Set.of(PSYCHIC, GHOST),                     Set.of(DARK),                                          Set.of(NORMAL));
        rule(DRAGON,   Set.of(DRAGON),                             Set.of(STEEL),                                         Set.of(FAIRY));
        rule(DARK,     Set.of(PSYCHIC, GHOST),                     Set.of(FIGHTING, DARK, FAIRY),                         Set.of());
        rule(STEEL,    Set.of(ICE, ROCK, FAIRY),                   Set.of(FIRE, WATER, ELECTRIC, STEEL),                  Set.of());
        rule(FAIRY,    Set.of(FIGHTING, DRAGON, DARK),             Set.of(FIRE, POISON, STEEL),                           Set.of());
    }

    private TypeChart() {}

    private static void rule(PokemonType attacker, Set<PokemonType> strong, Set<PokemonType> weak, Set<PokemonType> none) {
        STRONG.put(attacker, strong);
        WEAK.put(attacker, weak);
        NONE.put(attacker, none);
    }

    public static double multiplier(PokemonType attacker, PokemonType defender) {
        if (attacker == null || defender == null) return 1.0;
        if (STRONG.get(attacker).contains(defender)) return SUPER_EFFECTIVE;
        if (NONE.get(attacker).contains(defender)) return IMMUNE;
        if (WEAK.get(attacker).contains(defender)) return NOT_VERY_EFFECTIVE;
        return 1.0;
    }
}
