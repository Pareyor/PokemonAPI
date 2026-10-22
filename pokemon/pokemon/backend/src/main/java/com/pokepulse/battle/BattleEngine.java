package com.pokepulse.battle;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.random.RandomGenerator;

import static com.pokepulse.battle.BattleState.OPPONENT;
import static com.pokepulse.battle.BattleState.PLAYER;

/**
 * Reglas del combate por turnos. Es la única autoridad sobre daño, efectos y quién gana:
 * el cliente solo envía la acción elegida y anima los eventos que devuelve este motor.
 * No toca base de datos, así que se puede testear de forma aislada con una semilla fija.
 */
@Component
public class BattleEngine {

    public static final int MAX_TURNS = 60;
    public static final int SPECIAL_COST = 100;
    static final int ENERGY_PER_ATTACK = 34;
    static final int ENERGY_ON_HIT = 8;
    static final int ENERGY_ON_GUARD = 20;
    static final double GUARD_DAMAGE_FACTOR = 0.4;
    static final double SPECIAL_BONUS = 1.3;
    static final double CRITICAL_BONUS = 1.5;
    static final int BURN_TURNS = 3;
    static final int PARALYZE_TURNS = 2;
    static final double PARALYZE_SKIP_CHANCE = 0.35;

    private final RandomGenerator random;

    public BattleEngine() {
        this(new SecureRandom());
    }

    BattleEngine(RandomGenerator random) {
        this.random = random;
    }

    /** Saca a los dos primeros Pokémon al campo. */
    public List<BattleEvent> start(BattleState s) {
        List<BattleEvent> events = new ArrayList<>();
        summon(s, PLAYER, 0, events);
        summon(s, OPPONENT, 0, events);
        return events;
    }

    public List<BattleEvent> resolveTurn(BattleState s, BattleAction action, Integer switchTo) {
        if (s.isFinished()) throw new IllegalStateException("El combate ya ha terminado.");
        List<BattleEvent> events = new ArrayList<>();

        if (action == BattleAction.FORFEIT) {
            finish(s, OPPONENT, "Te has rendido.", events);
            return events;
        }

        if (s.awaitingPlayerSwitch) {
            if (action != BattleAction.SWITCH) {
                throw new IllegalArgumentException("Tu Pokémon se ha debilitado: elige un relevo con SWITCH.");
            }
            validateSwitch(s, switchTo);
            s.awaitingPlayerSwitch = false;
            summon(s, PLAYER, switchTo, events);
            return events;
        }

        if (action == BattleAction.SPECIAL && s.playerEnergy < SPECIAL_COST) {
            throw new IllegalArgumentException("Necesitas la energía al 100% para el ataque especial.");
        }
        if (action == BattleAction.SWITCH) validateSwitch(s, switchTo);

        s.turn++;
        BattleAction aiAction = chooseAiAction(s);
        boolean[] guarding = new boolean[2]; // [PLAYER, OPPONENT]

        boolean playerFirst = goesFirst(s, action, aiAction);
        Combatant playerActor = s.player();
        Combatant opponentActor = s.opponent();
        if (playerFirst) {
            execute(s, PLAYER, action, switchTo, guarding, events);
            if (!s.isFinished() && s.opponent() == opponentActor && opponentActor.isAlive()) {
                execute(s, OPPONENT, aiAction, null, guarding, events);
            }
        } else {
            execute(s, OPPONENT, aiAction, null, guarding, events);
            if (!s.isFinished() && s.player() == playerActor && playerActor.isAlive() && !s.awaitingPlayerSwitch) {
                execute(s, PLAYER, action, switchTo, guarding, events);
            }
        }

        s.playerGuardedLastTurn = action == BattleAction.GUARD;
        s.opponentGuardedLastTurn = aiAction == BattleAction.GUARD;

        if (!s.isFinished()) endOfTurn(s, events);

        if (!s.isFinished() && s.turn >= MAX_TURNS) {
            String winner = hpRatio(s.playerTeam) >= hpRatio(s.opponentTeam) ? PLAYER : OPPONENT;
            finish(s, winner, "¡Se acabó el tiempo! Gana quien conserva más PS en su equipo.", events);
        }
        return events;
    }

