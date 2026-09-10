package com.pokepulse.service;

import com.pokepulse.dto.BoosterPackResultDTO;
import com.pokepulse.dto.PokemonCardResponseDTO;
import com.pokepulse.entity.*;
import com.pokepulse.repository.PokemonCardRepository;
import com.pokepulse.repository.TrainerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class BoosterPackService {

    private final PokemonCardRepository cardRepository;
    private final TrainerProfileRepository profileRepository;
    private final CardService cardService;
    private final Random random = new Random();

    public BoosterPackService(PokemonCardRepository cardRepository, TrainerProfileRepository profileRepository, CardService cardService) {
        this.cardRepository = cardRepository;
        this.profileRepository = profileRepository;
        this.cardService = cardService;
    }

    private record CardArchetype(
        int num, String name, PokemonType type, CardRarity rarity,
        int hp, int atk, int def, int spd,
        String m1Name, int m1Dmg, String m1Desc,
        String m2Name, int m2Dmg, String m2Desc, String m2Effect
    ) {}

    private final List<CardArchetype> POOL = List.of(
        // ── GEN 1 – KANTO ─────────────────────────────────────────────────────────
        new CardArchetype(25,"Pikachu",PokemonType.ELECTRIC,CardRarity.UNCOMMON,90,75,55,110,"Impactrueno",40,"Descarga eléctrica fulminante","Rayo Trueno",85,"Rayo de 100.000 voltios","PARALYZE"),
        new CardArchetype(6,"Charizard",PokemonType.FIRE,CardRarity.LEGENDARY,180,130,95,100,"Garra Dragón",65,"Zarpazo envuelto en llamas","Llamarada Ígnea",130,"Incendia el campo de batalla","BURN"),
        new CardArchetype(9,"Blastoise",PokemonType.WATER,CardRarity.EPIC,175,105,125,78,"Pistola Agua",55,"Chorro a presión","Hidrobomba",120,"Cañones dorsales de alta potencia","CRITICAL"),
        new CardArchetype(3,"Venusaur",PokemonType.GRASS,CardRarity.EPIC,170,100,115,80,"Látigo Cepa",50,"Golpe flexible con cepas","Rayo Solar",125,"Carga energía solar destructiva","HEAL"),
        new CardArchetype(150,"Mewtwo",PokemonType.PSYCHIC,CardRarity.LEGENDARY,195,150,90,130,"Confusión",70,"Ondas cerebrales cortantes","Onda Mental Psíquica",145,"Distorsiona la realidad","CRITICAL"),
        new CardArchetype(94,"Gengar",PokemonType.DARK,CardRarity.RARE,130,115,75,110,"Lengüetazo",50,"Paraliza al contacto","Bola Sombra",100,"Esfera de pura energía umbría","PARALYZE"),
        new CardArchetype(149,"Dragonite",PokemonType.DRAGON,CardRarity.LEGENDARY,185,135,100,95,"Ataque Ala",60,"Ráfaga alada potente","Hiperrayo",140,"Haz masivo de energía concentrada","CRITICAL"),
        new CardArchetype(130,"Gyarados",PokemonType.WATER,CardRarity.RARE,160,125,85,85,"Mordisco",55,"Dientes afilados","Furia Dragón",110,"Ráfaga marina desatada","BURN"),
        new CardArchetype(143,"Snorlax",PokemonType.NORMAL,CardRarity.RARE,220,110,85,30,"Golpe Cuerpo",65,"Cae con todo su peso","Descanso Restaurador",90,"Regenera salud al atacar","HEAL"),
        new CardArchetype(133,"Eevee",PokemonType.NORMAL,CardRarity.COMMON,85,60,60,65,"Placaje",35,"Embestida rápida","Última Baza",70,"Poder oculto de evolución","CRITICAL"),
        new CardArchetype(448,"Lucario",PokemonType.FIGHTING,CardRarity.EPIC,145,120,80,105,"Palmeo",55,"Golpe marcial de aura","Esfera Aural",115,"Proyectil inesquivable","CRITICAL"),
        new CardArchetype(384,"Rayquaza",PokemonType.DRAGON,CardRarity.LEGENDARY,190,145,95,115,"Tajo Aéreo",70,"Corta el viento supersónico","Ascenso Draco",150,"Ataque definitivo desde la estratósfera","CRITICAL"),
        new CardArchetype(197,"Umbreon",PokemonType.DARK,CardRarity.RARE,150,85,130,75,"Persecución",45,"Ataque sorpresivo","Pulso Umbrío",95,"Onda de oscuridad resonante","PARALYZE"),
        new CardArchetype(68,"Machamp",PokemonType.FIGHTING,CardRarity.RARE,165,130,90,65,"Golpe Kárate",60,"Impacto con cuatro brazos","Sumisión",110,"Llave de combate devastadora","CRITICAL"),
        new CardArchetype(59,"Arcanine",PokemonType.FIRE,CardRarity.RARE,155,115,85,95,"Mordisco Ígneo",55,"Mordedura envuelta en fuego","Velocidad Extrema",105,"Ataque instantáneo con prioridad","CRITICAL"),
        new CardArchetype(131,"Lapras",PokemonType.WATER,CardRarity.UNCOMMON,175,85,95,60,"Rayo Hielo",60,"Congela el entorno","Canto Mortal",95,"Melodía que desestabiliza","PARALYZE"),
        new CardArchetype(65,"Alakazam",PokemonType.PSYCHIC,CardRarity.RARE,120,135,65,120,"Psicorrayo",65,"Haz psíquico concentrado","Premonición",115,"Ataque anticipado destructivo","CRITICAL"),
        new CardArchetype(74,"Geodude",PokemonType.FIGHTING,CardRarity.COMMON,95,70,95,35,"Lanzarrocas",40,"Lanza piedras pesadas","Magnitud",70,"Tiembla el suelo con fuerza","CRITICAL"),
        new CardArchetype(1,"Bulbasaur",PokemonType.GRASS,CardRarity.COMMON,90,55,60,50,"Placaje",35,"Embestida ágil","Drenadoras",65,"Roba vitalidad al rival","HEAL"),
        new CardArchetype(4,"Charmander",PokemonType.FIRE,CardRarity.COMMON,85,65,50,65,"Arañazo",35,"Zarpazo veloz","Ascuas",65,"Pequeñas llamas que queman","BURN"),
        new CardArchetype(7,"Squirtle",PokemonType.WATER,CardRarity.COMMON,88,55,70,50,"Placaje",35,"Golpe con caparazón","Burbuja",65,"Lluvia de burbujas cegadoras","PARALYZE"),
        // ── GEN 2 – JOHTO ─────────────────────────────────────────────────────────
        new CardArchetype(152,"Chikorita",PokemonType.GRASS,CardRarity.COMMON,80,55,65,65,"Placaje",30,"Embestida con hoja","Hoja Afilada",60,"Corte vegetal que cura","HEAL"),
        new CardArchetype(155,"Cyndaquil",PokemonType.FIRE,CardRarity.COMMON,78,68,58,78,"Arañazo",30,"Zarpazo veloz","Ascuas",60,"Llamas pequeñas que queman","BURN"),
        new CardArchetype(158,"Totodile",PokemonType.WATER,CardRarity.COMMON,82,62,60,58,"Mordisco",35,"Mandíbulas trituradoras","Hidrocorte",65,"Corte de agua a presión","CRITICAL"),
        new CardArchetype(175,"Togepi",PokemonType.NORMAL,CardRarity.COMMON,70,40,60,50,"Placaje",25,"Golpe suave pero dulce","Metrónom",50,"Ataque caótico aleatorio","CRITICAL"),
        new CardArchetype(181,"Ampharos",PokemonType.ELECTRIC,CardRarity.RARE,145,95,85,55,"Trueno",70,"Descarga eléctrica potente","Rayo",95,"Rayo que paraliza al instante","PARALYZE"),
        new CardArchetype(196,"Espeon",PokemonType.PSYCHIC,CardRarity.RARE,130,130,60,110,"Psicorrayo",65,"Haz psíquico solar","Psicocarga",100,"Ataque psíquico total","CRITICAL"),
        new CardArchetype(212,"Scizor",PokemonType.STEEL,CardRarity.RARE,140,130,100,65,"Puñal Bala",65,"Golpe de acero veloz","Tijera X",100,"Tijeras de acero devastadoras","CRITICAL"),
        new CardArchetype(214,"Heracross",PokemonType.FIGHTING,CardRarity.RARE,160,125,75,85,"Golpe Kárate",60,"Impacto marcial potente","Megacuerno",120,"Embestida con cuerno descomunal","CRITICAL"),
        new CardArchetype(248,"Tyranitar",PokemonType.DARK,CardRarity.EPIC,175,134,110,61,"Cara Susto",50,"Intimidación oscura","Hiperrayo",130,"Haz que arrastra montañas","CRITICAL"),
        new CardArchetype(249,"Lugia",PokemonType.PSYCHIC,CardRarity.LEGENDARY,190,90,130,110,"Aeroblast",90,"Ráfaga aérea demoledora","Psíquico",120,"Tormenta mental destructiva","CRITICAL"),
        new CardArchetype(250,"Ho-Oh",PokemonType.FIRE,CardRarity.LEGENDARY,190,130,90,90,"Fuego Sagrado",90,"Llama santa de purificación","Pájaro Osado",140,"Vuelo divino en picado","BURN"),
        // ── GEN 3 – HOENN ─────────────────────────────────────────────────────────
        new CardArchetype(254,"Sceptile",PokemonType.GRASS,CardRarity.RARE,130,105,65,120,"Hoja Aguda",55,"Hojas cortantes en espiral","Tormenta Floral",100,"Vendaval de pétalos afilados","HEAL"),
        new CardArchetype(257,"Blaziken",PokemonType.FIRE,CardRarity.EPIC,150,120,70,80,"Golpe Fuego",65,"Puñetazo ígnea","Patada Ígnea",120,"Patada envuelta en llamas","BURN"),
        new CardArchetype(260,"Swampert",PokemonType.WATER,CardRarity.EPIC,165,110,110,60,"Surf",60,"Ola gigante que arrasa","Terremoto",110,"Vibración sísmica brutal","CRITICAL"),
        new CardArchetype(282,"Gardevoir",PokemonType.PSYCHIC,CardRarity.RARE,130,125,65,80,"Confusión",65,"Ondas mentales envolventes","Psíquico",110,"Explosión psíquica","CRITICAL"),
        new CardArchetype(373,"Salamence",PokemonType.DRAGON,CardRarity.EPIC,175,135,80,100,"Ataque Ala",60,"Ráfaga de alas poderosas","Hiperrayo Dragón",130,"Haz devastador de dragón","CRITICAL"),
        new CardArchetype(376,"Metagross",PokemonType.STEEL,CardRarity.EPIC,170,135,130,70,"Cabezazo",65,"Impacto metálico brutal","Cometa Draco",130,"Meteorito de acero y aura","CRITICAL"),
        new CardArchetype(382,"Kyogre",PokemonType.WATER,CardRarity.LEGENDARY,190,100,90,100,"Hidrobomba",95,"Cañón acuático de alta presión","Diluvio",150,"Inundación oceánica total","PARALYZE"),
        new CardArchetype(383,"Groudon",PokemonType.FIRE,CardRarity.LEGENDARY,190,150,140,90,"Terremoto",90,"Sismo que fisura la corteza","Sol Abrasador",150,"Calor magmático devastador","BURN"),
        // ── GEN 4 – SINNOH ────────────────────────────────────────────────────────
        new CardArchetype(389,"Torterra",PokemonType.GRASS,CardRarity.RARE,170,109,105,56,"Terremoto",65,"Sismo forestal brutal","Tormenta Floral",110,"Bosque desatado en ataque","HEAL"),
        new CardArchetype(392,"Infernape",PokemonType.FIRE,CardRarity.EPIC,148,104,71,108,"Puño Fuego",60,"Puñetazo envuelto en llamas","Cierre Llameante",115,"Torbellino ígnea fulminante","BURN"),
        new CardArchetype(395,"Empoleon",PokemonType.WATER,CardRarity.EPIC,160,86,88,60,"Acua Jet",55,"Dash acuático veloz","Hidrocorte",110,"Aletas de acero cortantes","CRITICAL"),
        new CardArchetype(405,"Luxray",PokemonType.ELECTRIC,CardRarity.RARE,145,120,79,70,"Trueno",65,"Descarga eléctrica directa","Colmillo Trueno",95,"Mordedura que paraliza","PARALYZE"),
        new CardArchetype(445,"Garchomp",PokemonType.DRAGON,CardRarity.EPIC,170,130,95,102,"Garra Dragón",70,"Zarpazo supersónico","Tajo Draco",130,"Corte dragón definitivo","CRITICAL"),
        new CardArchetype(468,"Togekiss",PokemonType.NORMAL,CardRarity.RARE,155,75,95,80,"Encanto",50,"Seducción que debilita","Vuelo",90,"Embestida aérea poderosa","CRITICAL"),
        new CardArchetype(483,"Dialga",PokemonType.STEEL,CardRarity.LEGENDARY,190,120,120,90,"Cañón Destello",70,"Disparo de luz temporal","Rugido del Tiempo",140,"Quiebra el continuo espacio-tiempo","CRITICAL"),
        new CardArchetype(484,"Palkia",PokemonType.WATER,CardRarity.LEGENDARY,185,130,90,100,"Hidropulso",70,"Pulso acuático espacial","Corte Espacial",140,"Fisura dimensional devastadora","CRITICAL"),
        new CardArchetype(487,"Giratina",PokemonType.DARK,CardRarity.LEGENDARY,190,100,120,90,"Ala de Sombra",75,"Ala umbría del Mundo del Revés","Portal Inframundo",140,"Portada al vacío absoluto","PARALYZE"),
        new CardArchetype(493,"Arceus",PokemonType.NORMAL,CardRarity.LEGENDARY,200,120,120,120,"Sentencia",80,"Ley absoluta del creador","Juicio",150,"Poder divino del principio","CRITICAL"),
        // ── GEN 5 – TESELIA ───────────────────────────────────────────────────────
        new CardArchetype(497,"Serperior",PokemonType.GRASS,CardRarity.RARE,135,75,95,113,"Látigo Cepa",50,"Golpe de hiedra veloz","Hoja Aguda",100,"Tormenta de hojas cuchilla","HEAL"),
        new CardArchetype(500,"Emboar",PokemonType.FIRE,CardRarity.RARE,175,123,65,65,"Ígneo",65,"Colmillo ardiendo","Llamarada",120,"Columna de fuego puro","BURN"),
        new CardArchetype(503,"Samurott",PokemonType.WATER,CardRarity.RARE,160,100,85,70,"Acua Jet",55,"Dash acuático samurái","Hidrocorte",110,"Sable de agua definitivo","CRITICAL"),
        new CardArchetype(571,"Zoroark",PokemonType.DARK,CardRarity.EPIC,145,105,60,105,"Garra Noche",65,"Zarpazo desde las sombras","Pulso Umbrío",110,"Ola de oscuridad ilusoria","PARALYZE"),
        new CardArchetype(609,"Chandelure",PokemonType.FIRE,CardRarity.RARE,140,145,90,80,"Llama de la Muerte",65,"Llama que consume espíritus","Lanzallamas Espectral",115,"Fuego fantasmal abrasador","BURN"),
        new CardArchetype(635,"Hydreigon",PokemonType.DRAGON,CardRarity.EPIC,165,125,90,98,"Viento Dragón",70,"Ráfaga dracónica oscura","Hiperrayo",130,"Haz de las tres cabezas","CRITICAL"),
        new CardArchetype(643,"Reshiram",PokemonType.FIRE,CardRarity.LEGENDARY,190,120,100,90,"Brillo Fuego",80,"Llamarada yang ardiente","Fusión Ígnea",150,"Torbellino de fuego sagrado","BURN"),
        new CardArchetype(644,"Zekrom",PokemonType.ELECTRIC,CardRarity.LEGENDARY,190,120,100,90,"Garra Trueno",80,"Zarpazo eléctrico yin","Fusión Rayo",150,"Descarga eléctrica absoluta","PARALYZE"),
        new CardArchetype(646,"Kyurem",PokemonType.DRAGON,CardRarity.LEGENDARY,195,130,90,95,"Ventisca",70,"Blizzard helador","Ventisca Helada",140,"Congelación total del campo","PARALYZE"),
        // ── GEN 6 – KALOS ─────────────────────────────────────────────────────────
        new CardArchetype(658,"Greninja",PokemonType.WATER,CardRarity.EPIC,145,103,67,122,"Estrella Agua",65,"Shuriken de agua cargada","Mata Shuriken",120,"Lluvia de estrellas acuáticas","CRITICAL"),
        new CardArchetype(700,"Sylveon",PokemonType.NORMAL,CardRarity.RARE,150,65,65,60,"Voz Cautivadora",60,"Hipnosis sónica de cinta","Hipervoz",100,"Resonancia que paraliza","PARALYZE"),
        new CardArchetype(706,"Goodra",PokemonType.DRAGON,CardRarity.EPIC,180,100,70,80,"Hidropulso",60,"Pulso de limo dracónico","Cometa Draco",120,"Meteorito de baba dragón","CRITICAL"),
        new CardArchetype(716,"Xerneas",PokemonType.NORMAL,CardRarity.LEGENDARY,185,131,95,99,"Geomancia",70,"Energía vital primordial","Ventisca de Hadas",140,"Tormenta de luz etérea","HEAL"),
        new CardArchetype(717,"Yveltal",PokemonType.DARK,CardRarity.LEGENDARY,185,131,95,99,"Bola Sombra",75,"Esfera de destrucción","Muerte Alas",150,"Absorción vital total","PARALYZE"),
        // ── GEN 7 – ALOLA ─────────────────────────────────────────────────────────
        new CardArchetype(724,"Decidueye",PokemonType.GRASS,CardRarity.RARE,148,107,75,70,"Cuchilla Hoja",60,"Flecha hoja afilada","Flecha Sombra",110,"Flecha fantasmal certera","CRITICAL"),
        new CardArchetype(727,"Incineroar",PokemonType.FIRE,CardRarity.EPIC,165,115,90,60,"Golpe Fuego",65,"Puñetazo luchador ígnea","Patada Oscura",120,"Patada con fuego y sombra","BURN"),
        new CardArchetype(730,"Primarina",PokemonType.WATER,CardRarity.RARE,165,74,74,60,"Hidropulso",60,"Burbuja cantada","Canto Mortal",110,"Melodía que marea y paraliza","PARALYZE"),
        new CardArchetype(745,"Lycanroc",PokemonType.FIGHTING,CardRarity.UNCOMMON,125,115,65,112,"Roca Afilada",55,"Fragmentos de roca veloz","Avalancha",100,"Alud de piedras aplastante","CRITICAL"),
        new CardArchetype(778,"Mimikyu",PokemonType.DARK,CardRarity.UNCOMMON,115,90,80,96,"Sombra Trampa",50,"Emboscada desde el disfraz","Juega Sucio",90,"Ataque traicionero bajo capucha","PARALYZE"),
        new CardArchetype(791,"Solgaleo",PokemonType.PSYCHIC,CardRarity.LEGENDARY,190,137,107,97,"Corona Metálica",80,"Carga solar metálica","Nova Solear",145,"Explosión solar imparable","BURN"),
        new CardArchetype(792,"Lunala",PokemonType.PSYCHIC,CardRarity.LEGENDARY,190,137,107,97,"Ala de Sombra",80,"Ala umbría de la luna","Nova Lunar",145,"Oscuridad lunar absoluta","CRITICAL"),
        // ── GEN 8 – GALAR ─────────────────────────────────────────────────────────
        new CardArchetype(887,"Dragapult",PokemonType.DRAGON,CardRarity.EPIC,160,120,75,142,"Sombra Bala",65,"Proyectil fantasmal dragón","Cometa Draco",130,"Meteoro dragón supersónico","CRITICAL"),
        new CardArchetype(888,"Zacian",PokemonType.STEEL,CardRarity.LEGENDARY,185,170,115,138,"Furia Metálica",80,"Acometida con espada antigua","Espada Santa",150,"Corte divino milenario","CRITICAL"),
        new CardArchetype(889,"Zamazenta",PokemonType.FIGHTING,CardRarity.LEGENDARY,185,130,145,138,"Escudo Feroz",70,"Contraataque de escudo","Ataque Heroico",140,"Carga con escudo eterno","CRITICAL"),
        new CardArchetype(890,"Eternatus",PokemonType.DARK,CardRarity.LEGENDARY,190,145,85,130,"Radiación Perniciosa",80,"Energía cósmica oscura","Cañón Dinamax",150,"Disparo de energía de eternidad","CRITICAL"),
        // ── GEN 9 – PALDEA ────────────────────────────────────────────────────────
        new CardArchetype(906,"Sprigatito",PokemonType.GRASS,CardRarity.COMMON,75,55,70,65,"Placaje",30,"Embestida gatuna","Hoja Aguda",55,"Corte con aroma hipnótico","HEAL"),
        new CardArchetype(909,"Fuecoco",PokemonType.FIRE,CardRarity.COMMON,80,65,60,55,"Arañazo",30,"Zarpazo con escamas rojas","Ascuas Pimentón",55,"Llamas de escama picante","BURN"),
        new CardArchetype(912,"Quaxly",PokemonType.WATER,CardRarity.COMMON,75,65,60,55,"Placaje",30,"Cabezazo de pato","Pistola Agua",55,"Chorro de agua a presión","CRITICAL"),
        new CardArchetype(995,"Gholdengo",PokemonType.STEEL,CardRarity.EPIC,150,133,91,84,"Bola Dorada",70,"Moneda disparada a presión","Golpe Dorado",130,"Lluvia de monedas aplastante","CRITICAL"),
        new CardArchetype(1007,"Koraidon",PokemonType.FIGHTING,CardRarity.LEGENDARY,190,135,115,135,"Ariete Paradoja",80,"Embestida primitiva feroz","Choque Primordial",150,"Fuerza ancestral desbocada","CRITICAL"),
        new CardArchetype(1008,"Miraidon",PokemonType.ELECTRIC,CardRarity.LEGENDARY,185,135,115,135,"Carga Eléctrica",80,"Descarga electromagnética","Electrocañón",150,"Cañón de energía del futuro","PARALYZE")
    );

    @Transactional
    public BoosterPackResultDTO openPack(String packType) {
        TrainerProfile profile = profileRepository.findFirstByOrderByIdAsc()
            .orElseGet(() -> profileRepository.save(new TrainerProfile("Ash Ketchum")));

        int cost;
        int cardCount;
        String packName;
        CardRarity minRarity;

        switch (packType.toUpperCase()) {
            case "KANTO_MASTERS" -> {
                cost = 200;
                cardCount = 4;
                packName = "Sobre Maestros de Kanto";
                minRarity = CardRarity.RARE;
            }
            case "LEGENDARY_ECLIPSE" -> {
                cost = 350;
                cardCount = 5;
                packName = "Sobre Eclipse Legendario";
                minRarity = CardRarity.EPIC;
            }
            default -> {
                cost = 100;
                cardCount = 3;
                packName = "Sobre Básico PokéPulse";
                minRarity = CardRarity.COMMON;
            }
        }

        if (profile.getCoins() < cost) {
            throw new IllegalStateException("Monedas insuficientes. Cuesta " + cost + " monedas y tienes " + profile.getCoins() + ".");
        }

        profile.setCoins(profile.getCoins() - cost);
        profile.setPacksOpened(profile.getPacksOpened() + 1);
        profileRepository.save(profile);

        List<PokemonCard> generatedCards = new ArrayList<>();

        for (int i = 0; i < cardCount; i++) {
            CardArchetype arch;
            if (i == 0 && minRarity != CardRarity.COMMON) {
                // Guaranteed rarity
                List<CardArchetype> filtered = POOL.stream()
                    .filter(a -> a.rarity.ordinal() >= minRarity.ordinal())
                    .toList();
                arch = filtered.get(random.nextInt(filtered.size()));
            } else {
                arch = POOL.get(random.nextInt(POOL.size()));
            }

            PokemonCard card = new PokemonCard();
            card.setPokedexNumber(arch.num);
            card.setName(arch.name);
            card.setType(arch.type);
            card.setRarity(arch.rarity);
            card.setHp(arch.hp);
            card.setAttack(arch.atk);
            card.setDefense(arch.def);
            card.setSpeed(arch.spd);
            card.setLevel(1);
            // 25% chance of Holo (50% if Legendary)
            card.setIsHolo(arch.rarity == CardRarity.LEGENDARY || random.nextInt(100) < 25);
            card.setImageUrl("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + arch.num + ".png");
            card.setMove1Name(arch.m1Name);
            card.setMove1Damage(arch.m1Dmg);
            card.setMove1Description(arch.m1Desc);
            card.setMove2Name(arch.m2Name);
            card.setMove2Damage(arch.m2Dmg);
            card.setMove2Description(arch.m2Desc);
            card.setMove2SpecialEffect(arch.m2Effect);
            card.setIsInDeck(false);
            card.setIsCustom(false);

            generatedCards.add(cardRepository.save(card));
        }

        List<PokemonCardResponseDTO> resultDTOs = generatedCards.stream().map(cardService::mapToDTO).toList();
        return new BoosterPackResultDTO(packName, cost, profile.getCoins(), resultDTOs);
    }
}
