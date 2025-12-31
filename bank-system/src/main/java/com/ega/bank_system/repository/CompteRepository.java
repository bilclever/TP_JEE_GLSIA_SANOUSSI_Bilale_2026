package com.ega.bank_system.repository;

import com.ega.bank_system.entity.Compte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompteRepository extends JpaRepository<Compte, String> {

    Optional<Compte> findByNumeroCompte(String numeroCompte);
    List<Compte> findByClientId(Long clientId);
    boolean existsByNumeroCompte(String numeroCompte);
}