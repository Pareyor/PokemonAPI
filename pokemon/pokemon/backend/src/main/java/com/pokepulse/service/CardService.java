package com.pokepulse.service;

import com.pokepulse.dto.PokemonCardRequestDTO;
import com.pokepulse.dto.PokemonCardResponseDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonCard;
import com.pokepulse.entity.PokemonType;
import com.pokepulse.exception.ResourceNotFoundException;
import com.pokepulse.repository.PokemonCardRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CardService {

    private final PokemonCardRepository cardRepository;
    private final TrainerProfileService profileService;

    public CardService(PokemonCardRepository cardRepository, TrainerProfileService profileService) {
        this.cardRepository = cardRepository;
        this.profileService = profileService;
    }

    @Transactional(readOnly = true)
    public List<PokemonCardResponseDTO> getAll(AppUser user, String search, PokemonType type, CardRarity rarity, Boolean inDeck) {
        Specification<PokemonCard> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("ownerId"), user.getId()));

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate move1Like = cb.like(cb.lower(root.get("move1Name")), pattern);
                Predicate move2Like = cb.like(cb.lower(root.get("move2Name")), pattern);
                predicates.add(cb.or(nameLike, move1Like, move2Like));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (rarity != null) {
                predicates.add(cb.equal(root.get("rarity"), rarity));
            }

            if (inDeck != null) {
                predicates.add(cb.equal(root.get("isInDeck"), inDeck));
            }

            query.orderBy(cb.desc(root.get("isInDeck")), cb.desc(root.get("pokedexNumber")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return cardRepository.findAll(spec).stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public PokemonCardResponseDTO getById(AppUser user, Long id) {
        return mapToDTO(findOwned(user, id));
    }

    @Transactional
    public PokemonCardResponseDTO create(AppUser user, PokemonCardRequestDTO dto) {
        PokemonCard card = new PokemonCard();
        card.setOwnerId(user.getId());
        card.setPokedexNumber(dto.pokedexNumber());
        card.setName(dto.name());
        card.setType(dto.type());
        card.setRarity(dto.rarity());
        card.setHp(dto.hp() != null ? dto.hp() : 100);
        card.setAttack(dto.attack() != null ? dto.attack() : 60);
        card.setDefense(dto.defense() != null ? dto.defense() : 50);
        card.setSpeed(dto.speed() != null ? dto.speed() : 55);
        card.setIsHolo(dto.isHolo() != null ? dto.isHolo() : false);
        card.setImageUrl(dto.imageUrl());
        card.setMove1Name(dto.move1Name());
        card.setMove1Damage(dto.move1Damage());
        card.setMove1Description(dto.move1Description());
        card.setMove2Name(dto.move2Name());
        card.setMove2Damage(dto.move2Damage());
        card.setMove2Description(dto.move2Description());
        card.setMove2SpecialEffect(dto.move2SpecialEffect());
        card.setIsCustom(true);
        card.setIsInDeck(false);

        PokemonCard saved = cardRepository.save(card);
        return mapToDTO(saved);
    }

    @Transactional
    public PokemonCardResponseDTO update(AppUser user, Long id, PokemonCardRequestDTO dto) {
        PokemonCard card = findOwned(user, id);
        if (!Boolean.TRUE.equals(card.getIsCustom())) {
            throw new IllegalStateException("Solo puedes editar cartas forjadas; las cartas de sobre no se pueden modificar.");
        }

        card.setName(dto.name());
        card.setType(dto.type());
        card.setRarity(dto.rarity());
        if (dto.hp() != null) card.setHp(dto.hp());
        if (dto.attack() != null) card.setAttack(dto.attack());
        if (dto.defense() != null) card.setDefense(dto.defense());
        if (dto.speed() != null) card.setSpeed(dto.speed());
        if (dto.isHolo() != null) card.setIsHolo(dto.isHolo());
        if (dto.imageUrl() != null) card.setImageUrl(dto.imageUrl());
        card.setMove1Name(dto.move1Name());
        card.setMove1Damage(dto.move1Damage());
        card.setMove1Description(dto.move1Description());
        card.setMove2Name(dto.move2Name());
        card.setMove2Damage(dto.move2Damage());
        card.setMove2Description(dto.move2Description());
        card.setMove2SpecialEffect(dto.move2SpecialEffect());

        PokemonCard updated = cardRepository.save(card);
        return mapToDTO(updated);
    }

    @Transactional
    public PokemonCardResponseDTO toggleDeck(AppUser user, Long id) {
        PokemonCard card = findOwned(user, id);

        if (!card.getIsInDeck()) {
            profileService.lockUser(user.getId()); // serializa altas concurrentes en el mazo
            long currentDeckCount = cardRepository.countByOwnerIdAndIsInDeckTrue(user.getId());
            if (currentDeckCount >= 5) {
                throw new IllegalStateException("Tu mazo de combate ya tiene el máximo permitido de 5 cartas.");
            }
            card.setIsInDeck(true);
        } else {
            card.setIsInDeck(false);
        }

        PokemonCard updated = cardRepository.save(card);
        return mapToDTO(updated);
    }

    @Transactional
    public PokemonCardResponseDTO levelUp(AppUser user, Long id) {
        PokemonCard card = findOwned(user, id);

        AppUser wallet = profileService.lockUser(user.getId());
        profileService.spendCoins(wallet, card.getLevel() * 25);
        card.setLevel(card.getLevel() + 1);
        card.setHp(card.getHp() + 10);
        card.setAttack(card.getAttack() + 5);
        card.setDefense(card.getDefense() + 4);
        card.setSpeed(card.getSpeed() + 3);
        card.setMove1Damage(card.getMove1Damage() + 3);
        card.setMove2Damage(card.getMove2Damage() + 6);

        PokemonCard updated = cardRepository.save(card);
        return mapToDTO(updated);
    }

    @Transactional
    public void delete(AppUser user, Long id) {
        PokemonCard card = findOwned(user, id);

        // Las cartas forjadas son gratis de crear: reciclarlas no puede generar monedas
        int recycleBonus = Boolean.TRUE.equals(card.getIsCustom()) ? 0 : switch (card.getRarity()) {
            case COMMON -> 15;
            case UNCOMMON -> 35;
            case RARE -> 75;
            case EPIC -> 150;
            case LEGENDARY -> 300;
            case SECRET_RARE -> 1000;
        };
        AppUser wallet = profileService.lockUser(user.getId());
        wallet.setCoins(wallet.getCoins() + recycleBonus);

        cardRepository.delete(card);
    }

    /** 404 tanto si no existe como si es de otro usuario, para no revelar qué IDs existen. */
    private PokemonCard findOwned(AppUser user, Long id) {
        return cardRepository.findByIdAndOwnerId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada con ID: " + id));
    }

    public PokemonCardResponseDTO mapToDTO(PokemonCard c) {
        return new PokemonCardResponseDTO(
            c.getId(),
            c.getPokedexNumber(),
            c.getName(),
            c.getType(),
            c.getRarity(),
            c.getHp(),
            c.getAttack(),
            c.getDefense(),
            c.getSpeed(),
            c.getLevel(),
            c.getIsHolo(),
            c.getImageUrl(),
            c.getMove1Name(),
            c.getMove1Damage(),
            c.getMove1Description(),
            c.getMove2Name(),
            c.getMove2Damage(),
            c.getMove2Description(),
            c.getMove2SpecialEffect(),
            c.getIsInDeck(),
            c.getIsCustom(),
            c.getCreatedAt()
        );
    }
}
