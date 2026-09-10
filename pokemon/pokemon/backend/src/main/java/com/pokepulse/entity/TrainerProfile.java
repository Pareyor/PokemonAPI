package com.pokepulse.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trainer_profiles")
public class TrainerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer coins;

    @Column(nullable = false)
    private Integer packsOpened;

    @Column(nullable = false)
    private Integer battlesWon;

    @Column(nullable = false)
    private Integer battlesLost;

    public TrainerProfile() {
        this.coins = 600;
        this.packsOpened = 0;
        this.battlesWon = 0;
        this.battlesLost = 0;
    }

    public TrainerProfile(String name) {
        this();
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCoins() { return coins; }
    public void setCoins(Integer coins) { this.coins = coins; }

    public Integer getPacksOpened() { return packsOpened; }
    public void setPacksOpened(Integer packsOpened) { this.packsOpened = packsOpened; }

    public Integer getBattlesWon() { return battlesWon; }
    public void setBattlesWon(Integer battlesWon) { this.battlesWon = battlesWon; }

    public Integer getBattlesLost() { return battlesLost; }
    public void setBattlesLost(Integer battlesLost) { this.battlesLost = battlesLost; }
}
