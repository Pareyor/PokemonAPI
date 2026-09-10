package com.pokepulse.service;

import com.pokepulse.dto.BoosterPackResultDTO;
import com.pokepulse.dto.PokemonCardResponseDTO;
import com.pokepulse.entity.*;
import com.pokepulse.repository.PokemonCardRepository;
import com.pokepulse.repository.TrainerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class BoosterPackService {

    private final PokemonCardRepository cardRepository;
    private final TrainerProfileRepository profileRepository;
    private final CardService cardService;
    private final Random random = new Random();

    public BoosterPackService(PokemonCardRepository cardRepository, TrainerProfileRepository profileRepository, CardService cardService) {
        this.cardRepository = cardRepository;
        this.profileRepository = profileRepository;
        this.cardService = cardService;
    }

    private record CardArchetype(
        int num, String name, PokemonType type, CardRarity rarity,
        int hp, int atk, int def, int spd,
        String m1Name, int m1Dmg, String m1Desc,
        String m2Name, int m2Dmg, String m2Desc, String m2Effect
    ) {}

    private final List<CardArchetype> POOL = List.of(
        new CardArchetype(25, "Pikachu", PokemonType.ELECTRIC, CardRarity.UNCOMMON, 90, 75, 55, 110, "Impactrueno", 40, "Descarga eléctrica básica", "Rayo Trueno", 85, "Ataque devastador", "PARALYZE"),
        new CardArchetype(6, "Charizard", PokemonType.FIRE, CardRarity.LEGENDARY, 180, 130, 95, 100, "Garra Dragón", 65, "Ataque veloz con garras", "Llamarada Ígnea", 130, "Incendia el campo de batalla", "BURN"),
        new CardArchetype(9, "Blastoise", PokemonType.WATER, CardRarity.EPIC, 175, 105, 125, 78, "Pistola Agua", 55, "Chorro a presión", "Hidrobomba", 120, "Cañones dorsales de alta potencia", "CRITICAL"),
        new CardArchetype(3, "Venusaur", PokemonType.GRASS, CardRarity.EPIC, 170, 100, 115, 80, "Látigo Cepa", 50, "Golpe flexible con cepas", "Rayo Solar", 125, "Carga energía solar destructiva", "HEAL"),
        new CardArchetype(150, "Mewtwo", PokemonType.PSYCHIC, CardRarity.LEGENDARY, 195, 150, 90, 130, "Confusión", 70, "Ondas cerebrales cortantes", "Onda Mental Psíquica", 145, "Distorsiona la realidad", "CRITICAL"),
        new CardArchetype(94, "Gengar", PokemonType.DARK, CardRarity.RARE, 130, 115, 75, 110, "Lengüetazo", 50, "Paraliza al contacto", "Bola Sombra", 100, "Esfera de pura energía umbría", "PARALYZE"),
        new CardArchetype(149, "Dragonite", PokemonType.DRAGON, CardRarity.LEGENDARY, 185, 135, 100, 95, "Ataque Ala", 60, "Ráfaga alada potente", "Hiperrayo", 140, "Haz masivo de energía concentrada", "CRITICAL"),
        new CardArchetype(130, "Gyarados", PokemonType.WATER, CardRarity.RARE, 160, 125, 85, 85, "Mordisco", 55, "Dientes afilados", "Furia Dragón", 110, "Ráfaga marina desatada", "BURN"),
        new CardArchetype(143, "Snorlax", PokemonType.NORMAL, CardRarity.RARE, 220, 110, 85, 30, "Golpe Cuerpo", 65, "Cae con todo su peso", "Descanso Restaurador", 90, "Regenera salud al atacar", "HEAL"),
        new CardArchetype(133, "Eevee", PokemonType.NORMAL, CardRarity.COMMON, 85, 60, 60, 65, "Placaje", 35, "Embestida rápida", "Última Baza", 70, "Poder oculto de evolución", "CRITICAL"),
        new CardArchetype(448, "Lucario", PokemonType.FIGHTING, CardRarity.EPIC, 145, 120, 80, 105, "Palmeo", 55, "Golpe marcial de aura", "Esfera Aural", 115, "Proyectil inesquivable", "CRITICAL"),
        new CardArchetype(384, "Rayquaza", PokemonType.DRAGON, CardRarity.LEGENDARY, 190, 145, 95, 115, "Tajo Aéreo", 70, "Corta el viento a velocidad supersónica", "Ascenso Draco", 150, "Ataque definitivo desde la estratósfera", "CRITICAL"),
        new CardArchetype(197, "Umbreon", PokemonType.DARK, CardRarity.RARE, 150, 85, 130, 75, "Persecución", 45, "Ataque sorpresivo", "Pulso Umbrío", 95, "Onda de oscuridad resonante", "PARALYZE"),
        new CardArchetype(68, "Machamp", PokemonType.FIGHTING, CardRarity.RARE, 165, 130, 90, 65, "Golpe Kárate", 60, "Impacto con cuatro brazos", "Sumisión", 110, "Llave de combate devastadora", "CRITICAL"),
        new CardArchetype(59, "Arcanine", PokemonType.FIRE, CardRarity.RARE, 155, 115, 85, 95, "Mordisco Ígneo", 55, "Mordedura envuelta en fuego", "Velocidad Extrema", 105, "Ataque instantáneo con prioridad", "CRITICAL"),
        new CardArchetype(131, "Lapras", PokemonType.WATER, CardRarity.UNCOMMON, 175, 85, 95, 60, "Rayo Hielo", 60, "Congela el entorno", "Canto Mortal", 95, "Melodía que desestabiliza", "PARALYZE"),
        new CardArchetype(65, "Alakazam", PokemonType.PSYCHIC, CardRarity.RARE, 120, 135, 65, 120, "Psicorrayo", 65, "Haz psíquico concentrado", "Premonición", 115, "Ataque anticipado destructivo", "CRITICAL"),
        new CardArchetype(74, "Geodude", PokemonType.FIGHTING, CardRarity.COMMON, 95, 70, 95, 35, "Lanzarrocas", 40, "Lanza piedras pesadas", "Magnitud", 70, "Tiembla el suelo con fuerza", "CRITICAL"),
        new CardArchetype(1, "Bulbasaur", PokemonType.GRASS, CardRarity.COMMON, 90, 55, 60, 50, "Placaje", 35, "Embestida ágil", "Drenadoras", 65, "Roba vitalidad al rival", "HEAL"),
        new CardArchetype(4, "Charmander", PokemonType.FIRE, CardRarity.COMMON, 85, 65, 50, 65, "Arañazo", 35, "Zarpazo veloz", "Ascuas", 65, "Pequeñas llamas que queman", "BURN"),
        new CardArchetype(7, "Squirtle", PokemonType.WATER, CardRarity.COMMON, 88, 55, 70, 50, "Placaje", 35, "Golpe con caparazón", "Burbuja", 65, "Lluvia de burbujas cegadoras", "PARALYZE")
    );

    @Transactional
    public BoosterPackResultDTO openPack(String packType) {
        TrainerProfile profile = profileRepository.findFirstByOrderByIdAsc()
            .orElseGet(() -> profileRepository.save(new TrainerProfile("Ash Ketchum")));

        int cost;
        int cardCount;
        String packName;
        CardRarity minRarity;

        switch (packType.toUpperCase()) {
            case "KANTO_MASTERS" -> {
                cost = 200;
                cardCount = 4;
                packName = "Sobre Maestros de Kanto";
                minRarity = CardRarity.RARE;
            }
            case "LEGENDARY_ECLIPSE" -> {
                cost = 350;
                cardCount = 5;
                packName = "Sobre Eclipse Legendario";
                minRarity = CardRarity.EPIC;
            }
            default -> {
                cost = 100;
                cardCount = 3;
                packName = "Sobre Básico PokéPulse";
                minRarity = CardRarity.COMMON;
            }
        }

        if (profile.getCoins() < cost) {
            throw new IllegalStateException("Monedas insuficientes. Cuesta " + cost + " monedas y tienes " + profile.getCoins() + ".");
        }

        profile.setCoins(profile.getCoins() - cost);
        profile.setPacksOpened(profile.getPacksOpened() + 1);
        profileRepository.save(profile);

        List<PokemonCard> generatedCards = new ArrayList<>();

        for (int i = 0; i < cardCount; i++) {
            CardArchetype arch;
            if (i == 0 && minRarity != CardRarity.COMMON) {
                // Guaranteed rarity
                List<CardArchetype> filtered = POOL.stream()
                    .filter(a -> a.rarity.ordinal() >= minRarity.ordinal())
                    .toList();
                arch = filtered.get(random.nextInt(filtered.size()));
            } else {
                arch = POOL.get(random.nextInt(POOL.size()));
            }

            PokemonCard card = new PokemonCard();
            card.setPokedexNumber(arch.num);
            card.setName(arch.name);
            card.setType(arch.type);
            card.setRarity(arch.rarity);
            card.setHp(arch.hp);
            card.setAttack(arch.atk);
            card.setDefense(arch.def);
            card.setSpeed(arch.spd);
            card.setLevel(1);
            // 25% chance of Holo (50% if Legendary)
            card.setIsHolo(arch.rarity == CardRarity.LEGENDARY || random.nextInt(100) < 25);
            card.setImageUrl("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + arch.num + ".png");
            card.setMove1Name(arch.m1Name);
            card.setMove1Damage(arch.m1Dmg);
            card.setMove1Description(arch.m1Desc);
            card.setMove2Name(arch.m2Name);
            card.setMove2Damage(arch.m2Dmg);
            card.setMove2Description(arch.m2Desc);
            card.setMove2SpecialEffect(arch.m2Effect);
            card.setIsInDeck(false);
            card.setIsCustom(false);

            generatedCards.add(cardRepository.save(card));
        }

        List<PokemonCardResponseDTO> resultDTOs = generatedCards.stream().map(cardService::mapToDTO).toList();
        return new BoosterPackResultDTO(packName, cost, profile.getCoins(), resultDTOs);
    }
}
