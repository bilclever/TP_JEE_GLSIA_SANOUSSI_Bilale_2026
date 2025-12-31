package com.ega.bank_system.service;

import com.ega.bank_system.dto.ClientDTO;
import com.ega.bank_system.dto.CompteDTO;

import java.util.List;

public interface ClientService {

    ClientDTO createClient(ClientDTO clientDTO);
    ClientDTO updateClient(Long id, ClientDTO clientDTO);
    ClientDTO getClientById(Long id);
    ClientDTO getClientByCode(String clientCode);
    List<ClientDTO> getAllClients();
    void deleteClient(Long id);
    void activateClient(Long id);
    void deactivateClient(Long id);

    List<CompteDTO> getClientComptes(Long clientId);
    ClientDTO getClientWithComptes(Long clientId);

    List<ClientDTO> searchClients(String searchTerm);
}