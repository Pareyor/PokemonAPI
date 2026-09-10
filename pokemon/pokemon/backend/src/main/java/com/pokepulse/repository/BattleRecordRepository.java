package com.pokepulse.repository;

import com.pokepulse.entity.BattleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleRecordRepository extends JpaRepository<BattleRecord, Long> {
    List<BattleRecord> findTop20ByOrderByTimestampDesc();
}
