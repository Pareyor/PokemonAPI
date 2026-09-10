package com.pokepulse.init;

import com.pokepulse.entity.PokedexEntry;
import com.pokepulse.entity.PokemonType;

import java.util.ArrayList;
import java.util.List;

public class PokedexData {

    public static List<PokedexEntry> getGen1Entries() {
        List<PokedexEntry> list = new ArrayList<>(154); // 151 Gen1 + Umbreon, Rayquaza, Lucario

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

        // ── Pokémon extra del pool de sobres booster (no son de Gen 1) ──────────
        // Umbreon #197 – Pokémon Luz Lunar (Gen 2)
        list.add(new PokedexEntry(
            197, "Umbreon",
            PokemonType.DARK, null,
            150, 85, 130, 75,
            "Especie registrada en la Pokédex Nacional #197 (Umbreon). " +
            "Cuando expone su cuerpo a la luz de la luna, los anillos dorados de su piel brillan con intensidad. " +
            "Puede segregar un veneno tóxico a través de los poros de su piel cuando está a la defensiva."
        ));

        // Rayquaza #384 – Pokémon Cielo Alto (Gen 3)
        list.add(new PokedexEntry(
            384, "Rayquaza",
            PokemonType.DRAGON, PokemonType.DRAGON,
            190, 145, 95, 115,
            "Especie registrada en la Pokédex Nacional #384 (Rayquaza). " +
            "Vive en la capa de ozono, muy por encima de las nubes. " +
            "Lleva miles de años volando por el cielo sin descender jamás a la superficie. " +
            "Se dice que puede Megaevolucionar sin necesitar Megapiedra."
        ));

        // Lucario #448 – Pokémon Aura (Gen 4)
        list.add(new PokedexEntry(
            448, "Lucario",
            PokemonType.FIGHTING, PokemonType.STEEL,
            145, 120, 80, 105,
            "Especie registrada en la Pokédex Nacional #448 (Lucario). " +
            "Puede detectar el aura de todos los seres vivos, permitiéndole leer pensamientos " +
            "y movimientos del rival. Sus esferas de aura son ineludibles."
        ));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 2 – JOHTO (#152-251)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(152,"Chikorita",PokemonType.GRASS,null,80,55,65,65,
            "Pokémon Hoja de Johto. Exhala un aroma dulce con la hoja de su cabeza que relaja a sus enemigos."));
        list.add(new PokedexEntry(155,"Cyndaquil",PokemonType.FIRE,null,78,68,58,78,
            "Pokémon Ratón Fuego de Johto. Cuando está asustado, las llamas de su lomo se avivan con fuerza."));
        list.add(new PokedexEntry(158,"Totodile",PokemonType.WATER,null,82,62,60,58,
            "Pokémon Cocodrilo de Johto. Sus mandíbulas son tan poderosas que pueden triturar metal sin esfuerzo."));
        list.add(new PokedexEntry(175,"Togepi",PokemonType.NORMAL,null,70,40,60,50,
            "Pokémon Pico de Johto. Guarda en su cáscara rota felicidad que libera en forma de destellos brillantes."));
        list.add(new PokedexEntry(181,"Ampharos",PokemonType.ELECTRIC,null,145,95,85,55,
            "Pokémon Luz de Johto. La punta de su cola brilla tanto que puede verse desde el espacio y servir de faro."));
        list.add(new PokedexEntry(196,"Espeon",PokemonType.PSYCHIC,null,130,130,60,110,
            "Pokémon Sol de Johto. Su pelaje absorbe fotones para potenciar sus devastadores ataques psíquicos."));
        list.add(new PokedexEntry(212,"Scizor",PokemonType.STEEL,PokemonType.STEEL,140,130,100,65,
            "Pokémon Pinza de Johto. Sus tenazas son tan duras como el acero y pueden aplastar rocas enormes de un golpe."));
        list.add(new PokedexEntry(214,"Heracross",PokemonType.FIGHTING,null,160,125,75,85,
            "Pokémon Cuerno de Johto. Su cuerno le permite lanzar rivales de gran tamaño con una sola embestida."));
        list.add(new PokedexEntry(248,"Tyranitar",PokemonType.DARK,null,175,134,110,61,
            "Pokémon Armadura de Johto. Su poderoso cuerpo puede remodelar el paisaje montañoso. No siente miedo de nada."));
        list.add(new PokedexEntry(249,"Lugia",PokemonType.PSYCHIC,null,190,90,130,110,
            "Pokémon Buceo de Johto. Señor de los mares. Con solo agitar sus alas desata tormentas de cuarenta días."));
        list.add(new PokedexEntry(250,"Ho-Oh",PokemonType.FIRE,null,190,130,90,90,
            "Pokémon Arcoíris de Johto. Su vuelo deja un rastro arcoíris en el cielo. Trae felicidad eterna a quien lo ve."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 3 – HOENN (#252-386)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(254,"Sceptile",PokemonType.GRASS,null,130,105,65,120,
            "Pokémon Selva de Hoenn. Las hojas afiladas de su cola pueden cortar cualquier cosa. Trepa árboles con velocidad extraordinaria."));
        list.add(new PokedexEntry(257,"Blaziken",PokemonType.FIRE,PokemonType.FIGHTING,150,120,70,80,
            "Pokémon Llama de Hoenn. Sus patadas envueltas en llamas son más poderosas que las de cualquier luchador conocido."));
        list.add(new PokedexEntry(260,"Swampert",PokemonType.WATER,PokemonType.FIGHTING,165,110,110,60,
            "Pokémon Pez Lodo de Hoenn. Puede arrastrar un barco de carga con facilidad. Presiente tormentas con sus aletas."));
        list.add(new PokedexEntry(282,"Gardevoir",PokemonType.PSYCHIC,null,130,125,65,80,
            "Pokémon Abrazador de Hoenn. Genera un mini agujero negro para proteger a su entrenador. Su lealtad no tiene límites."));
        list.add(new PokedexEntry(373,"Salamence",PokemonType.DRAGON,null,175,135,80,100,
            "Pokémon Dragón de Hoenn. Cuando por fin obtiene sus alas, celebra la alegría volando sin descanso durante días."));
        list.add(new PokedexEntry(376,"Metagross",PokemonType.STEEL,PokemonType.PSYCHIC,170,135,130,70,
            "Pokémon Hierro de Hoenn. Sus cuatro cerebros en sincronía superan la potencia de cualquier supercomputadora."));
        list.add(new PokedexEntry(382,"Kyogre",PokemonType.WATER,null,190,100,90,100,
            "Pokémon Mar de Hoenn. Dios de los océanos. Amplía los mares con las lluvias torrenciales que provoca con sus aletas."));
        list.add(new PokedexEntry(383,"Groudon",PokemonType.FIRE,null,190,150,140,90,
            "Pokémon Continente de Hoenn. Dios de la tierra. Extiende los continentes evaporando el agua con su calor abrasador."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 4 – SINNOH (#387-493)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(389,"Torterra",PokemonType.GRASS,PokemonType.FIGHTING,170,109,105,56,
            "Pokémon Continente de Sinnoh. Pequeños Pokémon habitan en el árbol de su espalda como si fuera un bosque entero."));
        list.add(new PokedexEntry(392,"Infernape",PokemonType.FIRE,PokemonType.FIGHTING,148,104,71,108,
            "Pokémon Llama de Sinnoh. Las llamas de su cabeza nunca se apagan. Lucha con velocidad y potencia inigualables."));
        list.add(new PokedexEntry(395,"Empoleon",PokemonType.WATER,PokemonType.STEEL,160,86,88,60,
            "Pokémon Emperador de Sinnoh. Sus alas de acero cortan el hielo y los icebergs mientras nada a 20 nudos."));
        list.add(new PokedexEntry(405,"Luxray",PokemonType.ELECTRIC,null,145,120,79,70,
            "Pokémon Visión de Sinnoh. Sus ojos eléctricos pueden ver a través de las paredes para localizar a sus presas."));
        list.add(new PokedexEntry(445,"Garchomp",PokemonType.DRAGON,null,170,130,95,102,
            "Pokémon Mach de Sinnoh. Vuela a la velocidad del sonido y caza presas con sus afiladas aletas dentadas."));
        list.add(new PokedexEntry(468,"Togekiss",PokemonType.NORMAL,null,155,75,95,80,
            "Pokémon Bendición de Sinnoh. Solo aparece ante quienes buscan la paz. Derrama lluvia de semillas de alegría."));
        list.add(new PokedexEntry(483,"Dialga",PokemonType.STEEL,PokemonType.DRAGON,190,120,120,90,
            "Pokémon Temporal de Sinnoh. Dios del tiempo. Puede distorsionar el flujo temporal a su voluntad con su rugido."));
        list.add(new PokedexEntry(484,"Palkia",PokemonType.WATER,PokemonType.DRAGON,185,130,90,100,
            "Pokémon Espacial de Sinnoh. Dios del espacio. Habita en una dimensión paralela y puede plegar el espacio a voluntad."));
        list.add(new PokedexEntry(487,"Giratina",PokemonType.DARK,PokemonType.DRAGON,190,100,120,90,
            "Pokémon Revés de Sinnoh. Desterrado al Mundo del Revés por su violencia. Vigila el mundo desde las sombras eternas."));
        list.add(new PokedexEntry(493,"Arceus",PokemonType.NORMAL,null,200,120,120,120,
            "Pokémon Alfa de Sinnoh. Se dice que moldeó el universo entero con sus mil brazos. El primero de todos los Pokémon."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 5 – TESELIA (#494-649)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(497,"Serperior",PokemonType.GRASS,null,135,75,95,113,
            "Pokémon Altivo de Teselia. Solo muestra su poder a rivales dignos. Detiene movimientos del rival con su mirada."));
        list.add(new PokedexEntry(500,"Emboar",PokemonType.FIRE,PokemonType.FIGHTING,175,123,65,65,
            "Pokémon Llama de Teselia. Prende fuego a sus colmillos para usarlos como armas en feroz batalla cuerpo a cuerpo."));
        list.add(new PokedexEntry(503,"Samurott",PokemonType.WATER,null,160,100,85,70,
            "Pokémon Acérrimo de Teselia. Con un solo rugido silencia el campo de batalla. Sus cuernos son espadas naturales."));
        list.add(new PokedexEntry(571,"Zoroark",PokemonType.DARK,null,145,105,60,105,
            "Pokémon Zorro Ilusión de Teselia. Crea ilusiones perfectas para proteger a sus crías, incluso imitando ciudades."));
        list.add(new PokedexEntry(609,"Chandelure",PokemonType.FIRE,PokemonType.DARK,140,145,90,80,
            "Pokémon Lúgubre de Teselia. Absorbe el espíritu de las personas con sus llamas espectrales que arden eternamente."));
        list.add(new PokedexEntry(635,"Hydreigon",PokemonType.DRAGON,PokemonType.DARK,165,125,90,98,
            "Pokémon Feroz de Teselia. Sus tres cabezas atacan sin discriminación. No obedece a quien no lo domine por completo."));
        list.add(new PokedexEntry(643,"Reshiram",PokemonType.FIRE,PokemonType.DRAGON,190,120,100,90,
            "Pokémon Yang Yin de Teselia. El fuego de su cola puede calentar la atmósfera y cambiar el clima del mundo entero."));
        list.add(new PokedexEntry(644,"Zekrom",PokemonType.ELECTRIC,PokemonType.DRAGON,190,120,100,90,
            "Pokémon Yin Yang de Teselia. El generador de su cola produce electricidad devastadora que fulmina todo lo que toca."));
        list.add(new PokedexEntry(646,"Kyurem",PokemonType.DRAGON,null,195,130,90,95,
            "Pokémon Frontera de Teselia. Su cuerpo genera energía helada que puede congelar todo a su alrededor al instante."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 6 – KALOS (#650-721)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(658,"Greninja",PokemonType.WATER,PokemonType.DARK,145,103,67,122,
            "Pokémon Ninja de Kalos. Transforma el agua comprimida en shuriken y los lanza a la velocidad de la luz."));
        list.add(new PokedexEntry(700,"Sylveon",PokemonType.NORMAL,null,150,65,65,60,
            "Pokémon Interlazo de Kalos. Sus tentáculos sedosos emiten energía que calma la agresividad en los combates."));
        list.add(new PokedexEntry(706,"Goodra",PokemonType.DRAGON,null,180,100,70,80,
            "Pokémon Caracol de Kalos. El limo de su cuerpo es extremadamente pegajoso y puede extenderse varios metros."));
        list.add(new PokedexEntry(716,"Xerneas",PokemonType.NORMAL,null,185,131,95,99,
            "Pokémon Vida de Kalos. Dios de la vida. Comparte energía eterna tocando a otros seres con sus cuernos brillantes."));
        list.add(new PokedexEntry(717,"Yveltal",PokemonType.DARK,null,185,131,95,99,
            "Pokémon Destrucción de Kalos. Dios de la muerte. Absorbe la fuerza vital cuando extiende sus oscuras y enormes alas."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 7 – ALOLA (#722-809)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(724,"Decidueye",PokemonType.GRASS,null,148,107,75,70,
            "Pokémon Flecha de Alola. Dispara flechas fantasmales con puntería perfecta desde cualquier distancia."));
        list.add(new PokedexEntry(727,"Incineroar",PokemonType.FIRE,PokemonType.DARK,165,115,90,60,
            "Pokémon Rudeza de Alola. Las llamas de su cinturón se activan con los golpes más potentes de la batalla."));
        list.add(new PokedexEntry(730,"Primarina",PokemonType.WATER,null,165,74,74,60,
            "Pokémon Cantante de Alola. Sus globos de agua danzan al ritmo de su canto hipnotizando a rivales y audiencias."));
        list.add(new PokedexEntry(745,"Lycanroc",PokemonType.FIGHTING,null,125,115,65,112,
            "Pokémon Lobo de Alola. Acepta solo a entrenadores que sean tan feroces como él mismo en el combate."));
        list.add(new PokedexEntry(778,"Mimikyu",PokemonType.DARK,null,115,90,80,96,
            "Pokémon Disfraz de Alola. Vive oculto bajo una funda de Pikachu. Ver lo que hay debajo trae mala suerte."));
        list.add(new PokedexEntry(791,"Solgaleo",PokemonType.PSYCHIC,PokemonType.STEEL,190,137,107,97,
            "Pokémon Emisario del Sol de Alola. Devora la luz del sol y abre portales al Ultraumbral con su corona dorada."));
        list.add(new PokedexEntry(792,"Lunala",PokemonType.PSYCHIC,PokemonType.DARK,190,137,107,97,
            "Pokémon Emisario de la Luna de Alola. Absorbe la luz para crear oscuridad absoluta. Abre portales dimensionales."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 8 – GALAR (#810-905)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(887,"Dragapult",PokemonType.DRAGON,PokemonType.DARK,160,120,75,142,
            "Pokémon Furtivo de Galar. Lanza a sus Dreepy desde el cañón de su cabeza a velocidades supersónicas."));
        list.add(new PokedexEntry(888,"Zacian",PokemonType.STEEL,null,185,170,115,138,
            "Pokémon Héroe de Galar. Porta una espada milenaria. Sus ataques son tan rápidos que el ojo humano no puede seguirlos."));
        list.add(new PokedexEntry(889,"Zamazenta",PokemonType.FIGHTING,PokemonType.STEEL,185,130,145,138,
            "Pokémon Héroe de Galar. Su cuerpo actúa como un escudo indestructible capaz de desviar cualquier ataque conocido."));
        list.add(new PokedexEntry(890,"Eternatus",PokemonType.DARK,null,190,145,85,130,
            "Pokémon Infinito de Galar. Llegó del espacio hace 20000 años. Su núcleo emite una energía oscura colosal e imparable."));

        // ══════════════════════════════════════════════════════════════════════════
        // GEN 9 – PALDEA (#906-1008)
        // ══════════════════════════════════════════════════════════════════════════
        list.add(new PokedexEntry(906,"Sprigatito",PokemonType.GRASS,null,75,55,70,65,
            "Pokémon Hierba Gato de Paldea. Su aroma tiene propiedades hipnóticas que distraen a los rivales en combate."));
        list.add(new PokedexEntry(909,"Fuecoco",PokemonType.FIRE,null,80,65,60,55,
            "Pokémon Fuego Cocodrilo de Paldea. Absorbe calor del entorno para generar energía ígnea en sus escamas de vientre."));
        list.add(new PokedexEntry(912,"Quaxly",PokemonType.WATER,null,75,65,60,55,
            "Pokémon Pato de Paldea. El gel de su cabello repele el agua. Es muy puntilloso con su higiene y apariencia impecable."));
        list.add(new PokedexEntry(995,"Gholdengo",PokemonType.STEEL,null,150,133,91,84,
            "Pokémon Moneda de Paldea. Su cuerpo está formado por 1000 monedas de oro que maneja como proyectiles en combate."));
        list.add(new PokedexEntry(1007,"Koraidon",PokemonType.FIGHTING,PokemonType.DRAGON,190,135,115,135,
            "Pokémon Paradoja de Paldea (pasado). Su poder primitivo arrasador supera con creces cualquier tecnología moderna."));
        list.add(new PokedexEntry(1008,"Miraidon",PokemonType.ELECTRIC,PokemonType.DRAGON,185,135,115,135,
            "Pokémon Paradoja de Paldea (futuro). Su cuerpo es un motor electromagnético que genera energía ilimitada."));

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
