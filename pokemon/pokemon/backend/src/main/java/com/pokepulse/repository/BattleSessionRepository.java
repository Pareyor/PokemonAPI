package com.pokepulse.repository;

import com.pokepulse.entity.BattleSession;
import com.pokepulse.entity.BattleStatus;
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
public interface BattleSessionRepository extends JpaRepository<BattleSession, Long> {

    Optional<BattleSession> findFirstByOwnerIdAndStatusOrderByStartedAtDesc(Long ownerId, BattleStatus status);

    List<BattleSession> findByOwnerIdAndStatus(Long ownerId, BattleStatus status);

    /** Bloquea la sesión para que un doble clic no resuelva dos turnos a la vez. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from BattleSession b where b.id = :id and b.ownerId = :ownerId")
    Optional<BattleSession> findByIdAndOwnerIdForUpdate(@Param("id") Long id, @Param("ownerId") Long ownerId);

    @Modifying
    @Query("delete from BattleSession b where b.ownerId = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
