package com.pokepulse.dto;

import java.util.List;

public record PackPurchaseResultDTO(
    List<SealedPackDTO> purchased,
    int coinsSpent,
    int coinsRemaining
) {}
