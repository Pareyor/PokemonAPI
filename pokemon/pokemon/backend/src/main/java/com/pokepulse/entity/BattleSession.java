package com.pokepulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Combate en curso o terminado. El estado del motor se guarda como JSON para poder retomarlo tras recargar. */
@Entity
@Table(name = "battle_sessions", indexes = @Index(name = "idx_battle_owner_status", columnList = "ownerId,status"))
public class BattleSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 40)
    private String opponentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BattleStatus status;

    @Column(nullable = false, columnDefinition = "text")
    private String stateJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    public BattleSession() {}

    public BattleSession(Long ownerId, String opponentId, String stateJson) {
        this.ownerId = ownerId;
        this.opponentId = opponentId;
        this.stateJson = stateJson;
        this.status = BattleStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        if (startedAt == null) startedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getOpponentId() { return opponentId; }
    public BattleStatus getStatus() { return status; }
    public void setStatus(BattleStatus status) { this.status = status; }
    public String getStateJson() { return stateJson; }
    public void setStateJson(String stateJson) { this.stateJson = stateJson; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
}
