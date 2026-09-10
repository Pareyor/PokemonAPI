package com.pokepulse.service;

import com.pokepulse.dto.CreateUserDTO;
import com.pokepulse.dto.UpdateUserDTO;
import com.pokepulse.dto.UserDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.UserRole;
import com.pokepulse.exception.ResourceNotFoundException;
import com.pokepulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserManagementService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    private void requireAdmin(AppUser requester) {
        if (requester == null || requester.getRole() != UserRole.ADMIN) {
            throw new SecurityException("Acceso denegado: Se requieren permisos de administrador.");
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(AppUser requester) {
        requireAdmin(requester);
        return userRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id, AppUser requester) {
        requireAdmin(requester);
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario con id " + id + " no encontrado."));
        return toDTO(user);
    }

    @Transactional
    public UserDTO createUser(CreateUserDTO dto, AppUser requester) {
        requireAdmin(requester);

        String username = dto.username().trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("El nombre de usuario '" + username + "' ya existe.");
        }

        UserRole role = UserRole.USER;
        if (dto.role() != null && !dto.role().isBlank()) {
            try {
                role = UserRole.valueOf(dto.role().toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                role = UserRole.USER;
            }
        }

        String hash = authService.hashPassword(dto.password());
        AppUser newUser = new AppUser(
            username,
            hash,
            role,
            dto.trainerName() != null && !dto.trainerName().isBlank() ? dto.trainerName().trim() : username,
            dto.coins() != null ? dto.coins() : 500
        );

        return toDTO(userRepository.save(newUser));
    }

    @Transactional
    public UserDTO updateUser(Long id, UpdateUserDTO dto, AppUser requester) {
        requireAdmin(requester);

        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario con id " + id + " no encontrado."));

        if (dto.username() != null && !dto.username().isBlank()) {
            String newUsername = dto.username().trim();
            if (!user.getUsername().equalsIgnoreCase(newUsername) && userRepository.existsByUsernameIgnoreCase(newUsername)) {
                throw new IllegalArgumentException("El nombre de usuario '" + newUsername + "' ya está en uso.");
            }
            user.setUsername(newUsername);
        }

        if (dto.trainerName() != null && !dto.trainerName().isBlank()) {
            user.setTrainerName(dto.trainerName().trim());
        }

        if (dto.role() != null && !dto.role().isBlank()) {
            try {
                user.setRole(UserRole.valueOf(dto.role().toUpperCase().trim()));
            } catch (IllegalArgumentException ignored) {}
        }

        if (dto.coins() != null) {
            user.setCoins(Math.max(0, dto.coins()));
        }

        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPasswordHash(authService.hashPassword(dto.password()));
        }

        return toDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, AppUser requester) {
        requireAdmin(requester);

        if (requester.getId().equals(id)) {
            throw new IllegalArgumentException("No puedes eliminar tu propia cuenta de administrador mientras tienes la sesión activa.");
        }

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario con id " + id + " no encontrado.");
        }

        userRepository.deleteById(id);
    }

    private UserDTO toDTO(AppUser user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getRole().name(),
            user.getTrainerName(),
            user.getCoins(),
            user.getCreatedAt()
        );
    }
}
