package com.pokepulse.dto;

import java.time.LocalDateTime;

public record TrainerProfileDTO(
    Long id,
    String name,
    Integer coins,
    Integer packsOpened,
    Integer battlesWon,
    Integer battlesLost,
    long totalCards,
    long deckCardsCount,
    // null si el bono diario ya está disponible
    LocalDateTime bonusAvailableAt,
    // Modo pruebas activo: las compras no descuentan monedas
    boolean infiniteCoins
) {}
