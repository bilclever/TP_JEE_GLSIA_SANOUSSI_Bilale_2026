package com.ega.bank_system.service;

import com.ega.bank_system.dto.AuthRequest;
import com.ega.bank_system.dto.AuthResponse;
import com.ega.bank_system.dto.ChangePasswordRequest;
import com.ega.bank_system.dto.RegisterRequest;
import com.ega.bank_system.entity.User;
import com.ega.bank_system.exception.DuplicateResourceException;
import com.ega.bank_system.exception.BusinessException;
import com.ega.bank_system.repository.UserRepository;
import com.ega.bank_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service pour la gestion de l'authentification
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Inscription d'un nouvel utilisateur
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si le nom d'utilisateur existe déjà
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Le nom d'utilisateur existe déjà");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("L'email existe déjà");
        }

        // Créer le nouvel utilisateur
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        userRepository.save(user);

        // Générer les tokens
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Authentification d'un utilisateur
     */
    public AuthResponse authenticate(AuthRequest request) {
        // Authentifier l'utilisateur
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Récupérer l'utilisateur
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        // Générer les tokens
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Rafraîchir le token d'accès
     */
    public AuthResponse refreshToken(String refreshToken) {
        final String username = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Token de rafraîchissement invalide");
        }

        String newAccessToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Modifier le mot de passe de l'utilisateur actuellement connecté
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        // Vérifier que les nouveaux mots de passe correspondent
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Les nouveaux mots de passe ne correspondent pas");
        }

        // Récupérer l'utilisateur actuellement authentifié
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Utilisateur non authentifié");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier que l'ancien mot de passe est correct
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("L'ancien mot de passe est incorrect");
        }

        // Vérifier que le nouveau mot de passe n'est pas identique à l'ancien
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}

