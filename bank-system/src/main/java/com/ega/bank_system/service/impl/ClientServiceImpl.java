package com.ega.bank_system.service.impl;

import com.ega.bank_system.dto.ClientDTO;
import com.ega.bank_system.dto.CompteDTO;
import com.ega.bank_system.entity.Client;
import com.ega.bank_system.exception.DuplicateResourceException;
import com.ega.bank_system.exception.ResourceNotFoundException;
import com.ega.bank_system.repository.ClientRepository;
import com.ega.bank_system.repository.CompteRepository;
import com.ega.bank_system.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final CompteRepository compteRepository;

    @Override
    @Transactional
    public ClientDTO createClient(ClientDTO clientDTO) {
        // Vérifier les doublons
        if (clientRepository.existsByEmail(clientDTO.getEmail())) {
            throw new DuplicateResourceException("Un client avec cet email existe déjà");
        }

        if (clientRepository.existsByTelephone(clientDTO.getTelephone())) {
            throw new DuplicateResourceException("Un client avec ce numéro de téléphone existe déjà");
        }

        // Créer le client
        Client client = Client.builder()
                .nom(clientDTO.getNom())
                .prenom(clientDTO.getPrenom())
                .dateNaissance(clientDTO.getDateNaissance())
                .sexe(clientDTO.getSexe())
                .adresse(clientDTO.getAdresse())
                .telephone(clientDTO.getTelephone())
                .email(clientDTO.getEmail())
                .nationalite(clientDTO.getNationalite())
                .build();

        client = clientRepository.save(client);

        return mapToDTO(client);
    }

    @Override
    @Transactional
    public ClientDTO updateClient(Long id, ClientDTO clientDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID: " + id));

        // Vérifier email unique
        if (!client.getEmail().equals(clientDTO.getEmail())
                && clientRepository.existsByEmail(clientDTO.getEmail())) {
            throw new DuplicateResourceException("Un client avec cet email existe déjà");
        }

        // Vérifier téléphone unique
        if (!client.getTelephone().equals(clientDTO.getTelephone())
                && clientRepository.existsByTelephone(clientDTO.getTelephone())) {
            throw new DuplicateResourceException("Un client avec ce numéro de téléphone existe déjà");
        }

        // Mettre à jour
        client.setNom(clientDTO.getNom());
        client.setPrenom(clientDTO.getPrenom());
        client.setDateNaissance(clientDTO.getDateNaissance());
        client.setSexe(clientDTO.getSexe());
        client.setAdresse(clientDTO.getAdresse());
        client.setTelephone(clientDTO.getTelephone());
        client.setEmail(clientDTO.getEmail());
        client.setNationalite(clientDTO.getNationalite());

        client = clientRepository.save(client);

        return mapToDTO(client);
    }

    @Override
    public ClientDTO getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID: " + id));

        return mapToDTO(client);
    }

    @Override
    public ClientDTO getClientByCode(String clientCode) {
        Client client = clientRepository.findByClientCode(clientCode)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec code: " + clientCode));

        return mapToDTO(client);
    }

    @Override
    public List<ClientDTO> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID: " + id));

        client.setActive(false);
        clientRepository.save(client);
    }

    @Override
    @Transactional
    public void activateClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID: " + id));

        client.setActive(true);
        clientRepository.save(client);
    }

    @Override
    @Transactional
    public void deactivateClient(Long id) {
        deleteClient(id); // Même logique
    }

    @Override
    public List<CompteDTO> getClientComptes(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client non trouvé avec ID: " + clientId);
        }

        return compteRepository.findByClientId(clientId).stream()
                .map(compte -> CompteDTO.builder()
                        .numeroCompte(compte.getNumeroCompte())
                        .type(compte.getType())
                        .libelle(compte.getLibelle())
                        .solde(compte.getSolde())
                        .devise(compte.getDevise())
                        .statut(compte.getStatut())
                        .dateCreation(compte.getDateCreation())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ClientDTO getClientWithComptes(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec ID: " + clientId));

        ClientDTO dto = mapToDTO(client);
        // Les comptes seront chargés si besoin
        return dto;
    }

    @Override
    public List<ClientDTO> searchClients(String searchTerm) {
        return clientRepository.findAll().stream()
                .filter(client ->
                        client.getNom().toLowerCase().contains(searchTerm.toLowerCase()) ||
                                client.getPrenom().toLowerCase().contains(searchTerm.toLowerCase()) ||
                                client.getEmail().toLowerCase().contains(searchTerm.toLowerCase()) ||
                                client.getTelephone().contains(searchTerm))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ClientDTO mapToDTO(Client client) {
        return ClientDTO.builder()
                .id(client.getId())
                .clientCode(client.getClientCode())
                .nom(client.getNom())
                .prenom(client.getPrenom())
                .dateNaissance(client.getDateNaissance())
                .sexe(client.getSexe())
                .adresse(client.getAdresse())
                .telephone(client.getTelephone())
                .email(client.getEmail())
                .nationalite(client.getNationalite())
                .active(client.isActive())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .age(client.getAge())
                .fullName(client.getFullName())
                .build();
    }
}