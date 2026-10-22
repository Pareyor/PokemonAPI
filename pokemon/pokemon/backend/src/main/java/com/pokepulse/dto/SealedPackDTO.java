package com.pokepulse.dto;

import com.pokepulse.entity.BoosterPackType;

import java.time.LocalDateTime;

public record SealedPackDTO(
    Long id,
    BoosterPackType packType,
    String packName,
    LocalDateTime purchasedAt
) {}
