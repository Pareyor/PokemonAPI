package com.pokepulse.dto;

import com.pokepulse.battle.BattleEvent;
import com.pokepulse.entity.BattleStatus;

import java.util.List;

public record BattleStateDTO(
    Long battleId,
    BattleStatus status,
    int turn,
    int maxTurns,
    String opponentId,
    String opponentName,
    String opponentAvatarUrl,
    List<CombatantDTO> playerTeam,
    int playerActive,
    int playerEnergy,
    boolean playerGuardedLastTurn,
    List<CombatantDTO> opponentTeam,
    int opponentActive,
    int opponentEnergy,
    boolean awaitingPlayerSwitch,
    int rewardCoins,
    int coinsEarned,
    /** Eventos producidos por la última petición, en orden, para animarlos. */
    List<BattleEvent> events
) {}
