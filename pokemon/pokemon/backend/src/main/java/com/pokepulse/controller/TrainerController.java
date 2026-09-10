package com.pokepulse.controller;

import com.pokepulse.dto.TrainerProfileDTO;
import com.pokepulse.service.TrainerProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trainer")
@Tag(name = "Entrenador", description = "Perfil y estado de monedas del entrenador")
public class TrainerController {

    private final TrainerProfileService profileService;

    public TrainerController(TrainerProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Obtener perfil del entrenador, monedas y estadísticas")
    public ResponseEntity<TrainerProfileDTO> getProfile() {
        return ResponseEntity.ok(profileService.getProfileDTO());
    }

    @PostMapping("/claim-bonus")
    @Operation(summary = "Reclamar bono diario de 150 monedas para abrir sobres")
    public ResponseEntity<TrainerProfileDTO> claimBonus() {
        profileService.addCoins(150);
        return ResponseEntity.ok(profileService.getProfileDTO());
    }
}
