package com.pokepulse.entity;

import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.random.RandomGenerator;

/**
 * Tabla de probabilidades de rareza para un slot de sobre, expresada en pesos enteros
 * (por mil) para evitar errores de redondeo con decimales.
 */
public final class RarityOdds {

    private final Map<CardRarity, Integer> weights;
    private final int total;

    private RarityOdds(Map<CardRarity, Integer> weights) {
        this.weights = Collections.unmodifiableMap(weights);
        this.total = weights.values().stream().mapToInt(Integer::intValue).sum();
        if (total <= 0) {
            throw new IllegalArgumentException("Una tabla de rarezas necesita al menos un peso positivo");
        }
    }

    /** Pesos en el orden de {@link CardRarity}: común, infrecuente, rara, épica, legendaria, secreta. */
    public static RarityOdds weights(int common, int uncommon, int rare, int epic, int legendary, int secretRare) {
        Map<CardRarity, Integer> map = new EnumMap<>(CardRarity.class);
        put(map, CardRarity.COMMON, common);
        put(map, CardRarity.UNCOMMON, uncommon);
        put(map, CardRarity.RARE, rare);
        put(map, CardRarity.EPIC, epic);
        put(map, CardRarity.LEGENDARY, legendary);
        put(map, CardRarity.SECRET_RARE, secretRare);
        return new RarityOdds(map);
    }

    public static RarityOdds only(CardRarity rarity) {
        Map<CardRarity, Integer> map = new EnumMap<>(CardRarity.class);
        map.put(rarity, 1);
        return new RarityOdds(map);
    }

    private static void put(Map<CardRarity, Integer> map, CardRarity rarity, int weight) {
        if (weight < 0) throw new IllegalArgumentException("Peso negativo para " + rarity);
        if (weight > 0) map.put(rarity, weight);
    }

    public CardRarity roll(RandomGenerator random) {
        int ticket = random.nextInt(total);
        for (Map.Entry<CardRarity, Integer> entry : weights.entrySet()) {
            ticket -= entry.getValue();
            if (ticket < 0) return entry.getKey();
        }
        throw new IllegalStateException("Tabla de rarezas inconsistente");
    }

    /** Probabilidad (0-100, con dos decimales) de cada rareza, para publicarla en el catálogo. */
    public Map<CardRarity, Double> percentages() {
        Map<CardRarity, Double> result = new LinkedHashMap<>();
        weights.forEach((rarity, weight) -> result.put(rarity, Math.round(weight * 10000.0 / total) / 100.0));
        return result;
    }
}
