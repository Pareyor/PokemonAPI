package com.pokepulse.init;

import com.pokepulse.entity.*;
import com.pokepulse.repository.PokedexEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Datos base: usuarios demo y Pokédex. Los perfiles TCG y sus mazos iniciales los crea
 * {@link OwnershipMigration} (para todos los usuarios sin perfil, incluidos los recién sembrados).
 */
@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PokedexEntryRepository pokedexRepository;
    private final com.pokepulse.repository.UserRepository userRepository;
    private final com.pokepulse.service.AuthService authService;

    public DataSeeder(PokedexEntryRepository pokedexRepository,
                      com.pokepulse.repository.UserRepository userRepository,
                      com.pokepulse.service.AuthService authService) {
        this.pokedexRepository = pokedexRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Override
    public void run(String... args) {
        // 0. Seed Users (Admin y Entrenador)
        if (userRepository.count() == 0) {
            // Usuario Administrador: admin / admin123
            AppUser admin = new AppUser(
                "admin",
                authService.hashPassword("admin123"),
                UserRole.ADMIN,
                "Profesor Oak",
                9999
            );
            userRepository.save(admin);

            // Usuario Estándar: entrenador / pokemon123
            AppUser user = new AppUser(
                "entrenador",
                authService.hashPassword("pokemon123"),
                UserRole.USER,
                "Ash Ketchum",
                800
            );
            userRepository.save(user);

            log.info("Usuarios iniciales creados: 'admin' (ADMIN, pass: admin123) y 'entrenador' (USER, pass: pokemon123).");
        }

        // 2. Seed All Pokédex Entries (Gen 1 + extra Pokémon from booster pool)
        if (pokedexRepository.count() == 0) {
            List<PokedexEntry> allEntries = PokedexData.getGen1Entries();
            pokedexRepository.saveAll(allEntries);
            log.info("Catálogo Pokédex Nacional inicializado con {} especies.", allEntries.size());
        } else {
            // Ensure extra booster-pool Pokémon are present even on existing DBs
            List<PokedexEntry> allEntries = PokedexData.getGen1Entries();
            for (PokedexEntry entry : allEntries) {
                if (!pokedexRepository.existsById(entry.getPokedexNumber())) {
                    pokedexRepository.save(entry);
                    log.info("Nueva entrada Pokédex añadida: #{} {}", entry.getPokedexNumber(), entry.getName());
                }
            }
        }
    }
}
