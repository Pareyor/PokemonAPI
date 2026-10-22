package com.pokepulse.repository;

import com.pokepulse.entity.SealedPack;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SealedPackRepository extends JpaRepository<SealedPack, Long> {

    List<SealedPack> findByOwnerIdAndOpenedAtIsNullOrderByPurchasedAtAsc(Long ownerId);

    /** Bloquea la fila para que dos peticiones simultáneas no puedan abrir el mismo sobre. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from SealedPack p where p.id = :id and p.ownerId = :ownerId")
    Optional<SealedPack> findByIdAndOwnerIdForUpdate(@Param("id") Long id, @Param("ownerId") Long ownerId);

    @Modifying
    @Query("delete from SealedPack p where p.ownerId = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
