package com.ega.bank_system.service;

import com.ega.bank_system.dto.TransactionDTO;
import com.ega.bank_system.dto.VirementRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {

    TransactionDTO faireDepot(String compteId, BigDecimal montant, String description);
    TransactionDTO faireRetrait(String compteId, BigDecimal montant, String description);
    TransactionDTO faireVirement(VirementRequest virementRequest);

    TransactionDTO getTransactionById(Long id);
    TransactionDTO getTransactionByReference(String reference);

    List<TransactionDTO> getTransactionsByCompte(String compteId);
    List<TransactionDTO> getTransactionsByPeriod(String compteId, LocalDateTime startDate, LocalDateTime endDate);

    BigDecimal getSolde(String compteId);
}