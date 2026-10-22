package com.pokepulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Sobre comprado pero todavía sin abrir. Comprar y abrir son pasos separados,
 * igual que en el TCG real: puedes acumular sobres y abrirlos cuando quieras.
 */
@Entity
@Table(name = "sealed_packs")
public class SealedPack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id")
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private BoosterPackType packType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime purchasedAt;

    private LocalDateTime openedAt;

    public SealedPack() {}

    public SealedPack(Long ownerId, BoosterPackType packType) {
        this.ownerId = ownerId;
        this.packType = packType;
    }

    @PrePersist
    protected void onCreate() {
        if (this.purchasedAt == null) this.purchasedAt = LocalDateTime.now();
    }

    public boolean isOpened() { return openedAt != null; }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public BoosterPackType getPackType() { return packType; }
    public LocalDateTime getPurchasedAt() { return purchasedAt; }
    public LocalDateTime getOpenedAt() { return openedAt; }
    public void setOpenedAt(LocalDateTime openedAt) { this.openedAt = openedAt; }
}
