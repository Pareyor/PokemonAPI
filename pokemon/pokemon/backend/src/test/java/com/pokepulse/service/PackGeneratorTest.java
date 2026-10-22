package com.pokepulse.service;

import com.pokepulse.entity.BoosterPackType;
import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PackSlotType;
import com.pokepulse.entity.PokemonType;
import org.junit.jupiter.api.Test;

import java.util.*;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

class PackGeneratorTest {

    private static final Map<CardRarity, List<CardArchetype>> POOL = buildPool();

    private static Map<CardRarity, List<CardArchetype>> buildPool() {
        Map<CardRarity, List<CardArchetype>> pool = new EnumMap<>(CardRarity.class);
        int num = 1;
        for (CardRarity rarity : List.of(CardRarity.COMMON, CardRarity.UNCOMMON, CardRarity.RARE, CardRarity.EPIC, CardRarity.LEGENDARY)) {
            List<CardArchetype> list = new ArrayList<>();
            for (int i = 0; i < 20; i++, num++) {
                list.add(new CardArchetype(num, "Poke" + num, PokemonType.NORMAL, rarity, 100, 50, 50, 50,
                    "A", 10, "", "B", 20, "", "HEAL"));
            }
            pool.put(rarity, list);
        }
        return pool;
    }

    private static List<PackGenerator.GeneratedPack> openMany(BoosterPackType type, int count, long seed) {
        PackGenerator generator = new PackGenerator(new Random(seed));
        return IntStream.range(0, count).mapToObj(i -> generator.generate(type, POOL, false)).toList();
    }

    @Test
    void regularPackFollowsBoosterLayout() {
        for (PackGenerator.GeneratedPack pack : openMany(BoosterPackType.BASIC, 500, 1)) {
            if (pack.godPack()) continue;
            List<PackGenerator.Draw> draws = pack.draws();
            assertEquals(PackGenerator.CARDS_PER_PACK, draws.size());
            for (int i = 0; i < 4; i++) assertEquals(CardRarity.COMMON, draws.get(i).rarity());
            for (int i = 4; i < 7; i++) assertEquals(CardRarity.UNCOMMON, draws.get(i).rarity());
            assertTrue(draws.get(7).holo(), "el slot 8 es reverse holo");
            assertTrue(draws.get(8).holo(), "el slot 9 es reverse holo");
            assertEquals(PackSlotType.RARE, draws.get(9).slotType());
            assertTrue(draws.get(9).rarity().compareTo(CardRarity.RARE) >= 0, "la última carta es rara o superior");
        }
    }

    @Test
    void noRepeatedSpeciesInsideAPack() {
        for (PackGenerator.GeneratedPack pack : openMany(BoosterPackType.KANTO_MASTERS, 500, 2)) {
            Set<Integer> species = new HashSet<>();
            pack.draws().forEach(d -> assertTrue(species.add(d.archetype().num()), "especie repetida en el sobre"));
        }
    }

    @Test
    void legendaryEclipseNeverPutsLessThanEpicInRareSlot() {
        for (PackGenerator.GeneratedPack pack : openMany(BoosterPackType.LEGENDARY_ECLIPSE, 1000, 3)) {
            assertTrue(pack.draws().get(9).rarity().compareTo(CardRarity.EPIC) >= 0);
        }
    }

    @Test
    void pityForcesLegendaryInRareSlot() {
        PackGenerator generator = new PackGenerator(new Random(4));
        for (int i = 0; i < 300; i++) {
            PackGenerator.GeneratedPack pack = generator.generate(BoosterPackType.BASIC, POOL, true);
            assertTrue(pack.draws().get(9).rarity().compareTo(CardRarity.LEGENDARY) >= 0);
        }
    }

    @Test
    void godPackIsAllEpicOrBetterAndSortedBestLast() {
        List<PackGenerator.GeneratedPack> godPacks = openMany(BoosterPackType.LEGENDARY_ECLIPSE, 3000, 5).stream()
            .filter(PackGenerator.GeneratedPack::godPack).toList();
        assertFalse(godPacks.isEmpty(), "con un 2% deberían salir god packs en 3000 aperturas");
        for (PackGenerator.GeneratedPack pack : godPacks) {
            CardRarity previous = CardRarity.COMMON;
            for (PackGenerator.Draw draw : pack.draws()) {
                assertTrue(draw.rarity().compareTo(CardRarity.EPIC) >= 0);
                assertTrue(draw.rarity().compareTo(previous) >= 0, "ordenadas de menor a mayor rareza");
                previous = draw.rarity();
            }
        }
    }

    @Test
    void rareSlotOddsMatchPublishedPercentages() {
        int packs = 20000;
        Map<CardRarity, Integer> counts = new EnumMap<>(CardRarity.class);
        openMany(BoosterPackType.BASIC, packs, 6).stream()
            .filter(p -> !p.godPack())
            .forEach(p -> counts.merge(p.draws().get(9).rarity(), 1, Integer::sum));
        int total = counts.values().stream().mapToInt(Integer::intValue).sum();

        BoosterPackType.BASIC.getRareSlotOdds().percentages().forEach((rarity, expected) -> {
            double actual = counts.getOrDefault(rarity, 0) * 100.0 / total;
            assertEquals(expected, actual, 1.5, "probabilidad de " + rarity);
        });
    }

    @Test
    void secretRareIsPrintedOnLegendaryOrEpicSpecies() {
        Set<Integer> highTier = new HashSet<>();
        POOL.get(CardRarity.EPIC).forEach(a -> highTier.add(a.num()));
        POOL.get(CardRarity.LEGENDARY).forEach(a -> highTier.add(a.num()));
        openMany(BoosterPackType.LEGENDARY_ECLIPSE, 3000, 7).stream()
            .flatMap(p -> p.draws().stream())
            .filter(d -> d.rarity() == CardRarity.SECRET_RARE)
            .forEach(d -> assertTrue(highTier.contains(d.archetype().num())));
    }
}
