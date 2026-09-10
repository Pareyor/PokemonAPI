package com.pokepulse.dto;

public record TrainerProfileDTO(
    Long id,
    String name,
    Integer coins,
    Integer packsOpened,
    Integer battlesWon,
    Integer battlesLost,
    long totalCards,
    long deckCardsCount
) {}
