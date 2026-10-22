package com.pokepulse.init;

import com.pokepulse.entity.AppUser;
import com.pokepulse.repository.TrainerProfileRepository;
import com.pokepulse.repository.UserRepository;
import com.pokepulse.service.TrainerProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Migración idempotente de la colección global (versión anterior) a colecciones por usuario.
 * <ol>
 *   <li>Las monedas del antiguo perfil global pasan al usuario "heredero" y se elimina la columna duplicada.</li>
 *   <li>Cartas, sobres, combates y perfil sin dueño se asignan a ese heredero.</li>
 *   <li>Las columnas owner_id se marcan NOT NULL.</li>
 *   <li>Todo usuario sin perfil TCG recibe uno nuevo con su mazo de bienvenida.</li>
 * </ol>
 * En una base de datos nueva o ya migrada no hace nada salvo el paso 4.
 */
@Component
@Order(2)
public class OwnershipMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(OwnershipMigration.class);
    private static final List<String> OWNED_TABLES = List.of("pokemon_cards", "sealed_packs", "battle_records");

    private final JdbcTemplate jdbc;
    private final UserRepository userRepository;
    private final TrainerProfileRepository profileRepository;
    private final TrainerProfileService profileService;

    public OwnershipMigration(JdbcTemplate jdbc, UserRepository userRepository,
                              TrainerProfileRepository profileRepository, TrainerProfileService profileService) {
        this.jdbc = jdbc;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.profileService = profileService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Long heir = findHeir();

        if (columnExists("trainer_profiles", "coins")) {
            Integer legacyCoins = jdbc.query(
                "select coins from trainer_profiles where user_id is null order by id limit 1",
                rs -> rs.next() ? rs.getInt(1) : null);
            if (heir != null && legacyCoins != null) {
                jdbc.update("update app_users set coins = ? where id = ?", legacyCoins, heir);
                log.info("Migración: {} monedas del perfil global movidas al usuario {}", legacyCoins, heir);
            }
            jdbc.execute("alter table trainer_profiles drop column coins");
            log.info("Migración: eliminada la columna duplicada trainer_profiles.coins (las monedas viven en app_users)");
        }

        if (heir != null) {
            boolean heirHasProfile = profileRepository.findByUserId(heir).isPresent();
            if (!heirHasProfile) {
                jdbc.update("update trainer_profiles set user_id = ? where id = (select min(id) from trainer_profiles where user_id is null)", heir);
            }
            int orphanProfiles = jdbc.update("delete from trainer_profiles where user_id is null");
            if (orphanProfiles > 0) log.info("Migración: {} perfiles globales sobrantes eliminados", orphanProfiles);

            for (String table : OWNED_TABLES) {
                int moved = jdbc.update("update " + table + " set owner_id = ? where owner_id is null", heir);
                if (moved > 0) log.info("Migración: {} filas de {} asignadas al usuario {}", moved, table, heir);
            }
        }

        for (String table : OWNED_TABLES) {
            Integer nulls = jdbc.queryForObject("select count(*) from " + table + " where owner_id is null", Integer.class);
            if (nulls != null && nulls == 0 && isNullable(table, "owner_id")) {
                jdbc.execute("alter table " + table + " alter column owner_id set not null");
            }
        }

        for (AppUser user : userRepository.findAll()) {
            if (profileRepository.findByUserId(user.getId()).isEmpty()) {
                profileService.createNewTrainer(user);
                log.info("Perfil TCG y mazo de bienvenida creados para '{}'", user.getUsername());
            }
        }
    }

    /** Usuario que hereda la colección global: la cuenta demo "entrenador", o el primer USER, o el primer usuario. */
    private Long findHeir() {
        return jdbc.query("""
            select id from app_users
            order by (username = 'entrenador') desc, (role = 'USER') desc, id
            limit 1
            """, rs -> rs.next() ? rs.getLong(1) : null);
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbc.queryForObject(
            "select count(*) from information_schema.columns where table_name = ? and column_name = ?",
            Integer.class, table, column);
        return count != null && count > 0;
    }

    private boolean isNullable(String table, String column) {
        String nullable = jdbc.queryForObject(
            "select is_nullable from information_schema.columns where table_name = ? and column_name = ?",
            String.class, table, column);
        return "YES".equals(nullable);
    }
}
