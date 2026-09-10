package com.pokepulse.controller;

import com.pokepulse.dto.AuthResponseDTO;
import com.pokepulse.dto.LoginRequestDTO;
import com.pokepulse.dto.RegisterRequestDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión, registro y validación de usuarios")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión como Entrenador o Administrador")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar una nueva cuenta de Entrenador")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener los datos del usuario autenticado actual (incluye token)")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        AppUser user = authService.resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body("No autenticado o sesión expirada.");
        }
        // Extraer el token del header para devolverlo al frontend
        String token = authHeader != null ? authHeader.trim() : "";
        if (token.toLowerCase().startsWith("bearer ")) {
            token = token.substring(7).trim();
        }
        return ResponseEntity.ok(new AuthResponseDTO(
            token,
            user.getId(),
            user.getUsername(),
            user.getRole().name(),
            user.getTrainerName(),
            user.getCoins()
        ));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión activa")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.noContent().build();
    }
}
