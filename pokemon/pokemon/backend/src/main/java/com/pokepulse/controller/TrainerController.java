package com.pokepulse.controller;

import com.pokepulse.dto.TrainerProfileDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.security.CurrentUser;
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
    public ResponseEntity<TrainerProfileDTO> getProfile(@CurrentUser AppUser user) {
        return ResponseEntity.ok(profileService.getProfileDTO(user));
    }

    @PostMapping("/claim-bonus")
    @Operation(summary = "Reclamar el bono diario de 150 monedas (una vez cada 24 h; 409 si aún no está disponible)")
    public ResponseEntity<TrainerProfileDTO> claimBonus(@CurrentUser AppUser user) {
        return ResponseEntity.ok(profileService.claimDailyBonus(user));
    }
}
