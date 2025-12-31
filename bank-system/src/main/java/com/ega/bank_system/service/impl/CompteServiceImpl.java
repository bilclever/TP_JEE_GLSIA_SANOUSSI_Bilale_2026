package com.ega.bank_system.service.impl;

import com.ega.bank_system.dto.CompteDTO;
import com.ega.bank_system.entity.*;
import com.ega.bank_system.enums.TypeCompte;
import com.ega.bank_system.exception.BusinessException;
import com.ega.bank_system.exception.ResourceNotFoundException;
import com.ega.bank_system.repository.ClientRepository;
import com.ega.bank_system.repository.CompteRepository;
import com.ega.bank_system.service.CompteService;
import com.ega.bank_system.util.IbanGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompteServiceImpl implements CompteService {

    private final CompteRepository compteRepository;
    private final ClientRepository clientRepository;
    private final IbanGenerator ibanGenerator;

    @Override
    @Transactional
    public CompteDTO createCompte(CompteDTO compteDTO) {
        // Vérifier que le client existe
        Client client = clientRepository.findById(compteDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID: " + compteDTO.getClientId()));

        // Générer le numéro de compte
        String numeroCompte = ibanGenerator.generateIban();

        // Vérifier unicité (très peu probable mais sécurité)
        if (compteRepository.existsByNumeroCompte(numeroCompte)) {
            throw new BusinessException("Erreur de génération du numéro de compte. Veuillez réessayer.");
        }

        // Créer le compte selon le type
        Compte compte;
        if (compteDTO.getType() == TypeCompte.COURANT) {
            compte = CompteCourant.builder()
                    .numeroCompte(numeroCompte)
                    .type(TypeCompte.COURANT)
                    .libelle(compteDTO.getLibelle())
                    .dateCreation(LocalDate.now())
                    .solde(BigDecimal.ZERO)
                    .devise(compteDTO.getDevise())
                    .client(client)
                    .build();
        } else {
            compte = CompteEpargne.builder()
                    .numeroCompte(numeroCompte)
                    .type(TypeCompte.EPARGNE)
                    .libelle(compteDTO.getLibelle())
                    .dateCreation(LocalDate.now())
                    .solde(BigDecimal.ZERO)
                    .devise(compteDTO.getDevise())
                    .tauxInteret(compteDTO.getTauxInteret() != null ? compteDTO.getTauxInteret() : new BigDecimal("2.5"))
                    .client(client)
                    .build();
        }

        compte = compteRepository.save(compte);

        return mapToDTO(compte);
    }

    @Override
    public CompteDTO getCompteByNumero(String numeroCompte) {
        Compte compte = compteRepository.findByNumeroCompte(numeroCompte)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + numeroCompte));

        return mapToDTO(compte);
    }

    @Override
    public List<CompteDTO> getComptesByClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client non trouvé avec ID: " + clientId);
        }

        return compteRepository.findByClientId(clientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompteDTO> getComptesByType(TypeCompte type) {
        return compteRepository.findAll().stream()
                .filter(compte -> compte.getType() == type)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void activateCompte(String numeroCompte) {
        Compte compte = compteRepository.findByNumeroCompte(numeroCompte)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + numeroCompte));

        compte.setStatut("ACTIF");
        compteRepository.save(compte);
    }

    @Override
    @Transactional
    public void deactivateCompte(String numeroCompte) {
        Compte compte = compteRepository.findByNumeroCompte(numeroCompte)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + numeroCompte));

        compte.setStatut("SUSPENDU");
        compteRepository.save(compte);
    }

    @Override
    @Transactional
    public void deleteCompte(String numeroCompte) {
        Compte compte = compteRepository.findByNumeroCompte(numeroCompte)
                .orElseThrow(() -> new ResourceNotFoundException("Compte non trouvé avec numéro: " + numeroCompte));

        if (compte.getSolde().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Impossible de supprimer un compte avec un solde positif");
        }

        compteRepository.delete(compte);
    }

    private CompteDTO mapToDTO(Compte compte) {
        CompteDTO.CompteDTOBuilder builder = CompteDTO.builder()
                .numeroCompte(compte.getNumeroCompte())
                .type(compte.getType())
                .libelle(compte.getLibelle())
                .dateCreation(compte.getDateCreation())
                .solde(compte.getSolde())
                .devise(compte.getDevise())
                .statut(compte.getStatut())
                .clientId(compte.getClient().getId())
                .createdAt(compte.getCreatedAt())
                .updatedAt(compte.getUpdatedAt());

        // Ajouter les champs spécifiques au compte épargne
        if (compte instanceof CompteEpargne) {
            builder.tauxInteret(((CompteEpargne) compte).getTauxInteret());
        }

        return builder.build();
    }
}