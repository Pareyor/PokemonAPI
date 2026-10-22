package com.pokepulse.dto;

import com.pokepulse.entity.BoosterPackType;

import java.util.List;

public record BoosterPackResultDTO(
    Long packId,
    BoosterPackType packType,
    String packName,
    int coinsSpent,
    int coinsRemaining,
    boolean godPack,
    boolean pityTriggered,
    int packsUntilPity,
    List<PackCardDTO> cards,
    // Mantenido por compatibilidad con clientes anteriores: mismas cartas sin metadatos de slot
    List<PokemonCardResponseDTO> cardsObtained
) {}
