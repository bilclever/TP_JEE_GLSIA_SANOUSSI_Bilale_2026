package com.ega.bank_system.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse d'authentification
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse d'authentification")
public class AuthResponse {

    @JsonProperty("access_token")
    @Schema(description = "Token d'accès JWT", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @JsonProperty("refresh_token")
    @Schema(description = "Token de rafraîchissement", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @JsonProperty("token_type")
    @Schema(description = "Type de token", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @Schema(description = "Nom d'utilisateur", example = "admin")
    private String username;

    @Schema(description = "Rôle de l'utilisateur", example = "ADMIN")
    private String role;
}

