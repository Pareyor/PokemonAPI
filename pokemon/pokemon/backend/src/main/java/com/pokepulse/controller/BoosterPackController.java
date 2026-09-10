package com.pokepulse.controller;

import com.pokepulse.dto.BoosterPackResultDTO;
import com.pokepulse.service.BoosterPackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/packs")
@Tag(name = "Sobres de Cartas", description = "Simulador de apertura de sobres booster")
public class BoosterPackController {

    private final BoosterPackService packService;

    public BoosterPackController(BoosterPackService packService) {
        this.packService = packService;
    }

    @PostMapping("/open")
    @Operation(summary = "Abrir un sobre booster y generar cartas en la colección")
    public ResponseEntity<BoosterPackResultDTO> openPack(@RequestParam(defaultValue = "BASIC") String type) {
        return ResponseEntity.ok(packService.openPack(type));
    }
}
