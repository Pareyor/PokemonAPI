package com.pokepulse.controller;

import com.pokepulse.dto.CreateUserDTO;
import com.pokepulse.dto.UpdateUserDTO;
import com.pokepulse.dto.UserDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.UserRole;
import com.pokepulse.service.AuthService;
import com.pokepulse.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Administración de Usuarios", description = "Operaciones CRUD exclusivas para administradores")
public class AdminUserController {

    private final UserManagementService userManagementService;
    private final AuthService authService;

    public AdminUserController(UserManagementService userManagementService, AuthService authService) {
        this.userManagementService = userManagementService;
        this.authService = authService;
    }

    private AppUser getRequester(String authHeader) {
        AppUser requester = authService.resolveUser(authHeader);
        if (requester == null) {
            throw new SecurityException("No autenticado. Inicia sesión con una cuenta de Administrador.");
        }
        if (requester.getRole() != UserRole.ADMIN) {
            throw new SecurityException("Acceso prohibido. Se requiere rol de ADMINISTRADOR.");
        }
        return requester;
    }

    @GetMapping
    @Operation(summary = "Obtener lista completa de usuarios registrados")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        AppUser requester = getRequester(authHeader);
        return ResponseEntity.ok(userManagementService.getAllUsers(requester));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalles de un usuario por su ID")
    public ResponseEntity<UserDTO> getUserById(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        AppUser requester = getRequester(authHeader);
        return ResponseEntity.ok(userManagementService.getUserById(id, requester));
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo usuario o administrador")
    public ResponseEntity<UserDTO> createUser(
        @Valid @RequestBody CreateUserDTO dto,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        AppUser requester = getRequester(authHeader);
        UserDTO created = userManagementService.createUser(dto, requester);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos, rol o monedas de un usuario")
    public ResponseEntity<UserDTO> updateUser(
        @PathVariable Long id,
        @RequestBody UpdateUserDTO dto,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        AppUser requester = getRequester(authHeader);
        return ResponseEntity.ok(userManagementService.updateUser(id, dto, requester));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un usuario del sistema")
    public ResponseEntity<Void> deleteUser(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        AppUser requester = getRequester(authHeader);
        userManagementService.deleteUser(id, requester);
        return ResponseEntity.noContent().build();
    }
}
