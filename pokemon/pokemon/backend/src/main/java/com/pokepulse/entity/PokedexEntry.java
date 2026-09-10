package com.pokepulse.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "pokedex_entries")
public class PokedexEntry {

    @Id
    private Integer pokedexNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PokemonType primaryType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PokemonType secondaryType;

    private Integer baseHp;
    private Integer baseAttack;
    private Integer baseDefense;
    private Integer baseSpeed;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    public PokedexEntry() {}

    public PokedexEntry(Integer pokedexNumber, String name, PokemonType primaryType, PokemonType secondaryType,
                        Integer baseHp, Integer baseAttack, Integer baseDefense, Integer baseSpeed, String description) {
        this.pokedexNumber = pokedexNumber;
        this.name = name;
        this.primaryType = primaryType;
        this.secondaryType = secondaryType;
        this.baseHp = baseHp;
        this.baseAttack = baseAttack;
        this.baseDefense = baseDefense;
        this.baseSpeed = baseSpeed;
        this.description = description;
        this.imageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + pokedexNumber + ".png";
    }

    public Integer getPokedexNumber() { return pokedexNumber; }
    public void setPokedexNumber(Integer pokedexNumber) { this.pokedexNumber = pokedexNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PokemonType getPrimaryType() { return primaryType; }
    public void setPrimaryType(PokemonType primaryType) { this.primaryType = primaryType; }

    public PokemonType getSecondaryType() { return secondaryType; }
    public void setSecondaryType(PokemonType secondaryType) { this.secondaryType = secondaryType; }

    public Integer getBaseHp() { return baseHp; }
    public void setBaseHp(Integer baseHp) { this.baseHp = baseHp; }

    public Integer getBaseAttack() { return baseAttack; }
    public void setBaseAttack(Integer baseAttack) { this.baseAttack = baseAttack; }

    public Integer getBaseDefense() { return baseDefense; }
    public void setBaseDefense(Integer baseDefense) { this.baseDefense = baseDefense; }

    public Integer getBaseSpeed() { return baseSpeed; }
    public void setBaseSpeed(Integer baseSpeed) { this.baseSpeed = baseSpeed; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
