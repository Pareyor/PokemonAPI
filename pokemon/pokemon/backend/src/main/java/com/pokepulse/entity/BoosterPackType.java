package com.pokepulse.entity;

/**
 * Expansiones de sobres disponibles. Todos comparten la estructura de un booster real
 * (4 comunes, 3 infrecuentes, 2 reverse holo y 1 slot de rara al fondo); lo que cambia
 * entre expansiones son las probabilidades de los slots altos, el precio y el pity.
 */
public enum BoosterPackType {

    BASIC(
        "Sobre Básico PokéPulse",
        "La expansión de iniciación. Ideal para completar la Pokédex a buen precio.",
        100, 25, "#2563eb",
        RarityOdds.weights(450, 330, 170, 40, 9, 1),
        RarityOdds.weights(0, 0, 720, 205, 62, 13),
        5, 15
    ),
    KANTO_MASTERS(
        "Sobre Maestros de Kanto",
        "Expansión de coleccionista: más épicas y legendarias en los slots altos.",
        200, 6, "#9333ea",
        RarityOdds.weights(380, 320, 210, 65, 20, 5),
        RarityOdds.weights(0, 0, 540, 310, 120, 30),
        10, 10
    ),
    LEGENDARY_ECLIPSE(
        "Sobre Eclipse Legendario",
        "Expansión premium: el slot de rara garantiza como mínimo una carta Épica.",
        350, 150, "#d97706",
        RarityOdds.weights(300, 300, 250, 100, 40, 10),
        RarityOdds.weights(0, 0, 0, 640, 290, 70),
        20, 6
    );

    private final String displayName;
    private final String description;
    private final int cost;
    private final int mascotPokedexNumber;
    private final String accentColor;
    private final RarityOdds reverseHoloHitOdds;
    private final RarityOdds rareSlotOdds;
    private final int godPackPerThousand;
    private final int pityThreshold;

    BoosterPackType(String displayName, String description, int cost, int mascotPokedexNumber, String accentColor,
                    RarityOdds reverseHoloHitOdds, RarityOdds rareSlotOdds, int godPackPerThousand, int pityThreshold) {
        this.displayName = displayName;
        this.description = description;
        this.cost = cost;
        this.mascotPokedexNumber = mascotPokedexNumber;
        this.accentColor = accentColor;
        this.reverseHoloHitOdds = reverseHoloHitOdds;
        this.rareSlotOdds = rareSlotOdds;
        this.godPackPerThousand = godPackPerThousand;
        this.pityThreshold = pityThreshold;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public int getCost() { return cost; }
    public int getMascotPokedexNumber() { return mascotPokedexNumber; }
    public String getAccentColor() { return accentColor; }
    public RarityOdds getReverseHoloHitOdds() { return reverseHoloHitOdds; }
    public RarityOdds getRareSlotOdds() { return rareSlotOdds; }
    public int getGodPackPerThousand() { return godPackPerThousand; }

    /** Número de sobres seguidos sin Legendaria o superior tras el cual el slot de rara se garantiza Legendaria. */
    public int getPityThreshold() { return pityThreshold; }
}
