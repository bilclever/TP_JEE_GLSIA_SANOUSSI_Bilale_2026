package com.ega.bank_system.service;

import com.ega.bank_system.dto.CompteDTO;
import com.ega.bank_system.enums.TypeCompte;

import java.util.List;

public interface CompteService {

    CompteDTO createCompte(CompteDTO compteDTO);
    CompteDTO getCompteByNumero(String numeroCompte);
    List<CompteDTO> getComptesByClient(Long clientId);
    List<CompteDTO> getComptesByType(TypeCompte type);
    void activateCompte(String numeroCompte);
    void deactivateCompte(String numeroCompte);
    void deleteCompte(String numeroCompte);
}