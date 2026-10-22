package com.pokepulse.battle;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

/** Estado completo de un combate; se guarda como JSON en {@code BattleSession}. */
public class BattleState {
    public static final String PLAYER = "PLAYER";
    public static final String OPPONENT = "OPPONENT";

    public String opponentId;
    public String opponentName;
    public int aiLevel;
    public int rewardCoins;

    public List<Combatant> playerTeam = new ArrayList<>();
    public List<Combatant> opponentTeam = new ArrayList<>();
    public int playerActive;
    public int opponentActive;
    public int playerEnergy;
    public int opponentEnergy;
    public boolean playerGuardedLastTurn;
    public boolean opponentGuardedLastTurn;

    public int turn;
    /** Tu Pokémon se ha debilitado y debes elegir relevo antes de seguir. */
    public boolean awaitingPlayerSwitch;
    /** null mientras el combate sigue; PLAYER u OPPONENT al terminar. */
    public String winner;

    public BattleState() {}

    @JsonIgnore
    public Combatant player() { return playerTeam.get(playerActive); }
    @JsonIgnore
    public Combatant opponent() { return opponentTeam.get(opponentActive); }
    @JsonIgnore
    public boolean isFinished() { return winner != null; }
}
