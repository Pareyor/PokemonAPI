package com.pokepulse.controller;

import com.pokepulse.dto.BattleOpponentDTO;
import com.pokepulse.entity.BattleRecord;
import com.pokepulse.repository.BattleRecordRepository;
import com.pokepulse.service.BattleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/battle")
@Tag(name = "Combates", description = "Arena de combate contra entrenadores y líderes de gimnasio")
public class BattleController {

    private final BattleService battleService;
    private final BattleRecordRepository battleRecordRepository;

    public BattleController(BattleService battleService, BattleRecordRepository battleRecordRepository) {
        this.battleService = battleService;
        this.battleRecordRepository = battleRecordRepository;
    }

    @GetMapping("/opponents")
    @Operation(summary = "Listar líderes y entrenadores rivales disponibles para combatir")
    public ResponseEntity<List<BattleOpponentDTO>> getOpponents() {
        return ResponseEntity.ok(battleService.getOpponents());
    }

    @PostMapping("/record")
    @Operation(summary = "Registrar resultado de combate y reclamar monedas ganadas")
    public ResponseEntity<Void> recordResult(@RequestBody Map<String, Object> body) {
        String opponent = (String) body.get("opponent");
        boolean won = Boolean.TRUE.equals(body.get("won"));
        int coins = body.get("coins") != null ? ((Number) body.get("coins")).intValue() : 0;
        String log = (String) body.get("log");

        battleService.recordBattleResult(opponent, won, coins, log);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/records")
    @Operation(summary = "Histórico de combates recientes")
    public ResponseEntity<List<BattleRecord>> getRecords() {
        return ResponseEntity.ok(battleRecordRepository.findTop20ByOrderByTimestampDesc());
    }
}