    // ─── Acciones ──────────────────────────────────────────────────────────────

    private void execute(BattleState s, String side, BattleAction action, Integer switchTo,
                         boolean[] guarding, List<BattleEvent> events) {
        switch (action) {
            case SWITCH -> {
                events.add(BattleEvent.of(BattleEvent.Type.SWITCH, side,
                    trainer(s, side) + " retira a " + active(s, side).name + "."));
                summon(s, side, switchTo, events);
            }
            case GUARD -> {
                boolean guardedBefore = side.equals(PLAYER) ? s.playerGuardedLastTurn : s.opponentGuardedLastTurn;
                if (guardedBefore) {
                    events.add(BattleEvent.of(BattleEvent.Type.GUARD_FAILED, side,
                        "¡" + active(s, side).name + " intentó protegerse otra vez, pero falló!"));
                } else {
                    guarding[idx(side)] = true;
                    addEnergy(s, side, ENERGY_ON_GUARD);
                    events.add(BattleEvent.of(BattleEvent.Type.GUARD, side, active(s, side).name + " se protege."));
                }
            }
            case ATTACK, SPECIAL -> attack(s, side, action == BattleAction.SPECIAL, guarding, events);
            case FORFEIT -> throw new IllegalStateException("FORFEIT se resuelve antes del turno");
        }
    }

    private void attack(BattleState s, String side, boolean special, boolean[] guarding, List<BattleEvent> events) {
        String other = opposite(side);
        Combatant attacker = active(s, side);
        Combatant defender = active(s, other);

        if (attacker.status == StatusCondition.PARALYZE && random.nextDouble() < PARALYZE_SKIP_CHANCE) {
            events.add(BattleEvent.of(BattleEvent.Type.PARALYZED, side, "¡" + attacker.name + " está paralizado y no puede moverse!"));
            return;
        }

        String moveName = special ? attacker.move2Name : attacker.move1Name;
        int power = special ? attacker.move2Power : attacker.move1Power;
        String effect = special ? normalizeEffect(attacker.move2Effect) : null;
        events.add(new BattleEvent(BattleEvent.Type.MOVE, side, attacker.name + " usó " + moveName + ".",
            null, null, null, special, null));

        double multiplier = TypeChart.multiplier(attacker.type, defender.type);
        boolean critical = "CRITICAL".equals(effect) || random.nextInt(16) == 0;
        double raw = ((attacker.attack * 0.45 + power) / (defender.defense * 0.2 + 10.0)) * 18.0
            * multiplier
            * (special ? SPECIAL_BONUS : 1.0)
            * (critical ? CRITICAL_BONUS : 1.0)
            * (0.9 + random.nextDouble() * 0.1);
        if (guarding[idx(other)]) raw *= GUARD_DAMAGE_FACTOR;
        int damage = Math.max(5, (int) Math.round(raw));
        defender.hp = Math.max(0, defender.hp - damage);

        events.add(new BattleEvent(BattleEvent.Type.DAMAGE, other, damageText(defender, damage, multiplier, critical, guarding[idx(other)]),
            damage, defender.hp, multiplier, critical, null));

        if (special) addEnergy(s, side, -SPECIAL_COST);
        else addEnergy(s, side, ENERGY_PER_ATTACK);
        addEnergy(s, other, ENERGY_ON_HIT);

        if (special) applyEffect(attacker, defender, effect, damage, side, other, events);
        if (!defender.isAlive()) handleFaint(s, other, events);
    }

