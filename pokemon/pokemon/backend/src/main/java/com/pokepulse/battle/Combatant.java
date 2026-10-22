package com.pokepulse.battle;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;

/**
 * Un Pokémon dentro de un combate. Se serializa a JSON junto con {@link BattleState}, por eso usa campos públicos
 * y un constructor vacío: es estado interno del motor, no un DTO de la API.
 */
public class Combatant {
    public Long cardId;
    public int pokedexNumber;
    public String name;
    public PokemonType type;
    public CardRarity rarity;
    public boolean holo;
    public String imageUrl;
    public int level;
    public int maxHp;
    public int hp;
    public int attack;
    public int defense;
    public int speed;
    public String move1Name;
    public int move1Power;
    public String move2Name;
    public int move2Power;
    public String move2Effect;

    public StatusCondition status = StatusCondition.NONE;
    public int statusTurns;
    /** El rival no ve tu banquillo (ni tú el suyo) hasta que el Pokémon sale al campo. */
    public boolean revealed;

    public Combatant() {}

    @JsonIgnore
    public boolean isAlive() { return hp > 0; }

    @JsonIgnore
    public int effectiveSpeed() {
        return status == StatusCondition.PARALYZE ? speed / 2 : speed;
    }
}
