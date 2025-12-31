package com.ega.bank_system.repository;

import com.ega.bank_system.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReference(String reference);
    List<Transaction> findByCompteNumeroCompte(String numeroCompte);
    List<Transaction> findByCompteClientId(Long clientId);

    List<Transaction> findByDateOperationBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Transaction> findByCompteNumeroCompteAndDateOperationBetween(
            String numeroCompte, LocalDateTime startDate, LocalDateTime endDate);
}