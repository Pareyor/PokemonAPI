package com.pokepulse.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokepulse.battle.*;
import com.pokepulse.dto.*;
import com.pokepulse.entity.*;
import com.pokepulse.exception.ConflictException;
import com.pokepulse.exception.ResourceNotFoundException;
import com.pokepulse.repository.BattleRecordRepository;
import com.pokepulse.repository.BattleSessionRepository;
import com.pokepulse.repository.PokemonCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static com.pokepulse.entity.CardRarity.*;
import static com.pokepulse.entity.PokemonType.*;

@Service
public class BattleService {

    private static final String ARTWORK = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
    private static final String TRAINER_SPRITES = "https://play.pokemonshowdown.com/sprites/trainers/";
    public static final int MAX_TEAM_SIZE = 6;

    private record Mon(int num, String name, PokemonType type, CardRarity rarity, int hp, int atk, int def, int spd,
                       String m1, int p1, String m2, int p2, String effect) {}

    private record Opponent(String id, String name, String title, String avatar, String difficulty,
                            int reward, int aiLevel, List<Mon> team) {}

    private static final List<Opponent> OPPONENTS = List.of(
        new Opponent("brock", "Líder Brock", "Líder del Gimnasio Plateada (Tipo Roca)", "brock.png", "FÁCIL", 100, 1, List.of(
            new Mon(74, "Geodude", ROCK, COMMON, 110, 70, 90, 40, "Lanzarrocas", 40, "Magnitud", 70, "CRITICAL"),
            new Mon(95, "Onix", ROCK, UNCOMMON, 140, 80, 120, 50, "Atadura", 45, "Avalancha Rocosa", 85, "PARALYZE"),
            new Mon(111, "Rhyhorn", GROUND, COMMON, 135, 85, 95, 45, "Cornada", 45, "Pisotón", 80, "CRITICAL"),
            new Mon(141, "Kabutops", ROCK, RARE, 150, 115, 105, 80, "Megaagotar", 50, "Cuchillada Fósil", 100, "HEAL"),
            new Mon(142, "Aerodactyl", ROCK, EPIC, 160, 120, 75, 130, "Mordisco", 55, "Hiperrayo Prehistórico", 125, "CRITICAL"),
            new Mon(76, "Golem", ROCK, RARE, 170, 120, 130, 45, "Desenrollar", 55, "Terremoto Sísmico", 130, "CRITICAL"))),
        new Opponent("blaine", "Líder Blaine", "Maestro del Fuego de Isla Canela", "blaine.png", "MEDIA", 180, 2, List.of(
            new Mon(38, "Ninetales", FIRE, RARE, 145, 90, 85, 100, "Giro Fuego", 45, "Llamarada Mística", 95, "BURN"),
            new Mon(78, "Rapidash", FIRE, UNCOMMON, 135, 100, 75, 115, "Ascuas", 50, "Rueda Fuego", 90, "BURN"),
            new Mon(136, "Flareon", FIRE, RARE, 140, 130, 65, 70, "Nitrocarga", 50, "Envite Ígneo", 115, "BURN"),
            new Mon(126, "Magmar", FIRE, RARE, 155, 115, 70, 90, "Puño Fuego", 55, "Lanzallamas Voraz", 110, "BURN"),
            new Mon(59, "Arcanine", FIRE, RARE, 170, 125, 85, 95, "Colmillo Ígneo", 60, "Velocidad Extrema", 120, "CRITICAL"),
            new Mon(6, "Charizard", FIRE, EPIC, 185, 135, 85, 105, "Garra Dragón", 65, "Llamarada Cataclísmica", 140, "BURN"))),
        new Opponent("blue", "Rival Azul", "Campeón de la Liga Pokémon de Kanto", "blue.png", "DIFÍCIL", 250, 2, List.of(
            new Mon(18, "Pidgeot", FLYING, RARE, 155, 100, 85, 110, "Ataque Rápido", 50, "Vendaval Huracanado", 100, "CRITICAL"),
            new Mon(65, "Alakazam", PSYCHIC, RARE, 135, 145, 60, 125, "Confusión", 60, "Psíquico Supremo", 125, "PARALYZE"),
            new Mon(112, "Rhydon", GROUND, RARE, 175, 130, 120, 40, "Perforador", 55, "Terremoto Destructor", 120, "CRITICAL"),
            new Mon(103, "Exeggutor", GRASS, RARE, 165, 125, 85, 55, "Bomba Huevo", 55, "Rayo Solar", 130, "HEAL"),
            new Mon(130, "Gyarados", WATER, EPIC, 180, 140, 90, 85, "Cascada", 65, "Furia Dragón", 135, "CRITICAL"),
            new Mon(9, "Blastoise", WATER, EPIC, 195, 120, 130, 80, "Pistola Agua", 60, "Hidrobomba Titánica", 145, "CRITICAL"))),
        new Opponent("cynthia", "Campeona Cynthia", "Campeona de la Liga de Sinnoh", "cynthia.png", "EXTREMA", 400, 3, List.of(
            new Mon(442, "Spiritomb", GHOST, RARE, 160, 110, 125, 50, "Viento Aciago", 60, "Pulso Sombrío", 115, "PARALYZE"),
            new Mon(407, "Roserade", GRASS, RARE, 145, 125, 75, 95, "Hoja Afilada", 55, "Bomba Lodo", 110, "BURN"),
            new Mon(468, "Togekiss", FAIRY, RARE, 165, 120, 115, 80, "Tajo Aéreo", 60, "Fuerza Lunar", 120, "PARALYZE"),
            new Mon(350, "Milotic", WATER, EPIC, 185, 110, 125, 85, "Surf", 65, "Hidropulso Glacial", 130, "HEAL"),
            new Mon(448, "Lucario", FIGHTING, EPIC, 175, 140, 85, 115, "Puño Incremento", 65, "Esfera Aural Devastadora", 140, "CRITICAL"),
            new Mon(445, "Garchomp", DRAGON, LEGENDARY, 220, 165, 110, 120, "Garra Dragón", 80, "Carga Dragón Catastrófica", 170, "CRITICAL")))
    );

