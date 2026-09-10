package com.pokepulse.service;

import com.pokepulse.dto.PokemonCardRequestDTO;
import com.pokepulse.dto.PokemonCardResponseDTO;
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
    public List<PokemonCardResponseDTO> getAll(String search, PokemonType type, CardRarity rarity, Boolean inDeck) {
        Specification<PokemonCard> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

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
    public PokemonCardResponseDTO getById(Long id) {
        PokemonCard card = cardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada con ID: " + id));
        return mapToDTO(card);
    }

    @Transactional
    public PokemonCardResponseDTO create(PokemonCardRequestDTO dto) {
        PokemonCard card = new PokemonCard();
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
    public PokemonCardResponseDTO update(Long id, PokemonCardRequestDTO dto) {
        PokemonCard card = cardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada con ID: " + id));

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
    public PokemonCardResponseDTO toggleDeck(Long id) {
        PokemonCard card = cardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada con ID: " + id));

        if (!card.getIsInDeck()) {
            long currentDeckCount = cardRepository.countByIsInDeckTrue();
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
    public PokemonCardResponseDTO levelUp(Long id) {
        PokemonCard card = cardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada con ID: " + id));

        var profile = profileService.getOrCreateProfile();
        int cost = card.getLevel() * 25;
        if (profile.getCoins() < cost) {
            throw new IllegalStateException("Monedas insuficientes. Necesitas " + cost + " monedas para subir de nivel.");
        }

        profile.setCoins(profile.getCoins() - cost);
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
    public void delete(Long id) {
        PokemonCard card = cardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carta no encontrada con ID: " + id));

        // Recycling reward
        int recycleBonus = switch (card.getRarity()) {
            case COMMON -> 15;
            case UNCOMMON -> 35;
            case RARE -> 75;
            case EPIC -> 150;
            case LEGENDARY -> 300;
        };
        profileService.addCoins(recycleBonus);

        cardRepository.delete(card);
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
