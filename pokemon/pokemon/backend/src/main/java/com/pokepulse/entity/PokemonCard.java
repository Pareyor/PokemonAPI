package com.pokepulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pokemon_cards")
public class PokemonCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer pokedexNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PokemonType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CardRarity rarity;

    @Column(nullable = false)
    private Integer hp;

    @Column(nullable = false)
    private Integer attack;

    @Column(nullable = false)
    private Integer defense;

    @Column(nullable = false)
    private Integer speed;

    @Column(nullable = false)
    private Integer level;

    @Column(nullable = false)
    private Boolean isHolo;

    @Column(length = 500)
    private String imageUrl;

    // Move 1 (Basic attack)
    @Column(nullable = false, length = 80)
    private String move1Name;

    @Column(nullable = false)
    private Integer move1Damage;

    @Column(length = 200)
    private String move1Description;

    // Move 2 (Special Power)
    @Column(nullable = false, length = 80)
    private String move2Name;

    @Column(nullable = false)
    private Integer move2Damage;

    @Column(length = 200)
    private String move2Description;

    @Column(length = 50)
    private String move2SpecialEffect; // e.g. "BURN", "PARALYZE", "HEAL", "CRITICAL"

    @Column(nullable = false)
    private Boolean isInDeck;

    @Column(nullable = false)
    private Boolean isCustom;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PokemonCard() {
        this.level = 1;
        this.isHolo = false;
        this.isInDeck = false;
        this.isCustom = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.level == null) this.level = 1;
        if (this.isHolo == null) this.isHolo = false;
        if (this.isInDeck == null) this.isInDeck = false;
        if (this.isCustom == null) this.isCustom = false;
        if (this.imageUrl == null || this.imageUrl.isEmpty()) {
            this.imageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + this.pokedexNumber + ".png";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getPokedexNumber() { return pokedexNumber; }
    public void setPokedexNumber(Integer pokedexNumber) { this.pokedexNumber = pokedexNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PokemonType getType() { return type; }
    public void setType(PokemonType type) { this.type = type; }

    public CardRarity getRarity() { return rarity; }
    public void setRarity(CardRarity rarity) { this.rarity = rarity; }

    public Integer getHp() { return hp; }
    public void setHp(Integer hp) { this.hp = hp; }

    public Integer getAttack() { return attack; }
    public void setAttack(Integer attack) { this.attack = attack; }

    public Integer getDefense() { return defense; }
    public void setDefense(Integer defense) { this.defense = defense; }

    public Integer getSpeed() { return speed; }
    public void setSpeed(Integer speed) { this.speed = speed; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Boolean getIsHolo() { return isHolo; }
    public void setIsHolo(Boolean isHolo) { this.isHolo = isHolo; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getMove1Name() { return move1Name; }
    public void setMove1Name(String move1Name) { this.move1Name = move1Name; }

    public Integer getMove1Damage() { return move1Damage; }
    public void setMove1Damage(Integer move1Damage) { this.move1Damage = move1Damage; }

    public String getMove1Description() { return move1Description; }
    public void setMove1Description(String move1Description) { this.move1Description = move1Description; }

    public String getMove2Name() { return move2Name; }
    public void setMove2Name(String move2Name) { this.move2Name = move2Name; }

    public Integer getMove2Damage() { return move2Damage; }
    public void setMove2Damage(Integer move2Damage) { this.move2Damage = move2Damage; }

    public String getMove2Description() { return move2Description; }
    public void setMove2Description(String move2Description) { this.move2Description = move2Description; }

    public String getMove2SpecialEffect() { return move2SpecialEffect; }
    public void setMove2SpecialEffect(String move2SpecialEffect) { this.move2SpecialEffect = move2SpecialEffect; }

    public Boolean getIsInDeck() { return isInDeck; }
    public void setIsInDeck(Boolean inDeck) { isInDeck = inDeck; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean custom) { isCustom = custom; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
