package com.pokepulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "battle_records")
public class BattleRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String opponentName;

    @Column(nullable = false)
    private String result; // "VICTORY" or "DEFEAT"

    private Integer coinsEarned;

    @Column(columnDefinition = "TEXT")
    private String battleLog;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public BattleRecord() {
        this.timestamp = LocalDateTime.now();
    }

    public BattleRecord(String opponentName, String result, Integer coinsEarned, String battleLog) {
        this.opponentName = opponentName;
        this.result = result;
        this.coinsEarned = coinsEarned;
        this.battleLog = battleLog;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOpponentName() { return opponentName; }
    public void setOpponentName(String opponentName) { this.opponentName = opponentName; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public Integer getCoinsEarned() { return coinsEarned; }
    public void setCoinsEarned(Integer coinsEarned) { this.coinsEarned = coinsEarned; }

    public String getBattleLog() { return battleLog; }
    public void setBattleLog(String battleLog) { this.battleLog = battleLog; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
