package com.pokepulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Estadísticas del entrenador en el modo TCG, una por usuario.
 * Las monedas NO viven aquí: la única fuente de verdad es {@link AppUser#getCoins()}.
 */
@Entity
@Table(name = "trainer_profiles")
public class TrainerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer packsOpened;

    @Column(nullable = false)
    private Integer battlesWon;

    @Column(nullable = false)
    private Integer battlesLost;

    // Nullable con default para que ddl-auto=update pueda añadir la columna a perfiles existentes
    @Column(columnDefinition = "integer default 0")
    private Integer packsSinceLegendary;

    private LocalDateTime lastBonusClaimedAt;

    public TrainerProfile() {
        this.packsOpened = 0;
        this.battlesWon = 0;
        this.battlesLost = 0;
        this.packsSinceLegendary = 0;
    }

    public TrainerProfile(Long userId, String name) {
        this();
        this.userId = userId;
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getPacksOpened() { return packsOpened; }
    public void setPacksOpened(Integer packsOpened) { this.packsOpened = packsOpened; }

    public Integer getBattlesWon() { return battlesWon; }
    public void setBattlesWon(Integer battlesWon) { this.battlesWon = battlesWon; }

    public Integer getBattlesLost() { return battlesLost; }
    public void setBattlesLost(Integer battlesLost) { this.battlesLost = battlesLost; }

    public int getPacksSinceLegendary() { return packsSinceLegendary != null ? packsSinceLegendary : 0; }
    public void setPacksSinceLegendary(Integer packsSinceLegendary) { this.packsSinceLegendary = packsSinceLegendary; }

    public LocalDateTime getLastBonusClaimedAt() { return lastBonusClaimedAt; }
    public void setLastBonusClaimedAt(LocalDateTime lastBonusClaimedAt) { this.lastBonusClaimedAt = lastBonusClaimedAt; }
}
