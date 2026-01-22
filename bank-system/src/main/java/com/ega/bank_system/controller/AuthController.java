package com.ega.bank_system.controller;

import com.ega.bank_system.dto.AuthRequest;
import com.ega.bank_system.dto.AuthResponse;
import com.ega.bank_system.dto.ChangePasswordRequest;
import com.ega.bank_system.dto.RegisterRequest;
import com.ega.bank_system.service.AuthService;
import com.ega.bank_system.security.BlacklistService;
import com.ega.bank_system.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion de l'authentification
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "API de gestion de l'authentification et de l'inscription")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final BlacklistService blacklistService;

    @PostMapping("/login")
    @Operation(
            summary = "Connexion utilisateur",
            description = "Permet à un utilisateur de se connecter avec son nom d'utilisateur et son mot de passe"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Connexion réussie",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Identifiants invalides"
            )
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Inscription d'un nouvel utilisateur",
            description = "Permet à un administrateur de créer un nouveau compte utilisateur (ADMIN ou AGENT)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Utilisateur créé avec succès",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données invalides ou utilisateur déjà existant"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Accès refusé - Seuls les administrateurs peuvent créer des utilisateurs"
            )
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Rafraîchir le token d'accès",
            description = "Permet de générer un nouveau token d'accès à partir d'un refresh token valide"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token rafraîchi avec succès",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token invalide ou expiré"
            )
    })
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }
        String refreshToken = authHeader.substring(7);
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Modifier le mot de passe",
            description = "Permet à un utilisateur authentifié de modifier son mot de passe"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Mot de passe modifié avec succès"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données invalides ou les mots de passe ne correspondent pas"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Ancien mot de passe incorrect ou non authentifié"
            )
    })
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok("Mot de passe modifié avec succès");
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Déconnexion utilisateur",
            description = "Révoque le token courant (blacklist) et nettoie la session/cookies côté serveur"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Déconnexion réussie"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        // Invalider la session si elle existe
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Récupérer le token Bearer et le blacklister jusqu'à son expiration
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            blacklistService.revoke(token, jwtService.extractExpiration(token).getTime());
        }

        // Supprimer les cookies d'authentification
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                cookie.setValue("");
                cookie.setPath("/");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
            }
        }

        return ResponseEntity.ok("Déconnexion réussie");
    }
}
