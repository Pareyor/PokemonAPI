package com.pokepulse.service;

import com.pokepulse.dto.AuthResponseDTO;
import com.pokepulse.dto.LoginRequestDTO;
import com.pokepulse.dto.RegisterRequestDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.UserRole;
import com.pokepulse.exception.ResourceNotFoundException;
import com.pokepulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TrainerProfileService profileService;

    // Almacén de sesiones activas en memoria: Token -> ID de Usuario
    private final Map<String, Long> activeTokens = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, TrainerProfileService profileService) {
        this.userRepository = userRepository;
        this.profileService = profileService;
    }

    public String hashPassword(String rawPassword) {
        if (rawPassword == null) rawPassword = "";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((rawPassword + "_POKEPULSE_SECURE_SALT_2026").getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error en algoritmo de hash", e);
        }
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        String username = request.username().trim();
        AppUser user = userRepository.findByUsernameIgnoreCase(username)
            .orElseThrow(() -> new IllegalArgumentException("Usuario o contraseña incorrectos."));

        String inputHash = hashPassword(request.password());
        if (!user.getPasswordHash().equals(inputHash)) {
            throw new IllegalArgumentException("Usuario o contraseña incorrectos.");
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        activeTokens.put(token, user.getId());

        return new AuthResponseDTO(
            token,
            user.getId(),
            user.getUsername(),
            user.getRole().name(),
            user.getTrainerName(),
            user.getCoins()
        );
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        String username = request.username().trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("El nombre de usuario '" + username + "' ya está en uso.");
        }

        String hash = hashPassword(request.password());
        AppUser newUser = new AppUser(
            username,
            hash,
            UserRole.USER,
            request.trainerName().trim(),
            500 // Monedas iniciales para nuevos entrenadores
        );

        newUser = userRepository.save(newUser);
        String token = UUID.randomUUID().toString().replace("-", "");
        activeTokens.put(token, newUser.getId());

        // Perfil TCG propio con mazo de bienvenida
        profileService.createNewTrainer(newUser);

        return new AuthResponseDTO(
            token,
            newUser.getId(),
            newUser.getUsername(),
            newUser.getRole().name(),
            newUser.getTrainerName(),
            newUser.getCoins()
        );
    }

    @Transactional(readOnly = true)
    public AppUser resolveUser(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }

        String token = authHeader.trim();
        if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
            token = token.substring(7).trim();
        }

        Long userId = activeTokens.get(token);
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId).orElse(null);
    }

    public void logout(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return;
        String token = authHeader.trim();
        if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
            token = token.substring(7).trim();
        }
        activeTokens.remove(token);
    }
}