    private final BattleRecordRepository recordRepository;
    private final BattleSessionRepository sessionRepository;
    private final PokemonCardRepository cardRepository;
    private final TrainerProfileService profileService;
    private final BattleEngine engine;
    private final ObjectMapper objectMapper;

    public BattleService(BattleRecordRepository recordRepository, BattleSessionRepository sessionRepository,
                         PokemonCardRepository cardRepository, TrainerProfileService profileService,
                         BattleEngine engine, ObjectMapper objectMapper) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
        this.cardRepository = cardRepository;
        this.profileService = profileService;
        this.engine = engine;
        this.objectMapper = objectMapper;
    }

    public List<BattleOpponentDTO> getOpponents() {
        return OPPONENTS.stream().map(o -> new BattleOpponentDTO(
            o.id(), o.name(), o.title(), TRAINER_SPRITES + o.avatar(), o.difficulty(), o.reward(), o.aiLevel(),
            o.team().stream().map(BattleService::toCardDTO).toList()
        )).toList();
    }

    /** Empieza un combate. Si había otro a medias se da por perdido: abandonar no puede ser una salida gratis. */
    @Transactional
    public BattleStateDTO start(AppUser user, BattleStartRequestDTO request) {
        Opponent opponent = findOpponent(request.opponentId());

        List<Long> ids = request.cardIds();
        if (ids.size() > MAX_TEAM_SIZE || new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Elige entre 1 y " + MAX_TEAM_SIZE + " cartas distintas.");
        }
        List<Combatant> playerTeam = new ArrayList<>();
        for (Long id : ids) {
            PokemonCard card = cardRepository.findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada en tu colección con ID: " + id));
            if (Boolean.TRUE.equals(card.getIsCustom())) {
                throw new IllegalArgumentException(card.getName() + " es una carta forjada (proxy) y no es legal en la Arena.");
            }
            playerTeam.add(fromCard(card));
        }

        for (BattleSession stale : sessionRepository.findByOwnerIdAndStatus(user.getId(), BattleStatus.ACTIVE)) {
            BattleState old = read(stale);
            old.winner = BattleState.OPPONENT;
            close(user, stale, old, "Abandonado");
        }

        BattleState state = new BattleState();
        state.opponentId = opponent.id();
        state.opponentName = opponent.name();
        state.aiLevel = opponent.aiLevel();
        state.rewardCoins = opponent.reward();
        state.playerTeam = playerTeam;
        state.opponentTeam = opponent.team().stream().map(BattleService::fromMon).toList();

        List<BattleEvent> events = engine.start(state);
        BattleSession session = sessionRepository.save(new BattleSession(user.getId(), opponent.id(), write(state)));
        return toDTO(session, state, events, 0);
    }

    @Transactional
    public BattleStateDTO act(AppUser user, Long battleId, BattleActionRequestDTO request) {
        BattleSession session = sessionRepository.findByIdAndOwnerIdForUpdate(battleId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Combate no encontrado con ID: " + battleId));
        if (session.getStatus() != BattleStatus.ACTIVE) {
            throw new ConflictException("Este combate ya ha terminado.");
        }

        BattleState state = read(session);
        List<BattleEvent> events = engine.resolveTurn(state, request.action(), request.switchTo());
        int coinsEarned = 0;
        if (state.isFinished()) {
            coinsEarned = close(user, session, state, summary(state));
        } else {
            session.setStateJson(write(state));
        }
        return toDTO(session, state, events, coinsEarned);
    }

    @Transactional(readOnly = true)
    public BattleStateDTO get(AppUser user, Long battleId) {
        BattleSession session = sessionRepository.findById(battleId)
            .filter(s -> s.getOwnerId().equals(user.getId()))
            .orElseThrow(() -> new ResourceNotFoundException("Combate no encontrado con ID: " + battleId));
        return toDTO(session, read(session), List.of(), 0);
    }

    @Transactional(readOnly = true)
    public Optional<BattleStateDTO> getActive(AppUser user) {
        return sessionRepository.findFirstByOwnerIdAndStatusOrderByStartedAtDesc(user.getId(), BattleStatus.ACTIVE)
            .map(s -> toDTO(s, read(s), List.of(), 0));
    }

    @Transactional(readOnly = true)
    public List<BattleRecord> getRecentRecords(AppUser user) {
        return recordRepository.findTop20ByOwnerIdOrderByTimestampDesc(user.getId());
    }

    /** Cierra el combate, actualiza estadísticas y paga la recompensa. Devuelve las monedas ganadas. */
    private int close(AppUser user, BattleSession session, BattleState state, String log) {
        boolean won = BattleState.PLAYER.equals(state.winner);
        session.setStatus(won ? BattleStatus.WON : BattleStatus.LOST);
        session.setFinishedAt(LocalDateTime.now());
        session.setStateJson(write(state));

        AppUser wallet = profileService.lockUser(user.getId());
        TrainerProfile profile = profileService.getOrCreateProfile(user);
        int coins = won ? state.rewardCoins : 0;
        if (won) {
            profile.setBattlesWon(profile.getBattlesWon() + 1);
            wallet.setCoins(wallet.getCoins() + coins);
        } else {
            profile.setBattlesLost(profile.getBattlesLost() + 1);
        }
        recordRepository.save(new BattleRecord(user.getId(), state.opponentName, won ? "VICTORIA" : "DERROTA", coins, log));
        return coins;
    }

    private static String summary(BattleState s) {
        long alive = s.playerTeam.stream().filter(Combatant::isAlive).count();
        return (BattleState.PLAYER.equals(s.winner) ? "Victoria" : "Derrota") + " en " + s.turn + " turnos · "
            + alive + "/" + s.playerTeam.size() + " Pokémon en pie";
    }

    // ─── Conversión ────────────────────────────────────────────────────────────

    private BattleStateDTO toDTO(BattleSession session, BattleState s, List<BattleEvent> events, int coinsEarned) {
        Opponent opponent = findOpponent(s.opponentId);
        return new BattleStateDTO(
            session.getId(), session.getStatus(), s.turn, BattleEngine.MAX_TURNS,
            s.opponentId, s.opponentName, TRAINER_SPRITES + opponent.avatar(),
            s.playerTeam.stream().map(c -> toDTO(c, true)).toList(), s.playerActive, s.playerEnergy, s.playerGuardedLastTurn,
            s.opponentTeam.stream().map(c -> toDTO(c, c.revealed || s.isFinished())).toList(), s.opponentActive, s.opponentEnergy,
            s.awaitingPlayerSwitch, s.rewardCoins, coinsEarned, events
        );
    }

    private static CombatantDTO toDTO(Combatant c, boolean visible) {
        if (!visible) {
            return new CombatantDTO(false, null, null, null, null, null, null, null, null,
                c.hp, c.maxHp, null, null, null, null, null, null, null, null, StatusCondition.NONE);
        }
        return new CombatantDTO(true, c.cardId, c.pokedexNumber, c.name, c.type, c.rarity, c.holo, c.imageUrl, c.level,
            c.hp, c.maxHp, c.attack, c.defense, c.speed, c.move1Name, c.move1Power, c.move2Name, c.move2Power,
            c.move2Effect, c.status);
    }

    private static Combatant fromCard(PokemonCard card) {
        Combatant c = new Combatant();
        c.cardId = card.getId();
        c.pokedexNumber = card.getPokedexNumber();
        c.name = card.getName();
        c.type = card.getType();
        c.rarity = card.getRarity();
        c.holo = Boolean.TRUE.equals(card.getIsHolo());
        c.imageUrl = card.getImageUrl();
        c.level = card.getLevel();
        c.maxHp = card.getHp();
        c.hp = card.getHp();
        c.attack = card.getAttack();
        c.defense = card.getDefense();
        c.speed = card.getSpeed();
        c.move1Name = card.getMove1Name();
        c.move1Power = card.getMove1Damage();
        c.move2Name = card.getMove2Name();
        c.move2Power = card.getMove2Damage();
        c.move2Effect = card.getMove2SpecialEffect();
        return c;
    }

    private static Combatant fromMon(Mon m) {
        Combatant c = new Combatant();
        c.pokedexNumber = m.num();
        c.name = m.name();
        c.type = m.type();
        c.rarity = m.rarity();
        c.holo = m.rarity().compareTo(EPIC) >= 0;
        c.imageUrl = ARTWORK + m.num() + ".png";
        c.level = 50;
        c.maxHp = m.hp();
        c.hp = m.hp();
        c.attack = m.atk();
        c.defense = m.def();
        c.speed = m.spd();
        c.move1Name = m.m1();
        c.move1Power = m.p1();
        c.move2Name = m.m2();
        c.move2Power = m.p2();
        c.move2Effect = m.effect();
        return c;
    }

    private static PokemonCardResponseDTO toCardDTO(Mon m) {
        return new PokemonCardResponseDTO(
            (long) -m.num(), m.num(), m.name(), m.type(), m.rarity(), m.hp(), m.atk(), m.def(), m.spd(), 50,
            m.rarity().compareTo(EPIC) >= 0, ARTWORK + m.num() + ".png",
            m.m1(), m.p1(), "Ataque rápido de combate",
            m.m2(), m.p2(), "Poder especial característico", m.effect(),
            false, false, null
        );
    }

    private static Opponent findOpponent(String id) {
        return OPPONENTS.stream().filter(o -> o.id().equalsIgnoreCase(id)).findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Rival desconocido: " + id));
    }

    private BattleState read(BattleSession session) {
        try {
            return objectMapper.readValue(session.getStateJson(), BattleState.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Estado de combate corrupto (ID " + session.getId() + ")", e);
        }
    }

    private String write(BattleState state) {
        try {
            return objectMapper.writeValueAsString(state);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo guardar el estado del combate", e);
        }
    }
}
