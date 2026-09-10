package com.pokepulse.service;

import com.pokepulse.dto.PokedexItemDTO;
import com.pokepulse.dto.PokedexStatsDTO;
import com.pokepulse.entity.PokedexEntry;
import com.pokepulse.entity.PokemonCard;
import com.pokepulse.entity.PokemonType;
import com.pokepulse.repository.PokedexEntryRepository;
import com.pokepulse.repository.PokemonCardRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PokedexService {

    private final PokedexEntryRepository pokedexRepository;
    private final PokemonCardRepository cardRepository;

    public PokedexService(PokedexEntryRepository pokedexRepository, PokemonCardRepository cardRepository) {
        this.pokedexRepository = pokedexRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<PokedexItemDTO> getPokedex(String search, PokemonType type, String statusFilter) {
        Specification<PokedexEntry> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate numLike = cb.like(cb.function("str", String.class, root.get("pokedexNumber")), pattern);
                predicates.add(cb.or(nameLike, numLike));
            }

            if (type != null) {
                Predicate pType = cb.equal(root.get("primaryType"), type);
                Predicate sType = cb.equal(root.get("secondaryType"), type);
                predicates.add(cb.or(pType, sType));
            }

            query.orderBy(cb.asc(root.get("pokedexNumber")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<PokedexEntry> entries = pokedexRepository.findAll(spec);
        List<PokemonCard> userCards = cardRepository.findAll();

        Map<Integer, List<PokemonCard>> cardsByNum = userCards.stream()
            .collect(Collectors.groupingBy(PokemonCard::getPokedexNumber));

        List<PokedexItemDTO> dtoList = new ArrayList<>();

        for (PokedexEntry entry : entries) {
            List<PokemonCard> ownedCards = cardsByNum.getOrDefault(entry.getPokedexNumber(), Collections.emptyList());
            boolean isOwned = !ownedCards.isEmpty();
            int count = ownedCards.size();
            int highestLevel = ownedCards.stream().mapToInt(PokemonCard::getLevel).max().orElse(0);

            if ("OWNED".equalsIgnoreCase(statusFilter) && !isOwned) {
                continue;
            }
            if ("MISSING".equalsIgnoreCase(statusFilter) && isOwned) {
                continue;
            }

            dtoList.add(new PokedexItemDTO(
                entry.getPokedexNumber(),
                entry.getName(),
                entry.getPrimaryType(),
                entry.getSecondaryType(),
                entry.getBaseHp(),
                entry.getBaseAttack(),
                entry.getBaseDefense(),
                entry.getBaseSpeed(),
                entry.getDescription(),
                entry.getImageUrl(),
                isOwned,
                count,
                highestLevel
            ));
        }

        return dtoList;
    }

    @Transactional(readOnly = true)
    public PokedexStatsDTO getStats() {
        long totalSpecies = pokedexRepository.count();
        List<PokemonCard> userCards = cardRepository.findAll();

        Set<Integer> ownedSpeciesNumbers = userCards.stream()
            .map(PokemonCard::getPokedexNumber)
            .filter(num -> pokedexRepository.existsById(num))
            .collect(Collectors.toSet());

        int ownedCount = ownedSpeciesNumbers.size();
        int missingCount = (int) Math.max(0, totalSpecies - ownedCount);
        double percentage = totalSpecies > 0 ? Math.round(((double) ownedCount / totalSpecies) * 1000.0) / 10.0 : 0.0;

        return new PokedexStatsDTO((int) totalSpecies, ownedCount, missingCount, percentage);
    }
}
