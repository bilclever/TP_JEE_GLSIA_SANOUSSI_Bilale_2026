package com.ega.bank_system.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la requête de connexion
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête de connexion")
public class AuthRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Schema(description = "Nom d'utilisateur", example = "admin")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Schema(description = "Mot de passe", example = "admin123")
    private String password;
}