    private void applyEffect(Combatant attacker, Combatant defender, String effect, int damage,
                             String side, String other, List<BattleEvent> events) {
        if (effect == null) return;
        switch (effect) {
            case "BURN" -> {
                if (defender.isAlive() && defender.status == StatusCondition.NONE && random.nextDouble() < 0.5) {
                    defender.status = StatusCondition.BURN;
                    defender.statusTurns = BURN_TURNS;
                    events.add(BattleEvent.of(BattleEvent.Type.STATUS, other, "¡" + defender.name + " se ha quemado!"));
                }
            }
            case "PARALYZE" -> {
                if (defender.isAlive() && defender.status == StatusCondition.NONE && random.nextDouble() < 0.4) {
                    defender.status = StatusCondition.PARALYZE;
                    defender.statusTurns = PARALYZE_TURNS;
                    events.add(BattleEvent.of(BattleEvent.Type.STATUS, other, "¡" + defender.name + " está paralizado!"));
                }
            }
            case "HEAL" -> {
                int healed = Math.min(attacker.maxHp - attacker.hp, (int) Math.round(damage * 0.4));
                if (healed > 0) {
                    attacker.hp += healed;
                    events.add(new BattleEvent(BattleEvent.Type.HEAL, side, attacker.name + " recupera " + healed + " PS.",
                        healed, attacker.hp, null, null, null));
                }
            }
            default -> { }
        }
    }

    private void endOfTurn(BattleState s, List<BattleEvent> events) {
        for (String side : List.of(PLAYER, OPPONENT)) {
            if (s.isFinished() || (side.equals(PLAYER) && s.awaitingPlayerSwitch)) continue;
            Combatant c = active(s, side);
            if (!c.isAlive() || c.status == StatusCondition.NONE) continue;

            if (c.status == StatusCondition.BURN) {
                int burn = Math.max(1, c.maxHp / 12);
                c.hp = Math.max(0, c.hp - burn);
                events.add(new BattleEvent(BattleEvent.Type.STATUS_DAMAGE, side, c.name + " sufre por la quemadura.",
                    burn, c.hp, null, null, null));
            }
            if (--c.statusTurns <= 0 && c.isAlive()) {
                String recovered = c.status == StatusCondition.BURN ? "ya no está quemado" : "ya no está paralizado";
                c.status = StatusCondition.NONE;
                events.add(BattleEvent.of(BattleEvent.Type.STATUS, side, c.name + " " + recovered + "."));
            }
            if (!c.isAlive()) handleFaint(s, side, events);
        }
    }

    // ─── Debilitamientos, relevos y final ──────────────────────────────────────

    private void handleFaint(BattleState s, String side, List<BattleEvent> events) {
        Combatant fainted = active(s, side);
        fainted.status = StatusCondition.NONE;
        events.add(new BattleEvent(BattleEvent.Type.FAINT, side, "¡" + fainted.name + " se ha debilitado!",
            null, 0, null, null, side.equals(PLAYER) ? s.playerActive : s.opponentActive));

        List<Combatant> team = team(s, side);
        if (team.stream().noneMatch(Combatant::isAlive)) {
            finish(s, opposite(side), side.equals(PLAYER)
                ? "Todos tus Pokémon se han debilitado."
                : "¡Has derrotado a todo el equipo de " + s.opponentName + "!", events);
            return;
        }
        if (side.equals(PLAYER)) {
            s.awaitingPlayerSwitch = true;
        } else {
            summon(s, OPPONENT, chooseAiReplacement(s), events);
        }
    }

    private void finish(BattleState s, String winner, String text, List<BattleEvent> events) {
        s.winner = winner;
        s.awaitingPlayerSwitch = false;
        events.add(BattleEvent.of(BattleEvent.Type.END, winner, text));
    }

    private void summon(BattleState s, String side, int index, List<BattleEvent> events) {
        if (side.equals(PLAYER)) s.playerActive = index; else s.opponentActive = index;
        Combatant c = active(s, side);
        c.revealed = true;
        String text = side.equals(PLAYER) ? "¡Adelante, " + c.name + "!" : s.opponentName + " saca a " + c.name + ".";
        events.add(new BattleEvent(BattleEvent.Type.SUMMON, side, text, null, c.hp, null, null, index));
    }

    private void validateSwitch(BattleState s, Integer switchTo) {
        if (switchTo == null || switchTo < 0 || switchTo >= s.playerTeam.size()) {
            throw new IllegalArgumentException("Indica qué Pokémon de tu equipo quieres sacar (switchTo).");
        }
        if (switchTo == s.playerActive && s.player().isAlive()) {
            throw new IllegalArgumentException("Ese Pokémon ya está en el campo.");
        }
        if (!s.playerTeam.get(switchTo).isAlive()) {
            throw new IllegalArgumentException("No puedes sacar a un Pokémon debilitado.");
        }
    }

