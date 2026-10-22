package com.pokepulse.controller;

import com.pokepulse.dto.BattleActionRequestDTO;
import com.pokepulse.dto.BattleOpponentDTO;
import com.pokepulse.dto.BattleStartRequestDTO;
import com.pokepulse.dto.BattleStateDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.BattleRecord;
import com.pokepulse.security.CurrentUser;
import com.pokepulse.service.BattleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battle")
@Tag(name = "Combates", description = "Combates por turnos resueltos en el servidor contra líderes y campeones")
public class BattleController {

    private final BattleService battleService;

    public BattleController(BattleService battleService) {
        this.battleService = battleService;
    }

    @GetMapping("/opponents")
    @Operation(summary = "Rivales disponibles con su equipo completo, dificultad y recompensa")
    public ResponseEntity<List<BattleOpponentDTO>> getOpponents() {
        return ResponseEntity.ok(battleService.getOpponents());
    }

    @PostMapping("/start")
    @Operation(summary = "Empezar un combate con hasta 6 cartas de tu colección (un combate activo previo cuenta como derrota)")
    public ResponseEntity<BattleStateDTO> start(@CurrentUser AppUser user, @Valid @RequestBody BattleStartRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(battleService.start(user, request));
    }

    @PostMapping("/{id}/action")
    @Operation(summary = "Jugar un turno: ATTACK, SPECIAL, GUARD, SWITCH (con switchTo) o FORFEIT. Devuelve los eventos del turno")
    public ResponseEntity<BattleStateDTO> act(@CurrentUser AppUser user, @PathVariable Long id,
                                              @Valid @RequestBody BattleActionRequestDTO request) {
        return ResponseEntity.ok(battleService.act(user, id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Estado actual de un combate")
    public ResponseEntity<BattleStateDTO> get(@CurrentUser AppUser user, @PathVariable Long id) {
        return ResponseEntity.ok(battleService.get(user, id));
    }

    @GetMapping("/active")
    @Operation(summary = "Combate en curso para retomarlo tras recargar (204 si no hay)")
    public ResponseEntity<BattleStateDTO> getActive(@CurrentUser AppUser user) {
        return battleService.getActive(user).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/records")
    @Operation(summary = "Tus 20 combates más recientes")
    public ResponseEntity<List<BattleRecord>> getRecords(@CurrentUser AppUser user) {
        return ResponseEntity.ok(battleService.getRecentRecords(user));
    }
}
