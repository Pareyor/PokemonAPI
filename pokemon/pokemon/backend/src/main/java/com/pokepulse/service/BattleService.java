package com.pokepulse.service;

import com.pokepulse.dto.BattleOpponentDTO;
import com.pokepulse.dto.PokemonCardResponseDTO;
import com.pokepulse.entity.*;
import com.pokepulse.repository.BattleRecordRepository;
import com.pokepulse.repository.TrainerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BattleService {

    private final BattleRecordRepository battleRepository;
    private final TrainerProfileRepository profileRepository;

    public BattleService(BattleRecordRepository battleRepository, TrainerProfileRepository profileRepository) {
        this.battleRepository = battleRepository;
        this.profileRepository = profileRepository;
    }

    public List<BattleOpponentDTO> getOpponents() {
        return List.of(
            new BattleOpponentDTO(
                "brock",
                "Líder Brock",
                "Líder del Gimnasio Plateada (Tipo Roca)",
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/brock.png",
                "FÁCIL",
                100,
                List.of(
                    createOpponentCard(74, "Geodude", PokemonType.FIGHTING, CardRarity.COMMON, 100, 70, 90, 40, "Lanzarrocas", 40, "Magnitud", 70, "CRITICAL"),
                    createOpponentCard(95, "Onix", PokemonType.FIGHTING, CardRarity.UNCOMMON, 140, 80, 120, 50, "Atadura", 45, "Avalancha Rocosa", 85, "PARALYZE"),
                    createOpponentCard(76, "Golem", PokemonType.FIGHTING, CardRarity.RARE, 160, 110, 110, 45, "Desenrollar", 55, "Terremoto Sísmico", 115, "CRITICAL")
                )
            ),
            new BattleOpponentDTO(
                "blaine",
                "Líder Blaine",
                "Maestro del Fuego de Isla Canela",
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/blaine.png",
                "MEDIA",
                180,
                List.of(
                    createOpponentCard(78, "Rapidash", PokemonType.FIRE, CardRarity.UNCOMMON, 130, 95, 75, 115, "Ascuas", 50, "Rueda Fuego", 85, "BURN"),
                    createOpponentCard(59, "Arcanine", PokemonType.FIRE, CardRarity.RARE, 160, 120, 85, 95, "Colmillo Ígneo", 60, "Velocidad Extrema", 105, "CRITICAL"),
                    createOpponentCard(126, "Magmar", PokemonType.FIRE, CardRarity.RARE, 150, 115, 70, 90, "Puño Fuego", 55, "Lanzallamas", 110, "BURN")
                )
            ),
            new BattleOpponentDTO(
                "blue",
                "Rival Azul",
                "Campeón de la Liga Pokémon de Kanto",
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/blue.png",
                "DIFÍCIL",
                250,
                List.of(
                    createOpponentCard(18, "Pidgeot", PokemonType.NORMAL, CardRarity.RARE, 150, 100, 85, 110, "Ataque Rápido", 50, "Vendaval Alado", 100, "CRITICAL"),
                    createOpponentCard(65, "Alakazam", PokemonType.PSYCHIC, CardRarity.RARE, 130, 140, 60, 120, "Confusión", 60, "Psíquico Supremo", 120, "PARALYZE"),
                    createOpponentCard(9, "Blastoise", PokemonType.WATER, CardRarity.EPIC, 180, 115, 120, 80, "Pistola Agua", 55, "Hidrobomba Titánica", 130, "CRITICAL")
                )
            ),
            new BattleOpponentDTO(
                "cynthia",
                "Campeona Cynthia",
                "Legendaria Campeona de Sinnoh",
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/cynthia.png",
                "EXTREMA",
                400,
                List.of(
                    createOpponentCard(442, "Spiritomb", PokemonType.DARK, CardRarity.RARE, 160, 110, 120, 50, "Viento Aciago", 60, "Pulso Sombrío", 110, "PARALYZE"),
                    createOpponentCard(448, "Lucario", PokemonType.FIGHTING, CardRarity.EPIC, 165, 130, 85, 110, "Velocidad Extrema", 65, "Esfera Aural Devastadora", 125, "CRITICAL"),
                    createOpponentCard(445, "Garchomp", PokemonType.DRAGON, CardRarity.LEGENDARY, 200, 150, 105, 115, "Garra Dragón", 75, "Carga Dragón", 150, "CRITICAL")
                )
            )
        );
    }

    private PokemonCardResponseDTO createOpponentCard(
        int num, String name, PokemonType type, CardRarity rarity,
        int hp, int atk, int def, int spd,
        String m1Name, int m1Dmg,
        String m2Name, int m2Dmg, String m2Effect
    ) {
        return new PokemonCardResponseDTO(
            (long) -num, num, name, type, rarity, hp, atk, def, spd, 50, true,
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + num + ".png",
            m1Name, m1Dmg, "Ataque rápido de combate",
            m2Name, m2Dmg, "Poder especial característico", m2Effect,
            true, false, null
        );
    }

    @Transactional
    public void recordBattleResult(String opponentName, boolean won, int coinsEarned, String battleLog) {
        TrainerProfile profile = profileRepository.findFirstByOrderByIdAsc()
            .orElseGet(() -> profileRepository.save(new TrainerProfile("Ash Ketchum")));

        if (won) {
            profile.setBattlesWon(profile.getBattlesWon() + 1);
            profile.setCoins(profile.getCoins() + coinsEarned);
        } else {
            profile.setBattlesLost(profile.getBattlesLost() + 1);
        }
        profileRepository.save(profile);

        BattleRecord record = new BattleRecord(
            opponentName,
            won ? "VICTORIA" : "DERROTA",
            coinsEarned,
            battleLog
        );
        battleRepository.save(record);
    }
}
