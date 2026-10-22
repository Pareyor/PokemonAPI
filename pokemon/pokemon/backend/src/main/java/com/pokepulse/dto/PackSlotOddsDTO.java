package com.pokepulse.dto;

import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PackSlotType;

import java.util.Map;

public record PackSlotOddsDTO(
    PackSlotType slotType,
    int count,
    Map<CardRarity, Double> odds
) {}
