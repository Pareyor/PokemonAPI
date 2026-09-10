package com.pokepulse.controller;

import com.pokepulse.dto.PokedexItemDTO;
import com.pokepulse.dto.PokedexStatsDTO;
import com.pokepulse.entity.PokemonType;
import com.pokepulse.service.PokedexService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pokedex")
@Tag(name = "Pokédex Nacional", description = "Catálogo completo de Pokémon y seguimiento de capturas")
public class PokedexController {

    private final PokedexService pokedexService;

    public PokedexController(PokedexService pokedexService) {
        this.pokedexService = pokedexService;
    }

    @GetMapping
    @Operation(summary = "Consultar catálogo Pokédex con estado de tenencia (obtenido/no obtenido)")
    public ResponseEntity<List<PokedexItemDTO>> getPokedex(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) PokemonType type,
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(pokedexService.getPokedex(search, type, status));
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas globales de compleción de la Pokédex")
    public ResponseEntity<PokedexStatsDTO> getStats() {
        return ResponseEntity.ok(pokedexService.getStats());
    }
}
