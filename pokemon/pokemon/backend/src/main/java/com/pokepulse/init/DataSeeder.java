package com.pokepulse.init;

import com.pokepulse.entity.*;
import com.pokepulse.repository.PokedexEntryRepository;
import com.pokepulse.repository.PokemonCardRepository;
import com.pokepulse.repository.TrainerProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PokemonCardRepository cardRepository;
    private final TrainerProfileRepository profileRepository;
    private final PokedexEntryRepository pokedexRepository;

    public DataSeeder(PokemonCardRepository cardRepository,
                      TrainerProfileRepository profileRepository,
                      PokedexEntryRepository pokedexRepository) {
        this.cardRepository = cardRepository;
        this.profileRepository = profileRepository;
        this.pokedexRepository = pokedexRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Trainer Profile
        if (profileRepository.count() == 0) {
            TrainerProfile profile = new TrainerProfile("Ash Ketchum");
            profile.setCoins(500);
            profileRepository.save(profile);
            log.info("Perfil de entrenador creado: Ash Ketchum con 500 PokéMonedas.");
        }

        // 2. Seed All 151 Pokédex Entries
        if (pokedexRepository.count() == 0) {
            List<PokedexEntry> gen1 = PokedexData.getGen1Entries();
            pokedexRepository.saveAll(gen1);
            log.info("Catálogo Pokédex Nacional inicializado con {} especies.", gen1.size());
        }

        // 3. Seed Starter Cards in collection
        if (cardRepository.count() > 0) {
            log.info("Colección de cartas ya inicializada. Total: {}", cardRepository.count());
            return;
        }

        log.info("Cargando cartas iniciales de PokéPulse TCG...");

        seedCard(25, "Pikachu", PokemonType.ELECTRIC, CardRarity.UNCOMMON, 95, 80, 60, 115, true,
            "Impactrueno", 45, "Descarga que electrifica al rival",
            "Rayo Trueno", 90, "Rayo descomunal de 100,000 voltios", "PARALYZE", true);

        seedCard(6, "Charizard", PokemonType.FIRE, CardRarity.LEGENDARY, 185, 135, 95, 100, true,
            "Garra Dragón", 70, "Corta con garras afiladas envueltas en llamas",
            "Llamarada Ígnea", 135, "Vórtice ardiente de magma puro", "BURN", true);

        seedCard(9, "Blastoise", PokemonType.WATER, CardRarity.EPIC, 180, 110, 130, 78, true,
            "Pistola Agua", 55, "Chorro hiperbárico a presión",
            "Hidrobomba", 125, "Disparo simultáneo desde cañones de acero", "CRITICAL", true);

        seedCard(3, "Venusaur", PokemonType.GRASS, CardRarity.EPIC, 175, 105, 120, 80, false,
            "Látigo Cepa", 50, "Azote veloz con látigos de hiedra",
            "Rayo Solar", 130, "Condensa luz solar para devastar", "HEAL", false);

        seedCard(94, "Gengar", PokemonType.DARK, CardRarity.RARE, 135, 120, 75, 110, true,
            "Lengüetazo", 50, "Causa parálisis gélida",
            "Bola Sombra", 105, "Esfera de pura energía tenebrosa", "PARALYZE", false);

        seedCard(143, "Snorlax", PokemonType.NORMAL, CardRarity.RARE, 230, 115, 90, 30, false,
            "Golpe Cuerpo", 65, "Aplasta al objetivo con peso masivo",
            "Descanso Sanador", 95, "Recupera vitalidad mientras ataca", "HEAL", false);

        seedCard(448, "Lucario", PokemonType.FIGHTING, CardRarity.EPIC, 150, 125, 85, 105, true,
            "Palmeo", 60, "Impacto de fuerza cinética",
            "Esfera Aural", 120, "Aura ineludible que impacta siempre", "CRITICAL", false);

        seedCard(133, "Eevee", PokemonType.NORMAL, CardRarity.COMMON, 90, 60, 65, 70, false,
            "Placaje Veloz", 40, "Embestida ágil",
            "Última Baza", 75, "Poder latente de evolución", "CRITICAL", false);

        seedCard(149, "Dragonite", PokemonType.DRAGON, CardRarity.LEGENDARY, 190, 140, 105, 95, true,
            "Ataque Ala", 65, "Ráfaga supersónica",
            "Hiperrayo", 145, "Columna de energía destructiva", "CRITICAL", false);

        seedCard(150, "Mewtwo", PokemonType.PSYCHIC, CardRarity.LEGENDARY, 200, 155, 95, 135, true,
            "Confusión Psíquica", 75, "Ondas telequinéticas penetrantes",
            "Onda Mental", 150, "Explosión psíquica que fractura el entorno", "CRITICAL", false);

        log.info("Colección inicial cargada exitosamente. Total cartas: {}", cardRepository.count());
    }

    private void seedCard(
        int num, String name, PokemonType type, CardRarity rarity,
        int hp, int atk, int def, int spd, boolean holo,
        String m1Name, int m1Dmg, String m1Desc,
        String m2Name, int m2Dmg, String m2Desc, String m2Effect,
        boolean inDeck
    ) {
        PokemonCard card = new PokemonCard();
        card.setPokedexNumber(num);
        card.setName(name);
        card.setType(type);
        card.setRarity(rarity);
        card.setHp(hp);
        card.setAttack(atk);
        card.setDefense(def);
        card.setSpeed(spd);
        card.setLevel(1);
        card.setIsHolo(holo);
        card.setImageUrl("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + num + ".png");
        card.setMove1Name(m1Name);
        card.setMove1Damage(m1Dmg);
        card.setMove1Description(m1Desc);
        card.setMove2Name(m2Name);
        card.setMove2Damage(m2Dmg);
        card.setMove2Description(m2Desc);
        card.setMove2SpecialEffect(m2Effect);
        card.setIsInDeck(inDeck);
        card.setIsCustom(false);
        cardRepository.save(card);
    }
}
