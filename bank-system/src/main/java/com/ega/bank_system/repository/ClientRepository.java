package com.ega.bank_system.repository;

import com.ega.bank_system.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByEmail(String email);
    Optional<Client> findByTelephone(String telephone);
    Optional<Client> findByClientCode(String clientCode);

    boolean existsByEmail(String email);
    boolean existsByTelephone(String telephone);
}