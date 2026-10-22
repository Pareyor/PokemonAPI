package com.pokepulse.controller;

import com.pokepulse.dto.BoosterPackResultDTO;
import com.pokepulse.dto.PackCatalogDTO;
import com.pokepulse.dto.PackPurchaseResultDTO;
import com.pokepulse.dto.SealedPackDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.BoosterPackType;
import com.pokepulse.security.CurrentUser;
import com.pokepulse.service.BoosterPackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packs")
@Tag(name = "Sobres de Cartas", description = "Tienda, inventario de sobres sellados y apertura estilo TCG")
public class BoosterPackController {

    private final BoosterPackService packService;

    public BoosterPackController(BoosterPackService packService) {
        this.packService = packService;
    }

    @GetMapping("/catalog")
    @Operation(summary = "Expansiones disponibles con precio, estructura de slots y probabilidades publicadas")
    public ResponseEntity<List<PackCatalogDTO>> getCatalog(@CurrentUser AppUser user) {
        return ResponseEntity.ok(packService.getCatalog(user));
    }

    @PostMapping("/purchase")
    @Operation(summary = "Comprar sobres sellados (1-10) sin abrirlos")
    public ResponseEntity<PackPurchaseResultDTO> purchase(@CurrentUser AppUser user,
                                                          @RequestParam BoosterPackType type,
                                                          @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(packService.purchase(user, type, quantity));
    }

    @GetMapping("/sealed")
    @Operation(summary = "Listar los sobres sellados pendientes de abrir")
    public ResponseEntity<List<SealedPackDTO>> getSealedPacks(@CurrentUser AppUser user) {
        return ResponseEntity.ok(packService.getSealedPacks(user));
    }

    @PostMapping("/sealed/{id}/open")
    @Operation(summary = "Abrir un sobre sellado: genera sus 10 cartas y las añade a la colección (409 si ya estaba abierto)")
    public ResponseEntity<BoosterPackResultDTO> openSealed(@CurrentUser AppUser user, @PathVariable Long id) {
        return ResponseEntity.ok(packService.openSealed(user, id));
    }

    @PostMapping("/open")
    @Operation(summary = "Comprar y abrir un sobre en un solo paso (compatibilidad con clientes antiguos)")
    public ResponseEntity<BoosterPackResultDTO> openPack(@CurrentUser AppUser user, @RequestParam(defaultValue = "BASIC") BoosterPackType type) {
        return ResponseEntity.ok(packService.buyAndOpen(user, type));
    }
}
