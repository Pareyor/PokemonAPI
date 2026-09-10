package com.pokepulse.init;

import com.pokepulse.entity.PokedexEntry;
import com.pokepulse.entity.PokemonType;

import java.util.ArrayList;
import java.util.List;

public class PokedexData {

    public static List<PokedexEntry> getGen1Entries() {
        List<PokedexEntry> list = new ArrayList<>(151);

        String[] names = {
            "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
            "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree",
            "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot",
            "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok",
            "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
            "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable",
            "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat",
            "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat",
            "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck",
            "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
            "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop",
            "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool",
            "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash",
            "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo",
            "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
            "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee",
            "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute",
            "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung",
            "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela",
            "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu",
            "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar",
            "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto",
            "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte",
            "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno",
            "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo",
            "Mew"
        };

        for (int i = 0; i < names.length; i++) {
            int num = i + 1;
            String name = names[i];
            PokemonType primary = determineType(num);
            PokemonType secondary = determineSecondaryType(num);
            int baseHp = 40 + (num % 60) + (num > 130 ? 40 : 0);
            int baseAtk = 45 + ((num * 3) % 70) + (num > 140 ? 40 : 0);
            int baseDef = 40 + ((num * 2) % 65);
            int baseSpd = 40 + ((num * 5) % 80);
            String desc = "Especie registrada en la Pokédex Nacional #" + String.format("%03d", num) + " (" + name + ").";

            list.add(new PokedexEntry(num, name, primary, secondary, baseHp, baseAtk, baseDef, baseSpd, desc));
        }

        return list;
    }

    private static PokemonType determineType(int num) {
        if (num <= 3) return PokemonType.GRASS;
        if (num <= 6) return PokemonType.FIRE;
        if (num <= 9) return PokemonType.WATER;
        if (num <= 15) return PokemonType.GRASS;
        if (num <= 22) return PokemonType.NORMAL;
        if (num <= 24) return PokemonType.DARK;
        if (num <= 26) return PokemonType.ELECTRIC;
        if (num <= 34) return PokemonType.FIGHTING;
        if (num <= 38) return PokemonType.FIRE;
        if (num <= 40) return PokemonType.NORMAL;
        if (num <= 45) return PokemonType.GRASS;
        if (num <= 49) return PokemonType.DARK;
        if (num <= 51) return PokemonType.FIGHTING;
        if (num <= 53) return PokemonType.NORMAL;
        if (num <= 55) return PokemonType.WATER;
        if (num <= 57) return PokemonType.FIGHTING;
        if (num <= 59) return PokemonType.FIRE;
        if (num <= 62) return PokemonType.WATER;
        if (num <= 65) return PokemonType.PSYCHIC;
        if (num <= 68) return PokemonType.FIGHTING;
        if (num <= 71) return PokemonType.GRASS;
        if (num <= 73) return PokemonType.WATER;
        if (num <= 76) return PokemonType.FIGHTING;
        if (num <= 78) return PokemonType.FIRE;
        if (num <= 80) return PokemonType.WATER;
        if (num <= 82) return PokemonType.ELECTRIC;
        if (num <= 85) return PokemonType.NORMAL;
        if (num <= 87) return PokemonType.WATER;
        if (num <= 89) return PokemonType.DARK;
        if (num <= 91) return PokemonType.WATER;
        if (num <= 94) return PokemonType.DARK;
        if (num == 95) return PokemonType.FIGHTING;
        if (num <= 97) return PokemonType.PSYCHIC;
        if (num <= 99) return PokemonType.WATER;
        if (num <= 101) return PokemonType.ELECTRIC;
        if (num <= 103) return PokemonType.GRASS;
        if (num <= 105) return PokemonType.FIGHTING;
        if (num <= 107) return PokemonType.FIGHTING;
        if (num == 108) return PokemonType.NORMAL;
        if (num <= 110) return PokemonType.DARK;
        if (num <= 112) return PokemonType.FIGHTING;
        if (num == 113) return PokemonType.NORMAL;
        if (num == 114) return PokemonType.GRASS;
        if (num == 115) return PokemonType.NORMAL;
        if (num <= 117) return PokemonType.WATER;
        if (num <= 119) return PokemonType.WATER;
        if (num <= 121) return PokemonType.WATER;
        if (num == 122) return PokemonType.PSYCHIC;
        if (num == 123) return PokemonType.GRASS;
        if (num == 124) return PokemonType.PSYCHIC;
        if (num == 125) return PokemonType.ELECTRIC;
        if (num == 126) return PokemonType.FIRE;
        if (num == 127) return PokemonType.FIGHTING;
        if (num == 128) return PokemonType.NORMAL;
        if (num <= 130) return PokemonType.WATER;
        if (num == 131) return PokemonType.WATER;
        if (num == 132) return PokemonType.NORMAL;
        if (num == 133) return PokemonType.NORMAL;
        if (num == 134) return PokemonType.WATER;
        if (num == 135) return PokemonType.ELECTRIC;
        if (num == 136) return PokemonType.FIRE;
        if (num == 137) return PokemonType.NORMAL;
        if (num <= 141) return PokemonType.WATER;
        if (num == 142) return PokemonType.FIGHTING;
        if (num == 143) return PokemonType.NORMAL;
        if (num == 144) return PokemonType.WATER;
        if (num == 145) return PokemonType.ELECTRIC;
        if (num == 146) return PokemonType.FIRE;
        if (num <= 149) return PokemonType.DRAGON;
        if (num <= 151) return PokemonType.PSYCHIC;
        return PokemonType.NORMAL;
    }

    private static PokemonType determineSecondaryType(int num) {
        if (num == 6) return PokemonType.DRAGON;
        if (num == 9) return PokemonType.STEEL;
        if (num == 12) return PokemonType.NORMAL;
        if (num == 18) return PokemonType.NORMAL;
        if (num == 62) return PokemonType.FIGHTING;
        if (num == 80) return PokemonType.PSYCHIC;
        if (num == 82) return PokemonType.STEEL;
        if (num == 94) return PokemonType.DARK;
        if (num == 121) return PokemonType.PSYCHIC;
        if (num == 130) return PokemonType.DRAGON;
        if (num == 144) return PokemonType.NORMAL;
        if (num == 145) return PokemonType.NORMAL;
        if (num == 146) return PokemonType.NORMAL;
        if (num == 149) return PokemonType.DRAGON;
        return null;
    }
}
