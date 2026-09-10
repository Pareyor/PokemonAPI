package com.pokepulse.controller;

import com.pokepulse.dto.PokemonCardRequestDTO;
import com.pokepulse.dto.PokemonCardResponseDTO;
import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonType;
import com.pokepulse.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@Tag(name = "Cartas", description = "Operaciones CRUD sobre la colección de cartas Pokémon")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las cartas de la colección con filtros")
    public ResponseEntity<List<PokemonCardResponseDTO>> getAll(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) PokemonType type,
        @RequestParam(required = false) CardRarity rarity,
        @RequestParam(required = false) Boolean inDeck
    ) {
        return ResponseEntity.ok(cardService.getAll(search, type, rarity, inDeck));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener carta por ID")
    public ResponseEntity<PokemonCardResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Crear carta personalizada (Card Creator)")
    public ResponseEntity<PokemonCardResponseDTO> create(@Valid @RequestBody PokemonCardRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar estadísticas o poderes de una carta")
    public ResponseEntity<PokemonCardResponseDTO> update(@PathVariable Long id, @Valid @RequestBody PokemonCardRequestDTO dto) {
        return ResponseEntity.ok(cardService.update(id, dto));
    }

    @PatchMapping("/{id}/deck")
    @Operation(summary = "Añadir o remover carta del mazo de combate (máx 5)")
    public ResponseEntity<PokemonCardResponseDTO> toggleDeck(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.toggleDeck(id));
    }

    @PostMapping("/{id}/level-up")
    @Operation(summary = "Subir de nivel la carta incrementando sus estadísticas")
    public ResponseEntity<PokemonCardResponseDTO> levelUp(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.levelUp(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Reciclar/eliminar carta y obtener monedas a cambio")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
