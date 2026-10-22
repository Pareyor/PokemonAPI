package com.pokepulse.battle;

public enum StatusCondition {
    NONE,
    /** Pierde 1/12 de sus PS al final de cada turno. */
    BURN,
    /** Velocidad a la mitad y 35% de probabilidad de no poder actuar. */
    PARALYZE
}
