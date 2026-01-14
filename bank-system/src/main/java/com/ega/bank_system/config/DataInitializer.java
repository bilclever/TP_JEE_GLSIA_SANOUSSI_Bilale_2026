package com.ega.bank_system.config;

import com.ega.bank_system.entity.User;
import com.ega.bank_system.enums.Role;
import com.ega.bank_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialisation des données par défaut (utilisateur admin)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Créer un utilisateur admin par défaut s'il n'existe pas
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@ega-bank.tn")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Utilisateur admin créé par défaut (username: admin, password: admin123)");
        }

        // Créer un utilisateur agent par défaut s'il n'existe pas
        if (!userRepository.existsByUsername("agent")) {
            User agent = User.builder()
                    .username("agent")
                    .email("agent@ega-bank.tn")
                    .password(passwordEncoder.encode("agent123"))
                    .role(Role.AGENT)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();

            userRepository.save(agent);
            log.info("✅ Utilisateur agent créé par défaut (username: agent, password: agent123)");
        }
    }
}

