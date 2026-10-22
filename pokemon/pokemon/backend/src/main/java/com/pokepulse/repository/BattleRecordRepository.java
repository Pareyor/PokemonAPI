package com.pokepulse.repository;

import com.pokepulse.entity.BattleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleRecordRepository extends JpaRepository<BattleRecord, Long> {
    List<BattleRecord> findTop20ByOwnerIdOrderByTimestampDesc(Long ownerId);

    @Modifying
    @Query("delete from BattleRecord b where b.ownerId = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
