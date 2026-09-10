package com.pokepulse.init;

import com.pokepulse.entity.PokedexEntry;
import com.pokepulse.entity.PokemonType;

import java.util.ArrayList;
import java.util.List;

public class PokedexData {

    public static List<PokedexEntry> getGen1Entries() {
        List<PokedexEntry> list = new ArrayList<>(400); // Kanto + Johto + Hoenn + Sinnoh + Teselia + Kalos + Alola + Galar + Paldea

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

        // ══════════════════════════════════════════════════════════════════════════
        // EXPANDED MULTI-GEN COLLECTION (+125 NEW NON-REPEATED POKÉMON)
        // ══════════════════════════════════════════════════════════════════════════
        // ── GEN 2 EXTENDED ──
        list.add(new PokedexEntry(154,"Meganium",PokemonType.GRASS,null,160,82,100,80,"Pokémon Hierba de Johto. Su aliento revive la hierba y los árboles marchitos devolviendo la vida al bosque."));
        list.add(new PokedexEntry(157,"Typhlosion",PokemonType.FIRE,null,158,109,78,100,"Pokémon Volcán de Johto. Ataca rodeado de un aura abrasadora. Puede frotar su pelaje para causar explosiones."));
        list.add(new PokedexEntry(160,"Feraligatr",PokemonType.WATER,null,170,105,100,78,"Pokémon Fauces de Johto. Abre sus descomunales mandíbulas para destrozar al rival sin dejarlo escapar."));
        list.add(new PokedexEntry(169,"Crobat",PokemonType.DARK,null,165,90,80,130,"Pokémon Murciélago de Johto. Sus cuatro alas le permiten volar en absoluto silencio a través de la noche."));
        list.add(new PokedexEntry(172,"Pichu",PokemonType.ELECTRIC,null,70,40,35,60,"Pokémon Ratoncito de Johto. Aún no domina el almacenamiento eléctrico y descarga chispas involuntarias."));
        list.add(new PokedexEntry(179,"Mareep",PokemonType.ELECTRIC,null,75,40,40,35,"Pokémon Lana de Johto. Su pelaje de lana esponjosa acumula electricidad estática con el roce."));
        list.add(new PokedexEntry(185,"Sudowoodo",PokemonType.FIGHTING,null,140,100,115,30,"Pokémon Imitación de Johto. Se camufla como un árbol para evitar problemas, odia el agua intensamente."));
        list.add(new PokedexEntry(186,"Politoed",PokemonType.WATER,null,170,75,75,70,"Pokémon Rana de Johto. El mechón rizado de su cabeza es su orgullo. Su canto reúne a Poliwag y Poliwhirl."));
        list.add(new PokedexEntry(199,"Slowking",PokemonType.WATER,PokemonType.PSYCHIC,175,75,80,30,"Pokémon Regio de Johto. Al ser mordido por Shellder en la cabeza, adquirió una inteligencia comparable a genios."));
        list.add(new PokedexEntry(202,"Wobbuffet",PokemonType.PSYCHIC,null,250,33,58,33,"Pokémon Paciente de Johto. Odia la luz y protege su misteriosa cola a toda costa. Solo contraataca."));
        list.add(new PokedexEntry(208,"Steelix",PokemonType.STEEL,PokemonType.FIGHTING,165,85,200,30,"Pokémon Serpiente Férrea de Johto. Su cuerpo templado bajo tierra es más duro que el diamante industrial."));
        list.add(new PokedexEntry(227,"Skarmory",PokemonType.STEEL,null,145,80,140,70,"Pokémon Coraza Ave de Johto. Sus alas de acero afilado se desprenden tras combates y vuelven a crecer más fuertes."));
        list.add(new PokedexEntry(229,"Houndoom",PokemonType.DARK,PokemonType.FIRE,150,90,50,95,"Pokémon Siniestro de Johto. Si te quema con las llamas tóxicas de su boca, el dolor durará para siempre."));
        list.add(new PokedexEntry(230,"Kingdra",PokemonType.WATER,PokemonType.DRAGON,165,95,95,85,"Pokémon Dragón de Johto. Duerme en simas abisales. Cuando despierta crea remolinos que tragan navíos."));
        list.add(new PokedexEntry(232,"Donphan",PokemonType.FIGHTING,null,160,120,120,50,"Pokémon Armadura de Johto. Ataca enrollándose como una rueda gigante de roca que arrasa con todo a su paso."));
        list.add(new PokedexEntry(242,"Blissey",PokemonType.NORMAL,null,255,10,10,55,"Pokémon Felicidad de Johto. Quien prueba un bocado de su huevo se llena de alegría y bondad infinita."));
        list.add(new PokedexEntry(243,"Raikou",PokemonType.ELECTRIC,null,170,85,75,115,"Pokémon Trueno de Johto. Encarna la velocidad del rayo. Sus rugidos desatan ondas sísmicas en el aire."));
        list.add(new PokedexEntry(244,"Entei",PokemonType.FIRE,null,195,115,85,100,"Pokémon Volcán de Johto. Nació de la erupción de un volcán. Sus ladridos provocan erupciones en todo el mundo."));
        list.add(new PokedexEntry(245,"Suicune",PokemonType.WATER,null,180,75,115,85,"Pokémon Aurora de Johto. Encarna la pureza del manantial. Purifica las aguas turbias con solo rozarlas."));
        list.add(new PokedexEntry(251,"Celebi",PokemonType.GRASS,PokemonType.PSYCHIC,180,100,100,100,"Pokémon Viajero Tiempo de Johto. Puede cruzar el flujo del tiempo a voluntad. Trae verdor a donde viaja."));

        // ── GEN 3 EXTENDED ──
        list.add(new PokedexEntry(252,"Treecko",PokemonType.GRASS,null,75,45,35,70,"Pokémon Geco Bosque de Hoenn. Trepa por superficies verticales gracias a los diminutos ganchos de sus patas."));
        list.add(new PokedexEntry(255,"Torchic",PokemonType.FIRE,null,75,60,40,45,"Pokémon Polluelo de Hoenn. Almacena fuego en su interior. Abraza a su entrenador irradiando agradable calor."));
        list.add(new PokedexEntry(258,"Mudkip",PokemonType.WATER,null,80,70,50,40,"Pokémon Pez Fango de Hoenn. La aleta de su cabeza actúa como un radar ultrasensible que detecta peligros."));
        list.add(new PokedexEntry(277,"Swellow",PokemonType.NORMAL,null,140,85,60,125,"Pokémon Buche de Hoenn. Vuela elegantemente por el cielo y se lanza en picado implacable contra sus presas."));
        list.add(new PokedexEntry(286,"Breloom",PokemonType.GRASS,PokemonType.FIGHTING,140,130,80,70,"Pokémon Hongo de Hoenn. Estira sus brazos elásticos para asestar puñetazos con la velocidad de un boxeador profesional."));
        list.add(new PokedexEntry(289,"Slaking",PokemonType.NORMAL,null,220,160,100,100,"Pokémon Holgazán de Hoenn. El Pokémon no legendario con mayor poder físico latente, aunque prefiere holgazanear."));
        list.add(new PokedexEntry(302,"Sableye",PokemonType.DARK,null,130,75,75,50,"Pokémon Oscuridad de Hoenn. Se alimenta de gemas preciosas en cavernas profundas, lo que transformó sus ojos en joyas."));
        list.add(new PokedexEntry(303,"Mawile",PokemonType.STEEL,null,130,85,85,50,"Pokémon Tramposo de Hoenn. Engaña con su rostro dócil para atrapar al rival con la enorme mandíbula de su cabeza."));
        list.add(new PokedexEntry(306,"Aggron",PokemonType.STEEL,null,150,110,180,50,"Pokémon Armadura de Hoenn. Reclama montañas enteras como su territorio y repara cualquier daño al entorno natural."));
        list.add(new PokedexEntry(310,"Manectric",PokemonType.ELECTRIC,null,150,75,60,105,"Pokémon Descarga de Hoenn. Descarga electricidad desde su melena erizada creando nubes de tormenta en el cielo."));
        list.add(new PokedexEntry(319,"Sharpedo",PokemonType.WATER,PokemonType.DARK,150,120,40,95,"Pokémon Voraz de Hoenn. El terror de los mares. Expulsa agua por la parte trasera para alcanzar los 120 km/h."));
        list.add(new PokedexEntry(321,"Wailord",PokemonType.WATER,null,250,90,45,60,"Pokémon Ballena Flotante de Hoenn. El Pokémon de mayor tamaño conocido. Inhala aire para sumergirse a 3.000 metros."));
        list.add(new PokedexEntry(324,"Torkoal",PokemonType.FIRE,null,150,85,140,20,"Pokémon Carbón de Hoenn. Quema carbón dentro de su caparazón para generar energía y expulsa humo negro al defenderse."));
        list.add(new PokedexEntry(330,"Flygon",PokemonType.DRAGON,PokemonType.FIGHTING,160,100,80,100,"Pokémon Místico de Hoenn. Bate sus alas levantando tormentas de arena. Su aleteo suena como una dulce melodía."));
        list.add(new PokedexEntry(334,"Altaria",PokemonType.DRAGON,null,155,70,90,80,"Pokémon Cantor de Hoenn. Vuela entre nubes de algodón cantando con una voz de soprano que cautiva a quien la escucha."));
        list.add(new PokedexEntry(335,"Zangoose",PokemonType.NORMAL,null,153,115,60,90,"Pokémon Hurón de Hoenn. Enemigo acérrimo de Seviper. Sus afiladas garras cortan con furia cegadora."));
        list.add(new PokedexEntry(350,"Milotic",PokemonType.WATER,null,175,60,79,81,"Pokémon Tierno de Hoenn. Considerado el Pokémon más hermoso del mundo. Su presencia calma toda ira y hostilidad."));
        list.add(new PokedexEntry(354,"Banette",PokemonType.DARK,null,144,115,65,65,"Pokémon Títere de Hoenn. Un muñeco de felpa abandonado que cobró vida gracias al rencor. Abre su boca con cremallera."));
        list.add(new PokedexEntry(359,"Absol",PokemonType.DARK,null,145,130,60,75,"Pokémon Catástrofe de Hoenn. Aparece ante la gente solo cuando presiente una catástrofe natural inminente."));
        list.add(new PokedexEntry(380,"Latias",PokemonType.DRAGON,PokemonType.PSYCHIC,160,80,90,110,"Pokémon Eón de Hoenn. Muy sensible a las emociones humanas. Puede comunicarse telepáticamente y hacerse invisible."));
        list.add(new PokedexEntry(381,"Latios",PokemonType.DRAGON,PokemonType.PSYCHIC,160,90,80,110,"Pokémon Eón de Hoenn. Vuela más rápido que un avión a reacción replegando sus alas. Solo confía en entrenadores nobles."));
        list.add(new PokedexEntry(385,"Jirachi",PokemonType.STEEL,PokemonType.PSYCHIC,180,100,100,100,"Pokémon Deseo de Hoenn. Despierta una semana cada mil años para conceder cualquier deseo que le escriban en sus notas."));
        list.add(new PokedexEntry(386,"Deoxys",PokemonType.PSYCHIC,null,130,150,50,150,"Pokémon ADN de Hoenn. Virus alienígena mutado por un rayo láser espacial. Cambia de forma para combatir."));

        // ── GEN 4 EXTENDED ──
        list.add(new PokedexEntry(387,"Turtwig",PokemonType.GRASS,null,85,68,64,31,"Pokémon Hojita de Sinnoh. El caparazón de su espalda está hecho de tierra fértil y se endurece cuando bebe agua."));
        list.add(new PokedexEntry(390,"Chimchar",PokemonType.FIRE,null,74,58,44,61,"Pokémon Chimpancé de Sinnoh. Muy ágil escalando acantilados. El fuego de su cola es alimentado por gases de su vientre."));
        list.add(new PokedexEntry(393,"Piplup",PokemonType.WATER,null,83,51,53,40,"Pokémon Pingüino de Sinnoh. Extremadamente orgulloso, le disgusta recibir comida de desconocidos."));
        list.add(new PokedexEntry(398,"Staraptor",PokemonType.NORMAL,null,165,120,70,100,"Pokémon Depredador de Sinnoh. Nunca deja de luchar aunque esté herido. El tupé de su cabeza intimida a sus rivales."));
        list.add(new PokedexEntry(407,"Roserade",PokemonType.GRASS,null,140,70,65,90,"Pokémon Ramillete de Sinnoh. Oculta látigos con espinas venenosas en sus ramos de flores de dulce fragancia."));
        list.add(new PokedexEntry(419,"Floatzel",PokemonType.WATER,null,165,105,55,115,"Pokémon Nutria de Sinnoh. Su saco de flotación le permite rescatar a personas que caen a ríos turbulentos."));
        list.add(new PokedexEntry(430,"Honchkrow",PokemonType.DARK,null,180,125,52,71,"Pokémon Gran Jefe de Sinnoh. Es el cabecilla de una bandada de Murkrow. Jamás perdona los errores de sus subordinados."));
        list.add(new PokedexEntry(442,"Spiritomb",PokemonType.DARK,null,130,92,108,35,"Pokémon Prohibido de Sinnoh. Compuesto por 108 espíritus atrapados en una piedra fisurada hace 500 años."));
        list.add(new PokedexEntry(454,"Toxicroak",PokemonType.FIGHTING,PokemonType.DARK,163,106,65,85,"Pokémon Boca Tóxica de Sinnoh. Las garras de sus puños segregan un veneno tan potente que un rasguño es letal."));
        list.add(new PokedexEntry(461,"Weavile",PokemonType.DARK,null,150,120,65,125,"Pokémon Garra Filo de Sinnoh. Caza en manada coordinándose mediante marcas talladas con sus garras en árboles y rocas."));
        list.add(new PokedexEntry(462,"Magnezone",PokemonType.ELECTRIC,PokemonType.STEEL,150,70,115,60,"Pokémon Imán de Sinnoh. Tres Magneton unidos por un campo magnético colosal. Patrulla el cielo disparando rayos."));
        list.add(new PokedexEntry(464,"Rhyperior",PokemonType.FIGHTING,null,195,140,130,40,"Pokémon Taladro de Sinnoh. Carga rocas en los orificios de sus palmas y las dispara con fuerza descomunal."));
        list.add(new PokedexEntry(466,"Electivire",PokemonType.ELECTRIC,null,155,123,67,95,"Pokémon Rayo de Sinnoh. Junta sus dos colas para descargar más de 20.000 voltios de electricidad sobre su presa."));
        list.add(new PokedexEntry(467,"Magmortar",PokemonType.FIRE,null,155,95,67,83,"Pokémon Explosión de Sinnoh. Dispara bolas de fuego a 2.000 °C desde los extremos de sus brazos cañón."));
        list.add(new PokedexEntry(470,"Leafeon",PokemonType.GRASS,null,145,110,130,95,"Pokémon Verdor de Sinnoh. Su estructura celular es similar a las plantas, por lo que puede realizar la fotosíntesis."));
        list.add(new PokedexEntry(471,"Glaceon",PokemonType.WATER,null,145,60,110,65,"Pokémon Nieve Fresca de Sinnoh. Congela su pelaje para convertirlo en agujas afiladas de hielo que dispara al rival."));
        list.add(new PokedexEntry(475,"Gallade",PokemonType.PSYCHIC,PokemonType.FIGHTING,148,125,65,80,"Pokémon Cuchilla de Sinnoh. Maestro de la cortesía y la espada. Extiende las cuchillas de sus codos para combatir con honor."));
        list.add(new PokedexEntry(477,"Dusknoir",PokemonType.DARK,null,135,100,135,45,"Pokémon Pinzas de Sinnoh. La antena de su cabeza recibe ondas del mundo de los espíritus ordenándole guiar almas perdidas."));
        list.add(new PokedexEntry(478,"Froslass",PokemonType.DARK,PokemonType.WATER,150,80,70,110,"Pokémon Tierra Nieve de Sinnoh. Congela a sus presas con un gélido aliento a -50 °C y las exhibe en cuevas secretas."));
        list.add(new PokedexEntry(479,"Rotom",PokemonType.ELECTRIC,null,130,50,77,91,"Pokémon Plasma de Sinnoh. Su cuerpo hecho de plasma eléctrico le permite infiltrarse y tomar control de aparatos."));
        list.add(new PokedexEntry(485,"Heatran",PokemonType.FIRE,PokemonType.STEEL,171,90,106,77,"Pokémon Domo Lava de Sinnoh. Habita en cráteres volcánicos. Su cuerpo de acero semiderretido hierve con magma ardiente."));
        list.add(new PokedexEntry(488,"Cresselia",PokemonType.PSYCHIC,null,200,70,120,85,"Pokémon Lunar de Sinnoh. El velo resplandeciente de su cuerpo ahuyenta las pesadillas y trae sueños hermosos."));
        list.add(new PokedexEntry(491,"Darkrai",PokemonType.DARK,null,150,90,90,125,"Pokémon Oscuridad de Sinnoh. Puede adormecer a personas y Pokémon provocándoles pesadillas eternas para defenderse."));
        list.add(new PokedexEntry(492,"Shaymin",PokemonType.GRASS,null,180,100,100,100,"Pokémon Gratitud de Sinnoh. Disuelve toxinas en el aire para transformar tierras baldías en hermosos campos de flores."));

        // ── GEN 5 EXTENDED ──
        list.add(new PokedexEntry(494,"Victini",PokemonType.FIRE,PokemonType.PSYCHIC,180,100,100,100,"Pokémon Victoria de Teselia. Se dice que el entrenador que lleve a Victini consigo ganará cualquier combate sin excepción."));
        list.add(new PokedexEntry(495,"Snivy",PokemonType.GRASS,null,75,45,55,63,"Pokémon Serpiente Hierba de Teselia. Muy inteligente y sereno. Baña su cola en luz solar para moverse más velozmente."));
        list.add(new PokedexEntry(498,"Tepig",PokemonType.FIRE,null,95,63,45,45,"Pokémon Cerdo Fuego de Teselia. Sopla fuego por el hocico cuando está resfriado. Asa bayas antes de comerlas."));
        list.add(new PokedexEntry(501,"Oshawott",PokemonType.WATER,null,85,55,45,45,"Pokémon Nutria de Teselia. Lucha desprendiendo la concha de su vientre llamada vieira para usarla como daga y escudo."));
        list.add(new PokedexEntry(526,"Gigalith",PokemonType.FIGHTING,null,165,135,130,25,"Pokémon Comprimido de Teselia. Dispara energía solar comprimida en sus cristales anaranjados con poder suficiente para volar montañas."));
        list.add(new PokedexEntry(530,"Excadrill",PokemonType.STEEL,PokemonType.FIGHTING,190,135,60,88,"Pokémon Subterráneo de Teselia. Su taladro de acero evolucionado perfora placas de hierro sólido a gran velocidad."));
        list.add(new PokedexEntry(534,"Conkeldurr",PokemonType.FIGHTING,null,185,140,95,45,"Pokémon Musculoso de Teselia. Maneja pilares de hormigón con maestría técnica. Se dice que enseñó el hormigón a los humanos."));
        list.add(new PokedexEntry(545,"Scolipede",PokemonType.DARK,null,140,100,89,112,"Pokémon Megaciempiés de Teselia. Arremete contra su presa con velocidad vertiginosa y la ensarta con sus garras venenosas."));
        list.add(new PokedexEntry(553,"Krookodile",PokemonType.DARK,PokemonType.FIGHTING,175,117,80,92,"Pokémon Intimidación de Teselia. Sus mandíbulas pueden partir un automóvil por la mitad sin perder ni un diente."));
        list.add(new PokedexEntry(555,"Darmanitan",PokemonType.FIRE,null,185,140,55,95,"Pokémon Candente de Teselia. Su pasión interna arde a 1.400 °C. Puede destruir un camión de un solo puñetazo."));
        list.add(new PokedexEntry(560,"Scrafty",PokemonType.DARK,PokemonType.FIGHTING,145,90,115,58,"Pokémon Macarra de Teselia. Tira de su piel suelta para amortiguar golpes y luego responde con cabezazos contundentes."));
        list.add(new PokedexEntry(579,"Reuniclus",PokemonType.PSYCHIC,null,190,65,75,30,"Pokémon Multiplicación de Teselia. Sus brazos de líquido especial pueden aplastar rocas gigantes con agarres telequinéticos."));
        list.add(new PokedexEntry(598,"Ferrothorn",PokemonType.GRASS,PokemonType.STEEL,154,94,131,20,"Pokémon Vaina Espina de Teselia. Se adhiere al techo de cavernas y dispara púas metálicas impregnadas en savia ácida."));
        list.add(new PokedexEntry(604,"Eelektross",PokemonType.ELECTRIC,null,165,115,80,50,"Pokémon Electropez de Teselia. Sale del océano arrastrándose con sus brazos para capturar presas y electrocutarlas al instante."));
        list.add(new PokedexEntry(612,"Haxorus",PokemonType.DRAGON,null,156,147,90,97,"Pokémon Mandíbula Hacha de Teselia. Sus colmillos de hacha cortan vigas de acero con facilidad pasmosa. Muy dócil pero implacable."));
        list.add(new PokedexEntry(625,"Bisharp",PokemonType.DARK,PokemonType.STEEL,145,125,100,70,"Pokémon Filoespada de Teselia. Lidera grupos de Pawniard. No muestra piedad alguna al asestar el golpe de gracia."));
        list.add(new PokedexEntry(637,"Volcarona",PokemonType.FIRE,null,165,60,65,100,"Pokémon Sol de Teselia. En inviernos gélidos, sus alas llameantes salvaron a personas y Pokémon del congelamiento total."));

        // ── GEN 6 EXTENDED ──
        list.add(new PokedexEntry(650,"Chespin",PokemonType.GRASS,null,86,61,65,38,"Pokémon Castaña de Kalos. Las púas de su cabeza son blandas normalmente, pero se endurecen tanto que rompen rocas."));
        list.add(new PokedexEntry(653,"Fennekin",PokemonType.FIRE,null,70,45,40,60,"Pokémon Zorro de Kalos. Come ramitas para avivar su fuego interior y expulsa aire a más de 200 °C por las orejas."));
        list.add(new PokedexEntry(656,"Froakie",PokemonType.WATER,null,71,56,40,71,"Pokémon Burburrana de Kalos. Crea burbujas flexibles en el pecho y espalda que absorben el impacto de ataques enemigos."));
        list.add(new PokedexEntry(663,"Talonflame",PokemonType.FIRE,null,158,81,71,126,"Pokémon Llama de Kalos. En el clímax del combate, desciende en picado a 500 km/h envuelto en llamaradas colosales."));
        list.add(new PokedexEntry(675,"Pangoro",PokemonType.FIGHTING,PokemonType.DARK,175,124,78,58,"Pokémon Pendenciero de Kalos. De carácter gruñón pero corazón noble. No tolera que abusen de los más débiles."));
        list.add(new PokedexEntry(681,"Aegislash",PokemonType.STEEL,PokemonType.DARK,140,140,140,60,"Pokémon Espada Real de Kalos. Sus poderes espirituales le permitieron gobernar a reyes y detectar líderes natos."));
        list.add(new PokedexEntry(701,"Hawlucha",PokemonType.FIGHTING,null,158,92,75,118,"Pokémon Lucha Libre de Kalos. Salta con agilidad desde las alturas para ejecutar llaves aéreas espectaculares."));
        list.add(new PokedexEntry(715,"Noivern",PokemonType.DRAGON,null,165,70,80,123,"Pokémon Onda Sónica de Kalos. Vuela en noches oscuras guiado por ondas ultrasónicas capaces de pulverizar cantos rodados."));
        list.add(new PokedexEntry(718,"Zygarde",PokemonType.DRAGON,PokemonType.FIGHTING,188,100,121,95,"Pokémon Equilibrio de Kalos. Vigila el ecosistema desde las profundidades. Revela su poder total si el planeta peligra."));

        // ── GEN 7 EXTENDED ──
        list.add(new PokedexEntry(722,"Rowlet",PokemonType.GRASS,null,88,55,55,42,"Pokémon Pluma Hoja de Alola. Gira el cuello 180 grados y ataca lanzando plumas afiladas como cuchillos sin hacer ruido."));
        list.add(new PokedexEntry(725,"Litten",PokemonType.FIRE,null,75,65,40,70,"Pokémon Gato Fuego de Alola. Se acicala ingiriendo su pelaje para luego escupir bolas de fuego abrasadoras."));
        list.add(new PokedexEntry(728,"Popplio",PokemonType.WATER,null,80,54,54,40,"Pokémon León Marino de Alola. Hincha globos de agua desde su nariz y practica piruetas acrobáticas con dedicación."));
        list.add(new PokedexEntry(738,"Vikavolt",PokemonType.ELECTRIC,null,157,70,90,43,"Pokémon Escarabajo Trueno de Alola. Concentra electricidad entre sus enormes mandíbulas y la dispara como rayo acelerador."));
        list.add(new PokedexEntry(748,"Toxapex",PokemonType.WATER,PokemonType.DARK,130,63,152,35,"Pokémon Estrella Veneno de Alola. Se guarece en su cúpula de doce patas venenosas resistiendo las mareas más violentas."));
        list.add(new PokedexEntry(760,"Bewear",PokemonType.NORMAL,PokemonType.FIGHTING,200,125,80,60,"Pokémon Fuerte de Alola. Posee una fuerza hercúlea descomunal. Sus abrazos afectuosos pueden partir árboles de cuajo."));
        list.add(new PokedexEntry(774,"Minior",PokemonType.FIGHTING,null,140,100,60,120,"Pokémon Meteoro de Alola. Cae de la capa de ozono tras romperse su coraza pesada, revelando un núcleo resplandeciente."));
        list.add(new PokedexEntry(784,"Kommo-o",PokemonType.DRAGON,PokemonType.FIGHTING,155,110,125,85,"Pokémon Escama de Alola. Hace sonar las escamas metálicas de su cuerpo para amedrentar a cualquier adversario."));
        list.add(new PokedexEntry(785,"Tapu Koko",PokemonType.ELECTRIC,null,150,115,85,130,"Pokémon Dios Nativo de Alola. Espíritu guardián de Melemele. Invoca relámpagos furiosos cuando entra en cólera."));
        list.add(new PokedexEntry(800,"Necrozma",PokemonType.PSYCHIC,null,177,107,101,79,"Pokémon Prisma de Alola. Criatura milenaria que viaja entre dimensiones devorando luz solar y lunar para subsistir."));
        list.add(new PokedexEntry(807,"Zeraora",PokemonType.ELECTRIC,null,168,112,75,143,"Pokémon Fulgor de Alola. Desgarra a sus oponentes con zarpas electrificadas a la velocidad del trueno."));

        // ── GEN 8 EXTENDED ──
        list.add(new PokedexEntry(810,"Grookey",PokemonType.GRASS,null,80,65,50,65,"Pokémon Chimpancé de Galar. Golpea el suelo con su baqueta mágica revitalizando las plantas a su alrededor con ritmo."));
        list.add(new PokedexEntry(813,"Scorbunny",PokemonType.FIRE,null,80,71,40,69,"Pokémon Conejo de Galar. Corre en círculos para calentar las almohadillas de sus patas y soltar patadas incandescentes."));
        list.add(new PokedexEntry(815,"Cinderace",PokemonType.FIRE,null,160,116,75,119,"Pokémon Delantero de Galar. Malabarea con piedras imbuyéndolas en llamas para disparar tiros imparables a puerta."));
        list.add(new PokedexEntry(816,"Sobble",PokemonType.WATER,null,80,40,40,70,"Pokémon Renacuajo de Galar. Llora copiosamente cuando se asusta, liberando una sustancia química que hace llorar a todos."));
        list.add(new PokedexEntry(823,"Corviknight",PokemonType.STEEL,null,178,87,105,67,"Pokémon Cuervo de Galar. El monarca de los cielos de Galar. Su cuerpo blindado de acero negro es inquebrantable."));
        list.add(new PokedexEntry(849,"Toxtricity",PokemonType.ELECTRIC,PokemonType.DARK,155,98,70,75,"Pokémon Punk de Galar. Rasguea las protuberancias de su pecho para generar acordes de guitarra eléctrica pura."));
        list.add(new PokedexEntry(861,"Grimmsnarl",PokemonType.DARK,null,175,120,65,60,"Pokémon Pelo Duro de Galar. Enrolla sus largos mechones de pelo oscuro alrededor de sus músculos para multiplicar su fuerza."));
        list.add(new PokedexEntry(892,"Urshifu",PokemonType.FIGHTING,PokemonType.DARK,180,130,100,97,"Pokémon Kárate de Galar. Maestro supremo del combate marcial. Sus golpes atraviesan cualquier defensa del oponente."));
        list.add(new PokedexEntry(894,"Regieleki",PokemonType.ELECTRIC,null,160,100,50,200,"Pokémon Electrón de Galar. Está formado enteramente de energía eléctrica pura. Es el Pokémon más veloz conocido."));

        // ── GEN 9 EXTENDED ──
        list.add(new PokedexEntry(908,"Meowscarada",PokemonType.GRASS,PokemonType.DARK,156,110,70,123,"Pokémon Mago de Paldea. Oculta bombas de polen floral en su capa y las hace detonar con chasquidos sorpresivos."));
        list.add(new PokedexEntry(911,"Skeledirge",PokemonType.FIRE,PokemonType.DARK,184,75,100,66,"Pokémon Cantante de Paldea. El pájaro de fuego en su hocico cobra vida con su voz y abrasa a los rivales con notas ígneas."));
        list.add(new PokedexEntry(914,"Quaquaval",PokemonType.WATER,PokemonType.FIGHTING,165,120,80,85,"Pokémon Danza de Paldea. Ejecuta pasos de baile exóticos mientras asesta patadas acuáticas fulminantes con ritmo sin igual."));
        list.add(new PokedexEntry(936,"Armarouge",PokemonType.FIRE,PokemonType.PSYCHIC,165,60,100,75,"Pokémon Cañón de Paldea. Su armadura perteneció a un guerrero distinguido. Dispara proyectiles ígneos desde sus hombros."));
        list.add(new PokedexEntry(937,"Ceruledge",PokemonType.FIRE,PokemonType.DARK,155,125,80,85,"Pokémon Espada Ígnea de Paldea. Sus espadas arden con fuego fantasmal alimentado por el rencor de guerreros caídos."));
        list.add(new PokedexEntry(969,"Tinkaton",PokemonType.STEEL,null,165,75,77,94,"Pokémon Martillo de Paldea. Maneja con soltura un martillo de 100 kg forjado con restos de Corviknight derribados."));
        list.add(new PokedexEntry(979,"Annihilape",PokemonType.FIGHTING,PokemonType.DARK,190,115,80,90,"Pokémon Furia Mono de Paldea. Su ira acumulada superó los límites físicos permitiéndole alcanzar una fuerza espectral temible."));
        list.add(new PokedexEntry(983,"Kingambit",PokemonType.DARK,PokemonType.STEEL,180,135,120,50,"Pokémon Comandante de Paldea. Dirige ejércitos de Bisharp sentado en su trono móvil. Corta montañas enteras con su espada."));
        list.add(new PokedexEntry(1002,"Chien-Pao",PokemonType.DARK,PokemonType.WATER,160,120,80,135,"Pokémon Espada Gélida de Paldea. Tesoro de la ruina nacido del rencor de espadas antiguas. Desliza sobre avalanchas."));
        list.add(new PokedexEntry(1004,"Chi-Yu",PokemonType.DARK,PokemonType.FIRE,145,80,80,100,"Pokémon Abalorio Ígneo de Paldea. Tesoro de la ruina nacido de la envidia contenida en abalorios que arden a 3.000 °C."));
        list.add(new PokedexEntry(1017,"Ogerpon",PokemonType.GRASS,null,160,120,84,110,"Pokémon Máscara de Paldea. Porta máscaras que alteran su energía elemental. Es travieso pero leal con quien confía."));
        list.add(new PokedexEntry(1024,"Terapagos",PokemonType.NORMAL,null,175,65,85,60,"Pokémon Teracristal de Paldea. Su caparazón iridiscente almacena la energía primordial del fenómeno Teracristalización."));

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
