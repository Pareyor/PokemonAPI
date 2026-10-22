package com.pokepulse.battle;

public enum BattleAction {
    /** Ataque rápido: carga energía. */
    ATTACK,
    /** Ataque especial: requiere la energía al 100% y aplica el efecto de la carta. */
    SPECIAL,
    /** Proteger: reduce el daño recibido este turno. Falla si se usa dos turnos seguidos. */
    GUARD,
    /** Cambiar de Pokémon (gasta el turno, salvo tras un debilitamiento). */
    SWITCH,
    FORFEIT
}
