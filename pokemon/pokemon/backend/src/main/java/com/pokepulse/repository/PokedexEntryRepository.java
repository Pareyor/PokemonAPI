package com.pokepulse.repository;

import com.pokepulse.entity.PokedexEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PokedexEntryRepository extends JpaRepository<PokedexEntry, Integer>, JpaSpecificationExecutor<PokedexEntry> {
    List<PokedexEntry> findAllByOrderByPokedexNumberAsc();
}
