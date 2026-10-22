package com.pokepulse.dto;

import com.pokepulse.entity.PackSlotType;

/** Carta tal y como salió del sobre: posición física, tipo de slot y si es nueva en la colección. */
public record PackCardDTO(
    int slot,
    PackSlotType slotType,
    boolean hit,
    boolean isNew,
    PokemonCardResponseDTO card
) {}
