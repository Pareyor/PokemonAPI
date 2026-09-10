package com.pokepulse.repository;

import com.pokepulse.entity.CardRarity;
import com.pokepulse.entity.PokemonCard;
import com.pokepulse.entity.PokemonType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PokemonCardRepository extends JpaRepository<PokemonCard, Long>, JpaSpecificationExecutor<PokemonCard> {

    List<PokemonCard> findByIsInDeckTrue();

    long countByIsInDeckTrue();

    long countByType(PokemonType type);

    long countByRarity(CardRarity rarity);
}
