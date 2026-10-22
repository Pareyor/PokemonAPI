package com.pokepulse.battle;

/**
 * Lo que ha ocurrido en un turno, en orden, para que el cliente lo anime paso a paso.
 *
 * @param side      "PLAYER" u "OPPONENT": quién protagoniza el evento
 * @param amount    daño o curación, si aplica
 * @param hpAfter   PS del Pokémon afectado tras el evento
 * @param index     posición en el equipo (SUMMON / FAINT)
 */
public record BattleEvent(
    Type type,
    String side,
    String text,
    Integer amount,
    Integer hpAfter,
    Double effectiveness,
    Boolean critical,
    Integer index
) {
    public enum Type { SUMMON, MOVE, DAMAGE, HEAL, GUARD, GUARD_FAILED, STATUS, STATUS_DAMAGE, PARALYZED, FAINT, SWITCH, END }

    static BattleEvent of(Type type, String side, String text) {
        return new BattleEvent(type, side, text, null, null, null, null, null);
    }
}
