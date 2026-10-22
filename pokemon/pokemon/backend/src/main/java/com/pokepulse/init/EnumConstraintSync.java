package com.pokepulse.init;

import com.pokepulse.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Hibernate crea un CHECK por cada columna {@code @Enumerated(STRING)} con los valores que tenía el enum
 * en ese momento, y {@code ddl-auto=update} nunca lo actualiza. Al añadir valores (SECRET_RARE, tipos BUG/ROCK…)
 * los INSERT fallaban con error 500. Este paso rehace esos CHECK con los valores actuales en cada arranque.
 */
@Component
@Order(0)
public class EnumConstraintSync implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EnumConstraintSync.class);

    private record EnumColumn(String table, String column, Class<? extends Enum<?>> type) {}

    private static final List<EnumColumn> COLUMNS = List.of(
        new EnumColumn("pokemon_cards", "rarity", CardRarity.class),
        new EnumColumn("pokemon_cards", "type", PokemonType.class),
        new EnumColumn("pokedex_entries", "primary_type", PokemonType.class),
        new EnumColumn("pokedex_entries", "secondary_type", PokemonType.class),
        new EnumColumn("sealed_packs", "pack_type", BoosterPackType.class),
        new EnumColumn("battle_sessions", "status", BattleStatus.class),
        new EnumColumn("app_users", "role", UserRole.class)
    );

    private final JdbcTemplate jdbc;

    public EnumConstraintSync(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (EnumColumn c : COLUMNS) {
            Integer exists = jdbc.queryForObject(
                "select count(*) from information_schema.columns where table_name = ? and column_name = ?",
                Integer.class, c.table(), c.column());
            if (exists == null || exists == 0) continue;

            String values = Arrays.stream(c.type().getEnumConstants())
                .map(e -> "'" + e.name() + "'")
                .collect(Collectors.joining(", "));
            String name = c.table() + "_" + c.column() + "_check";
            String expected = "check (" + c.column() + " in (" + values + "))";

            String current = jdbc.query("select pg_get_constraintdef(oid) from pg_constraint where conname = ?",
                rs -> rs.next() ? rs.getString(1) : null, name);
            boolean upToDate = current != null && Arrays.stream(c.type().getEnumConstants())
                .allMatch(e -> current.contains("'" + e.name() + "'"));
            if (upToDate) continue;

            jdbc.execute("alter table " + c.table() + " drop constraint if exists " + name);
            jdbc.execute("alter table " + c.table() + " add constraint " + name + " " + expected);
            log.info("Restricción {} actualizada a los valores actuales de {}", name, c.type().getSimpleName());
        }
    }
}
