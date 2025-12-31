package com.ega.bank_system.service.impl;

import com.ega.bank_system.dto.TransactionDTO;
import com.ega.bank_system.dto.VirementRequest;
import com.ega.bank_system.entity.Compte;
import com.ega.bank_system.entity.Transaction;
import com.ega.bank_system.enums.StatutTransaction;
import com.ega.bank_system.enums.TypeTransaction;
import com.ega.bank_system.exception.BusinessException;
import com.ega.bank_system.exception.ResourceNotFoundException;
import com.ega.bank_system.exception.SoldeInsuffisantException;
import com.ega.bank_system.repository.CompteRepository;
import com.ega.bank_system.repository.TransactionRepository;
import com.ega.bank_system.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CompteRepository compteRepository;

    @Value("${app.transaction.max-withdrawal:5000}")
    private BigDecimal maxWithdrawal;

    @Value("${app.transaction.max-transfer:10000}")
    private BigDecimal maxTransfer;

    @Override
    @Transactional
    public TransactionDTO faireDepot(String compteId, BigDecimal montant, String description) {
        Compte compte = compteRepository.findByNumeroCompte(compteId)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + compteId));

        if (montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant du dépôt doit être positif");
        }

        // Créer la transaction
        Transaction transaction = Transaction.builder()
                .type(TypeTransaction.DEPOT)
                .statut(StatutTransaction.VALIDEE)
                .montant(montant)
                .devise(compte.getDevise())
                .description(description != null ? description : "Dépôt sur le compte")
                .libelle("Dépôt")
                .compte(compte)
                .build();

        transaction = transactionRepository.save(transaction);

        // Mettre à jour le solde
        compte.deposer(montant);
        compteRepository.save(compte);

        return mapToDTO(transaction);
    }

    @Override
    @Transactional
    public TransactionDTO faireRetrait(String compteId, BigDecimal montant, String description) {
        Compte compte = compteRepository.findByNumeroCompte(compteId)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + compteId));

        if (montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant du retrait doit être positif");
        }

        // Vérifier les limites
        if (montant.compareTo(maxWithdrawal) > 0) {
            throw new BusinessException(String.format(
                    "Le montant du retrait dépasse la limite autorisée de %s", maxWithdrawal));
        }

        if (montant.compareTo(compte.getLimiteRetrait()) > 0) {
            throw new BusinessException(String.format(
                    "Le montant du retrait dépasse la limite du compte de %s", compte.getLimiteRetrait()));
        }

        // Vérifier le solde
        if (!compte.peutRetirer(montant)) {
            throw new SoldeInsuffisantException(compte.getSolde(), montant);
        }

        // Créer la transaction
        Transaction transaction = Transaction.builder()
                .type(TypeTransaction.RETRAIT)
                .statut(StatutTransaction.VALIDEE)
                .montant(montant)
                .devise(compte.getDevise())
                .description(description != null ? description : "Retrait du compte")
                .libelle("Retrait")
                .compte(compte)
                .build();

        transaction = transactionRepository.save(transaction);

        // Mettre à jour le solde
        compte.retirer(montant);
        compteRepository.save(compte);

        return mapToDTO(transaction);
    }

    @Override
    @Transactional
    public TransactionDTO faireVirement(VirementRequest virementRequest) {
        Compte compteSource = compteRepository.findByNumeroCompte(virementRequest.getCompteSource())
                .orElseThrow(() -> new ResourceNotFoundException("Compte source non trouvé: " + virementRequest.getCompteSource()));

        Compte compteDestination = compteRepository.findByNumeroCompte(virementRequest.getCompteDestination())
                .orElseThrow(() -> new ResourceNotFoundException("Compte destination non trouvé: " + virementRequest.getCompteDestination()));

        if (compteSource.getNumeroCompte().equals(compteDestination.getNumeroCompte())) {
            throw new BusinessException("Le virement vers le même compte n'est pas autorisé");
        }

        if (virementRequest.getMontant().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant du virement doit être positif");
        }

        // Vérifier les limites
        if (virementRequest.getMontant().compareTo(maxTransfer) > 0) {
            throw new BusinessException(String.format(
                    "Le montant du virement dépasse la limite autorisée de %s", maxTransfer));
        }

        // Vérifier le solde source
        if (!compteSource.peutRetirer(virementRequest.getMontant())) {
            throw new SoldeInsuffisantException(compteSource.getSolde(), virementRequest.getMontant());
        }

        // Créer la transaction source (débit)
        Transaction transactionSource = Transaction.builder()
                .type(TypeTransaction.VIREMENT_EMIS)
                .statut(StatutTransaction.VALIDEE)
                .montant(virementRequest.getMontant())
                .devise(compteSource.getDevise())
                .description(virementRequest.getDescription() != null ?
                        virementRequest.getDescription() : "Virement vers " + compteDestination.getNumeroCompte())
                .libelle("Virement émis")
                .compte(compteSource)
                .compteDestination(compteDestination)
                .build();

        transactionSource = transactionRepository.save(transactionSource);

        // Créer la transaction destination (crédit)
        Transaction transactionDestination = Transaction.builder()
                .type(TypeTransaction.VIREMENT_RECU)
                .statut(StatutTransaction.VALIDEE)
                .montant(virementRequest.getMontant())
                .devise(compteDestination.getDevise())
                .description(virementRequest.getDescription() != null ?
                        virementRequest.getDescription() : "Virement reçu de " + compteSource.getNumeroCompte())
                .libelle("Virement reçu")
                .compte(compteDestination)
                .compteDestination(compteSource)
                .build();

        transactionRepository.save(transactionDestination);

        // Mettre à jour les soldes
        compteSource.retirer(virementRequest.getMontant());
        compteDestination.deposer(virementRequest.getMontant());

        compteRepository.save(compteSource);
        compteRepository.save(compteDestination);

        return mapToDTO(transactionSource);
    }

    @Override
    public TransactionDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction non trouvée avec ID: " + id));

        return mapToDTO(transaction);
    }

    @Override
    public TransactionDTO getTransactionByReference(String reference) {
        Transaction transaction = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction non trouvée avec référence: " + reference));

        return mapToDTO(transaction);
    }

    @Override
    public List<TransactionDTO> getTransactionsByCompte(String compteId) {
        if (!compteRepository.existsByNumeroCompte(compteId)) {
            throw new ResourceNotFoundException("Compte non trouvé avec numéro: " + compteId);
        }

        return transactionRepository.findByCompteNumeroCompte(compteId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDTO> getTransactionsByPeriod(String compteId, LocalDateTime startDate, LocalDateTime endDate) {
        if (!compteRepository.existsByNumeroCompte(compteId)) {
            throw new ResourceNotFoundException("Compte non trouvé avec numéro: " + compteId);
        }

        return transactionRepository.findByCompteNumeroCompteAndDateOperationBetween(compteId, startDate, endDate)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal getSolde(String compteId) {
        Compte compte = compteRepository.findByNumeroCompte(compteId)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + compteId));

        return compte.getSolde();
    }

    private TransactionDTO mapToDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .reference(transaction.getReference())
                .type(transaction.getType())
                .statut(transaction.getStatut())
                .montant(transaction.getMontant())
                .devise(transaction.getDevise())
                .dateOperation(transaction.getDateOperation())
                .description(transaction.getDescription())
                .libelle(transaction.getLibelle())
                .compteId(transaction.getCompte().getNumeroCompte())
                .compteDestinationId(transaction.getCompteDestination() != null ?
                        transaction.getCompteDestination().getNumeroCompte() : null)
                .build();
    }
}