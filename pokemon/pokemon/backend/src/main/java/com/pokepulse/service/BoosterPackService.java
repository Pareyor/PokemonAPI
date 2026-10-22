package com.pokepulse.service;

import com.pokepulse.dto.*;
import com.pokepulse.entity.*;
import com.pokepulse.exception.ConflictException;
import com.pokepulse.exception.ResourceNotFoundException;
import com.pokepulse.repository.PokemonCardRepository;
import com.pokepulse.repository.SealedPackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class BoosterPackService {

    public static final int MAX_PACKS_PER_PURCHASE = 10;

    private static final String ARTWORK_URL =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

    private final PokemonCardRepository cardRepository;
    private final SealedPackRepository sealedPackRepository;
    private final TrainerProfileService profileService;
    private final CardService cardService;
    private final CardArchetypeCatalog catalog;
    private final PackGenerator generator;

    public BoosterPackService(PokemonCardRepository cardRepository,
                              SealedPackRepository sealedPackRepository,
                              TrainerProfileService profileService,
                              CardService cardService,
                              CardArchetypeCatalog catalog,
                              PackGenerator generator) {
        this.cardRepository = cardRepository;
        this.sealedPackRepository = sealedPackRepository;
        this.profileService = profileService;
        this.cardService = cardService;
        this.catalog = catalog;
        this.generator = generator;
    }

    @Transactional
    public List<PackCatalogDTO> getCatalog(AppUser user) {
        int packsSinceLegendary = profileService.getOrCreateProfile(user).getPacksSinceLegendary();
        return Arrays.stream(BoosterPackType.values()).map(type -> new PackCatalogDTO(
            type,
            type.getDisplayName(),
            type.getDescription(),
            type.getCost(),
            PackGenerator.CARDS_PER_PACK,
            type.getMascotPokedexNumber(),
            type.getAccentColor(),
            type.getGodPackPerThousand() / 10.0,
            type.getPityThreshold(),
            packsUntilPity(type, packsSinceLegendary),
            List.of(
                new PackSlotOddsDTO(PackSlotType.COMMON, 4, RarityOdds.only(CardRarity.COMMON).percentages()),
                new PackSlotOddsDTO(PackSlotType.UNCOMMON, 3, RarityOdds.only(CardRarity.UNCOMMON).percentages()),
                new PackSlotOddsDTO(PackSlotType.REVERSE_HOLO, 1, PackGenerator.REVERSE_HOLO_ODDS.percentages()),
                new PackSlotOddsDTO(PackSlotType.REVERSE_HOLO_HIT, 1, type.getReverseHoloHitOdds().percentages()),
                new PackSlotOddsDTO(PackSlotType.RARE, 1, type.getRareSlotOdds().percentages())
            )
        )).toList();
    }

    @Transactional(readOnly = true)
    public List<SealedPackDTO> getSealedPacks(AppUser user) {
        return sealedPackRepository.findByOwnerIdAndOpenedAtIsNullOrderByPurchasedAtAsc(user.getId()).stream().map(this::toDTO).toList();
    }

    @Transactional
    public PackPurchaseResultDTO purchase(AppUser user, BoosterPackType type, int quantity) {
        if (quantity < 1 || quantity > MAX_PACKS_PER_PURCHASE) {
            throw new IllegalArgumentException("Puedes comprar entre 1 y " + MAX_PACKS_PER_PURCHASE + " sobres por operación.");
        }
        AppUser wallet = profileService.lockUser(user.getId());
        int totalCost = type.getCost() * quantity;
        profileService.spendCoins(wallet, totalCost);

        List<SealedPack> packs = new ArrayList<>();
        for (int i = 0; i < quantity; i++) packs.add(new SealedPack(user.getId(), type));
        List<SealedPackDTO> purchased = sealedPackRepository.saveAll(packs).stream().map(this::toDTO).toList();

        return new PackPurchaseResultDTO(purchased, totalCost, wallet.getCoins());
    }

    @Transactional
    public BoosterPackResultDTO openSealed(AppUser user, Long packId) {
        SealedPack pack = sealedPackRepository.findByIdAndOwnerIdForUpdate(packId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Sobre no encontrado con ID: " + packId));
        if (pack.isOpened()) {
            throw new ConflictException("Este sobre ya se abrió el " + pack.getOpenedAt() + ".");
        }
        pack.setOpenedAt(LocalDateTime.now());
        return open(user, pack, 0);
    }

    /** Compra y abre en un paso. Se mantiene para clientes que usaban POST /api/packs/open. */
    @Transactional
    public BoosterPackResultDTO buyAndOpen(AppUser user, BoosterPackType type) {
        PackPurchaseResultDTO purchase = purchase(user, type, 1);
        SealedPack pack = sealedPackRepository.findByIdAndOwnerIdForUpdate(purchase.purchased().get(0).id(), user.getId()).orElseThrow();
        pack.setOpenedAt(LocalDateTime.now());
        return open(user, pack, purchase.coinsSpent());
    }

    private BoosterPackResultDTO open(AppUser user, SealedPack pack, int coinsSpent) {
        BoosterPackType type = pack.getPackType();
        AppUser wallet = profileService.lockUser(user.getId()); // serializa aperturas del mismo usuario (pity)
        TrainerProfile profile = profileService.getOrCreateProfile(user);

        boolean pityDue = profile.getPacksSinceLegendary() + 1 >= type.getPityThreshold();
        PackGenerator.GeneratedPack generated = generator.generate(type, catalog.byRarity(), pityDue);

        Set<Integer> owned = new HashSet<>(cardRepository.findOwnedPokedexNumbers(user.getId()));
        List<PackCardDTO> cards = new ArrayList<>();
        boolean pulledLegendary = false;
        for (PackGenerator.Draw draw : generated.draws()) {
            PokemonCard saved = cardRepository.save(print(user.getId(), draw));
            boolean isNew = owned.add(draw.archetype().num());
            boolean hit = draw.rarity().compareTo(CardRarity.EPIC) >= 0;
            pulledLegendary |= draw.rarity().compareTo(CardRarity.LEGENDARY) >= 0;
            cards.add(new PackCardDTO(draw.slot(), draw.slotType(), hit, isNew, cardService.mapToDTO(saved)));
        }

        profile.setPacksOpened(profile.getPacksOpened() + 1);
        profile.setPacksSinceLegendary(pulledLegendary ? 0 : profile.getPacksSinceLegendary() + 1);

        return new BoosterPackResultDTO(
            pack.getId(),
            type,
            type.getDisplayName(),
            coinsSpent,
            wallet.getCoins(),
            generated.godPack(),
            generated.pityTriggered(),
            packsUntilPity(type, profile.getPacksSinceLegendary()),
            cards,
            cards.stream().map(PackCardDTO::card).toList()
        );
    }

    private PokemonCard print(Long ownerId, PackGenerator.Draw draw) {
        CardArchetype arch = draw.archetype();
        PokemonCard card = new PokemonCard();
        card.setOwnerId(ownerId);
        card.setPokedexNumber(arch.num());
        card.setName(arch.name());
        card.setType(arch.type());
        card.setRarity(draw.rarity());
        card.setIsHolo(draw.holo());

        if (draw.rarity() == CardRarity.SECRET_RARE) {
            // ✦ CARTA SECRETA GOD RARE ULTRA FULL-ART ✦
            card.setHp(Math.max(240, arch.hp() + 50));
            card.setAttack(Math.max(160, arch.atk() + 45));
            card.setDefense(Math.max(130, arch.def() + 35));
            card.setSpeed(Math.max(130, arch.spd() + 30));
            card.setMove1Name("✦ " + arch.m1Name() + " Celestial");
            card.setMove1Damage(arch.m1Dmg() + 40);
            card.setMove1Description("Ráfaga de energía cósmica primigenia ineludible.");
            card.setMove2Name("✦ Big Bang: " + arch.m2Name());
            card.setMove2Damage(Math.max(185, arch.m2Dmg() + 65));
            card.setMove2Description("Aura destructora cósmica que distorsiona el espacio-tiempo.");
            card.setMove2SpecialEffect("CRITICAL");
        } else {
            card.setHp(arch.hp());
            card.setAttack(arch.atk());
            card.setDefense(arch.def());
            card.setSpeed(arch.spd());
            card.setMove1Name(arch.m1Name());
            card.setMove1Damage(arch.m1Dmg());
            card.setMove1Description(arch.m1Desc());
            card.setMove2Name(arch.m2Name());
            card.setMove2Damage(arch.m2Dmg());
            card.setMove2Description(arch.m2Desc());
            card.setMove2SpecialEffect(arch.m2Effect());
        }

        card.setLevel(1);
        card.setImageUrl(ARTWORK_URL + arch.num() + ".png");
        card.setIsInDeck(false);
        card.setIsCustom(false);
        return card;
    }

    private static int packsUntilPity(BoosterPackType type, int packsSinceLegendary) {
        return Math.max(1, type.getPityThreshold() - packsSinceLegendary);
    }

    private SealedPackDTO toDTO(SealedPack pack) {
        return new SealedPackDTO(pack.getId(), pack.getPackType(), pack.getPackType().getDisplayName(), pack.getPurchasedAt());
    }
}
