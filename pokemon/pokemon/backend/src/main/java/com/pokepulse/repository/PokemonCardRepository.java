package com.pokepulse.repository;

import com.pokepulse.entity.PokemonCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PokemonCardRepository extends JpaRepository<PokemonCard, Long>, JpaSpecificationExecutor<PokemonCard> {

    Optional<PokemonCard> findByIdAndOwnerId(Long id, Long ownerId);

    List<PokemonCard> findByOwnerId(Long ownerId);

    long countByOwnerId(Long ownerId);

    long countByOwnerIdAndIsInDeckTrue(Long ownerId);

    @Query("select distinct c.pokedexNumber from PokemonCard c where c.ownerId = :ownerId")
    Set<Integer> findOwnedPokedexNumbers(@Param("ownerId") Long ownerId);

    @Modifying
    @Query("delete from PokemonCard c where c.ownerId = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
