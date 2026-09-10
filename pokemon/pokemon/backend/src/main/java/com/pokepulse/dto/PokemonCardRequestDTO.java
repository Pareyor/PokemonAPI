package com.pokepulse.dto;

import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;
import jakarta.validation.constraints.*;

public record PokemonCardRequestDTO(
    @NotNull(message = "El número de Pokédex es obligatorio")
    @Min(value = 1, message = "Número de Pokédex debe ser al menos 1")
    Integer pokedexNumber,

    @NotBlank(message = "El nombre del Pokémon es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    String name,

    @NotNull(message = "El tipo elemental es obligatorio")
    PokemonType type,

    @NotNull(message = "La rareza es obligatoria")
    CardRarity rarity,

    @Min(value = 40, message = "HP debe ser al menos 40")
    @Max(value = 400, message = "HP no puede superar 400")
    Integer hp,

    @Min(value = 20, message = "Ataque debe ser al menos 20")
    @Max(value = 250, message = "Ataque no puede superar 250")
    Integer attack,

    @Min(value = 20, message = "Defensa debe ser al menos 20")
    @Max(value = 250, message = "Defensa no puede superar 250")
    Integer defense,

    @Min(value = 20, message = "Velocidad debe ser al menos 20")
    @Max(value = 250, message = "Velocidad no puede superar 250")
    Integer speed,

    Boolean isHolo,

    String imageUrl,

    @NotBlank(message = "Ataque 1 es obligatorio")
    String move1Name,

    @NotNull(message = "Daño de Ataque 1 es obligatorio")
    @Min(value = 10)
    Integer move1Damage,

    String move1Description,

    @NotBlank(message = "Poder Especial 2 es obligatorio")
    String move2Name,

    @NotNull(message = "Daño de Poder Especial 2 es obligatorio")
    @Min(value = 20)
    Integer move2Damage,

    String move2Description,

    String move2SpecialEffect
) {}
