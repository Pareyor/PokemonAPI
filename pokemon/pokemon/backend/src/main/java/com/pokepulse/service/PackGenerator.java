package com.pokepulse.service;

import com.pokepulse.entity.BoosterPackType;
import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PackSlotType;
import com.pokepulse.entity.RarityOdds;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.*;
import java.util.random.RandomGenerator;

/**
 * Decide el contenido de un sobre siguiendo la estructura de un booster físico:
 * <pre>
 *  slots 1-4  Común
 *  slots 5-7  Infrecuente
 *  slot  8    Reverse holo (común / infrecuente / rara)
 *  slot  9    Reverse holo "hit" (puede contener épicas o superiores)
 *  slot  10   Rara o superior — siempre al fondo del sobre
 * </pre>
 * Con una probabilidad baja el sobre es un "God Pack" en el que todas las cartas son Épica o superior.
 * No accede a base de datos: recibe el pool y devuelve las tiradas, así se puede testear de forma aislada.
 */
@Component
public class PackGenerator {

    public static final int CARDS_PER_PACK = 10;

    public static final RarityOdds REVERSE_HOLO_ODDS = RarityOdds.weights(550, 350, 100, 0, 0, 0);
    private static final RarityOdds GOD_PACK_ODDS = RarityOdds.weights(0, 0, 0, 620, 300, 80);
    private static final int RARE_SLOT_HOLO_PERCENT = 35;

    private static final List<PackSlotType> LAYOUT = List.of(
        PackSlotType.COMMON, PackSlotType.COMMON, PackSlotType.COMMON, PackSlotType.COMMON,
        PackSlotType.UNCOMMON, PackSlotType.UNCOMMON, PackSlotType.UNCOMMON,
        PackSlotType.REVERSE_HOLO, PackSlotType.REVERSE_HOLO_HIT,
        PackSlotType.RARE
    );

    public record Draw(int slot, PackSlotType slotType, CardArchetype archetype, CardRarity rarity, boolean holo) {}

    public record GeneratedPack(List<Draw> draws, boolean godPack, boolean pityTriggered) {}

    private final RandomGenerator random;

    public PackGenerator() {
        this(new SecureRandom());
    }

    PackGenerator(RandomGenerator random) {
        this.random = random;
    }

    /**
     * @param pityDue si el entrenador lleva demasiados sobres sin Legendaria, el slot de rara se fuerza a Legendaria
     */
    public GeneratedPack generate(BoosterPackType type, Map<CardRarity, List<CardArchetype>> pool, boolean pityDue) {
        if (pool.values().stream().allMatch(List::isEmpty)) {
            throw new IllegalStateException("No hay cartas disponibles para imprimir sobres. ¿Se ha cargado la Pokédex?");
        }
        Set<Integer> usedSpecies = new HashSet<>();

        if (random.nextInt(1000) < type.getGodPackPerThousand()) {
            List<CardRarity> rarities = new ArrayList<>();
            for (int i = 0; i < CARDS_PER_PACK; i++) rarities.add(GOD_PACK_ODDS.roll(random));
            rarities.sort(Comparator.naturalOrder()); // la mejor carta queda la última, como en un sobre real

            List<Draw> draws = new ArrayList<>();
            for (int i = 0; i < CARDS_PER_PACK; i++) {
                CardRarity rarity = rarities.get(i);
                draws.add(new Draw(i + 1, PackSlotType.GOD_PACK, pick(pool, rarity, usedSpecies), rarity, true));
            }
            return new GeneratedPack(List.copyOf(draws), true, false);
        }

        boolean pityTriggered = false;
        List<Draw> draws = new ArrayList<>();
        for (int i = 0; i < LAYOUT.size(); i++) {
            PackSlotType slotType = LAYOUT.get(i);
            CardRarity rarity = oddsFor(slotType, type).roll(random);

            if (slotType == PackSlotType.RARE && pityDue && rarity.compareTo(CardRarity.LEGENDARY) < 0) {
                rarity = CardRarity.LEGENDARY;
                pityTriggered = true;
            }

            boolean holo = switch (slotType) {
                case COMMON, UNCOMMON -> false;
                case REVERSE_HOLO, REVERSE_HOLO_HIT, GOD_PACK -> true;
                case RARE -> rarity != CardRarity.RARE || random.nextInt(100) < RARE_SLOT_HOLO_PERCENT;
            };
            draws.add(new Draw(i + 1, slotType, pick(pool, rarity, usedSpecies), rarity, holo));
        }
        return new GeneratedPack(List.copyOf(draws), false, pityTriggered);
    }

    private RarityOdds oddsFor(PackSlotType slotType, BoosterPackType type) {
        return switch (slotType) {
            case COMMON -> RarityOdds.only(CardRarity.COMMON);
            case UNCOMMON -> RarityOdds.only(CardRarity.UNCOMMON);
            case REVERSE_HOLO -> REVERSE_HOLO_ODDS;
            case REVERSE_HOLO_HIT -> type.getReverseHoloHitOdds();
            case RARE -> type.getRareSlotOdds();
            case GOD_PACK -> GOD_PACK_ODDS;
        };
    }

    /**
     * Elige una especie para la rareza pedida evitando repetir especie dentro del mismo sobre.
     * Las Secretas no tienen arquetipo propio: se imprimen sobre una Legendaria o Épica.
     * Si no hay candidatas en esa rareza se baja un escalón.
     */
    private CardArchetype pick(Map<CardRarity, List<CardArchetype>> pool, CardRarity rarity, Set<Integer> usedSpecies) {
        List<CardArchetype> candidates = new ArrayList<>();
        if (rarity == CardRarity.SECRET_RARE) {
            candidates.addAll(pool.getOrDefault(CardRarity.LEGENDARY, List.of()));
            candidates.addAll(pool.getOrDefault(CardRarity.EPIC, List.of()));
        } else {
            for (int r = rarity.ordinal(); r >= 0 && candidates.isEmpty(); r--) {
                candidates.addAll(pool.getOrDefault(CardRarity.values()[r], List.of()));
            }
        }
        if (candidates.isEmpty()) {
            pool.values().forEach(candidates::addAll);
        }

        List<CardArchetype> fresh = candidates.stream().filter(a -> !usedSpecies.contains(a.num())).toList();
        List<CardArchetype> source = fresh.isEmpty() ? candidates : fresh;
        CardArchetype chosen = source.get(random.nextInt(source.size()));
        usedSpecies.add(chosen.num());
        return chosen;
    }
}