    // ─── IA del rival ──────────────────────────────────────────────────────────

    BattleAction chooseAiAction(BattleState s) {
        if (s.opponentEnergy >= SPECIAL_COST) return BattleAction.SPECIAL;
        if (s.aiLevel >= 2 && s.playerEnergy >= SPECIAL_COST && !s.opponentGuardedLastTurn) {
            double guardChance = s.aiLevel >= 3 ? 0.55 : 0.25;
            if (random.nextDouble() < guardChance) return BattleAction.GUARD;
        }
        return BattleAction.ATTACK;
    }

    /** Nivel 1: el siguiente en orden. Nivel 2+: el que mejor encaja contra tu Pokémon actual. */
    int chooseAiReplacement(BattleState s) {
        int best = -1;
        double bestScore = Double.NEGATIVE_INFINITY;
        for (int i = 0; i < s.opponentTeam.size(); i++) {
            Combatant c = s.opponentTeam.get(i);
            if (!c.isAlive()) continue;
            if (s.aiLevel <= 1) return i;
            Combatant foe = s.player();
            double score = TypeChart.multiplier(c.type, foe.type) - TypeChart.multiplier(foe.type, c.type)
                + (double) c.hp / c.maxHp * 0.25;
            if (score > bestScore) { bestScore = score; best = i; }
        }
        return best;
    }

    // ─── Utilidades ────────────────────────────────────────────────────────────

    private boolean goesFirst(BattleState s, BattleAction playerAction, BattleAction aiAction) {
        int pp = priority(playerAction), op = priority(aiAction);
        if (pp != op) return pp > op;
        int ps = s.player().effectiveSpeed(), os = s.opponent().effectiveSpeed();
        if (ps != os) return ps > os;
        return random.nextBoolean();
    }

    private static int priority(BattleAction a) {
        return a == BattleAction.GUARD || a == BattleAction.SWITCH ? 1 : 0;
    }

    /** Efectos heredados de otras versiones (POISON, FREEZE) se mapean a los cuatro que existen. */
    static String normalizeEffect(String effect) {
        if (effect == null) return null;
        return switch (effect.toUpperCase()) {
            case "BURN", "POISON" -> "BURN";
            case "PARALYZE", "FREEZE" -> "PARALYZE";
            case "HEAL" -> "HEAL";
            case "CRITICAL" -> "CRITICAL";
            default -> null;
        };
    }

    private static String damageText(Combatant defender, int damage, double multiplier, boolean critical, boolean guarded) {
        StringBuilder sb = new StringBuilder(defender.name).append(" recibe ").append(damage).append(" de daño.");
        if (critical) sb.append(" ¡Golpe crítico!");
        if (multiplier > 1.0) sb.append(" ¡Es súper eficaz!");
        else if (multiplier < 1.0) sb.append(" No es muy eficaz…");
        if (guarded) sb.append(" (protegido)");
        return sb.toString();
    }

    private static double hpRatio(List<Combatant> team) {
        int hp = team.stream().mapToInt(c -> c.hp).sum();
        int max = team.stream().mapToInt(c -> c.maxHp).sum();
        return max == 0 ? 0 : (double) hp / max;
    }

    private void addEnergy(BattleState s, String side, int delta) {
        if (side.equals(PLAYER)) s.playerEnergy = clampEnergy(s.playerEnergy + delta);
        else s.opponentEnergy = clampEnergy(s.opponentEnergy + delta);
    }

    private static int clampEnergy(int value) { return Math.max(0, Math.min(SPECIAL_COST, value)); }
    private static int idx(String side) { return side.equals(PLAYER) ? 0 : 1; }
    private static String opposite(String side) { return side.equals(PLAYER) ? OPPONENT : PLAYER; }
    private static List<Combatant> team(BattleState s, String side) { return side.equals(PLAYER) ? s.playerTeam : s.opponentTeam; }
    private static Combatant active(BattleState s, String side) { return side.equals(PLAYER) ? s.player() : s.opponent(); }
    private static String trainer(BattleState s, String side) { return side.equals(PLAYER) ? "Tú" : s.opponentName; }
}
