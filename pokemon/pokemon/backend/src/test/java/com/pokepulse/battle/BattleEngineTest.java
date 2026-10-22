package com.pokepulse.battle;

import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class BattleEngineTest {

    private static Combatant mon(String name, PokemonType type, int hp, int atk, int def, int spd, String effect) {
        Combatant c = new Combatant();
        c.name = name; c.type = type; c.rarity = CardRarity.RARE;
        c.maxHp = hp; c.hp = hp; c.attack = atk; c.defense = def; c.speed = spd; c.level = 1;
        c.move1Name = "Rápido"; c.move1Power = 50;
        c.move2Name = "Especial"; c.move2Power = 120; c.move2Effect = effect;
        return c;
    }

    private static BattleState state(List<Combatant> player, List<Combatant> opponent, int aiLevel) {
        BattleState s = new BattleState();
        s.opponentId = "test"; s.opponentName = "Rival"; s.aiLevel = aiLevel; s.rewardCoins = 100;
        s.playerTeam = new ArrayList<>(player);
        s.opponentTeam = new ArrayList<>(opponent);
        return s;
    }

    @Test
    void typeChartMatchesMainSeries() {
        assertEquals(1.5, TypeChart.multiplier(PokemonType.WATER, PokemonType.FIRE));
        assertEquals(0.7, TypeChart.multiplier(PokemonType.FIRE, PokemonType.WATER));
        assertEquals(0.4, TypeChart.multiplier(PokemonType.ELECTRIC, PokemonType.GROUND));
        assertEquals(1.5, TypeChart.multiplier(PokemonType.FAIRY, PokemonType.DRAGON));
        assertEquals(1.0, TypeChart.multiplier(PokemonType.NORMAL, PokemonType.WATER));
    }

    @Test
    void fasterPokemonMovesFirst() {
        BattleEngine engine = new BattleEngine(new Random(1));
        BattleState s = state(List.of(mon("Rápido", PokemonType.NORMAL, 300, 80, 80, 150, null)),
                              List.of(mon("Lento", PokemonType.NORMAL, 300, 80, 80, 10, null)), 1);
        engine.start(s);
        List<BattleEvent> events = engine.resolveTurn(s, BattleAction.ATTACK, null);
        BattleEvent firstMove = events.stream().filter(e -> e.type() == BattleEvent.Type.MOVE).findFirst().orElseThrow();
        assertEquals(BattleState.PLAYER, firstMove.side());
    }

    @Test
    void specialRequiresFullEnergyAndConsumesIt() {
        BattleEngine engine = new BattleEngine(new Random(2));
        BattleState s = state(List.of(mon("A", PokemonType.NORMAL, 900, 60, 200, 100, null)),
                              List.of(mon("B", PokemonType.NORMAL, 900, 60, 200, 10, null)), 1);
        engine.start(s);
        assertThrows(IllegalArgumentException.class, () -> engine.resolveTurn(s, BattleAction.SPECIAL, null));
        for (int i = 0; i < 3; i++) engine.resolveTurn(s, BattleAction.ATTACK, null);
        assertEquals(BattleEngine.SPECIAL_COST, s.playerEnergy);
        engine.resolveTurn(s, BattleAction.SPECIAL, null);
        assertTrue(s.playerEnergy < BattleEngine.SPECIAL_COST);
    }

    @Test
    void guardReducesDamageAndFailsTwiceInARow() {
        BattleEngine engine = new BattleEngine(new Random(3));
        BattleState s = state(List.of(mon("A", PokemonType.NORMAL, 900, 60, 80, 10, null)),
                              List.of(mon("B", PokemonType.NORMAL, 900, 100, 80, 100, null)), 1);
        engine.start(s);
        List<BattleEvent> first = engine.resolveTurn(s, BattleAction.GUARD, null);
        assertTrue(first.stream().anyMatch(e -> e.type() == BattleEvent.Type.GUARD));
        int guardedDamage = first.stream().filter(e -> e.type() == BattleEvent.Type.DAMAGE).findFirst().orElseThrow().amount();

        List<BattleEvent> second = engine.resolveTurn(s, BattleAction.GUARD, null);
        assertTrue(second.stream().anyMatch(e -> e.type() == BattleEvent.Type.GUARD_FAILED));
        int unguardedDamage = second.stream().filter(e -> e.type() == BattleEvent.Type.DAMAGE).findFirst().orElseThrow().amount();
        assertTrue(guardedDamage < unguardedDamage * 0.6, guardedDamage + " vs " + unguardedDamage);
    }

    @Test
    void playerMustChooseReplacementAfterFaint() {
        BattleEngine engine = new BattleEngine(new Random(4));
        Combatant weak = mon("Débil", PokemonType.NORMAL, 1, 10, 10, 1, null);
        BattleState s = state(List.of(weak, mon("Reserva", PokemonType.NORMAL, 300, 80, 80, 50, null)),
                              List.of(mon("Fuerte", PokemonType.NORMAL, 300, 120, 80, 100, null)), 1);
        engine.start(s);
        engine.resolveTurn(s, BattleAction.ATTACK, null);
        assertTrue(s.awaitingPlayerSwitch);
        assertThrows(IllegalArgumentException.class, () -> engine.resolveTurn(s, BattleAction.ATTACK, null));
        assertThrows(IllegalArgumentException.class, () -> engine.resolveTurn(s, BattleAction.SWITCH, 0));

        int turnBefore = s.turn;
        engine.resolveTurn(s, BattleAction.SWITCH, 1);
        assertFalse(s.awaitingPlayerSwitch);
        assertEquals(1, s.playerActive);
        assertEquals(turnBefore, s.turn, "el relevo forzoso no gasta turno ni da ataque gratis al rival");
    }

    @Test
    void knockingOutWholeTeamEndsTheBattle() {
        BattleEngine engine = new BattleEngine(new Random(5));
        BattleState s = state(List.of(mon("Titán", PokemonType.FIGHTING, 999, 300, 200, 200, null)),
                              List.of(mon("X", PokemonType.NORMAL, 20, 10, 10, 1, null), mon("Y", PokemonType.NORMAL, 20, 10, 10, 1, null)), 2);
        engine.start(s);
        engine.resolveTurn(s, BattleAction.ATTACK, null);
        assertEquals(1, s.opponentActive, "el rival saca su siguiente Pokémon");
        assertTrue(s.opponent().revealed);
        List<BattleEvent> events = engine.resolveTurn(s, BattleAction.ATTACK, null);
        assertEquals(BattleState.PLAYER, s.winner);
        assertEquals(BattleEvent.Type.END, events.get(events.size() - 1).type());
        assertThrows(IllegalStateException.class, () -> engine.resolveTurn(s, BattleAction.ATTACK, null));
    }

    @Test
    void healEffectRestoresHp() {
        BattleEngine engine = new BattleEngine(new Random(6));
        Combatant healer = mon("Sanador", PokemonType.GRASS, 500, 100, 80, 100, "HEAL");
        BattleState s = state(List.of(healer), List.of(mon("Saco", PokemonType.NORMAL, 2000, 120, 80, 10, null)), 1);
        engine.start(s);
        for (int i = 0; i < 3; i++) engine.resolveTurn(s, BattleAction.ATTACK, null);
        List<BattleEvent> events = engine.resolveTurn(s, BattleAction.SPECIAL, null);
        assertTrue(events.stream().anyMatch(e -> e.type() == BattleEvent.Type.HEAL));
    }

    @Test
    void smartAiPicksTypeAdvantagedReplacement() {
        BattleEngine engine = new BattleEngine(new Random(7));
        BattleState s = state(List.of(mon("Fuego", PokemonType.FIRE, 300, 80, 80, 50, null)),
            List.of(mon("Planta", PokemonType.GRASS, 200, 80, 80, 50, null),
                    mon("Hielo", PokemonType.ICE, 200, 80, 80, 50, null),
                    mon("Agua", PokemonType.WATER, 200, 80, 80, 50, null)), 3);
        engine.start(s);
        s.opponentTeam.get(0).hp = 0;
        assertEquals(2, engine.chooseAiReplacement(s));
    }

    @Test
    void burnDealsDamageAtEndOfTurnAndWearsOff() {
        BattleEngine engine = new BattleEngine(new Random(8));
        BattleState s = state(List.of(mon("A", PokemonType.NORMAL, 900, 1, 999, 1, null)),
                              List.of(mon("B", PokemonType.NORMAL, 900, 1, 999, 1, null)), 1);
        engine.start(s);
        s.player().status = StatusCondition.BURN;
        s.player().statusTurns = 2;
        List<BattleEvent> t1 = engine.resolveTurn(s, BattleAction.GUARD, null);
        assertTrue(t1.stream().anyMatch(e -> e.type() == BattleEvent.Type.STATUS_DAMAGE && e.side().equals(BattleState.PLAYER)));
        engine.resolveTurn(s, BattleAction.ATTACK, null);
        assertEquals(StatusCondition.NONE, s.player().status);
    }
}
