package com.ega.bank_system.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "L'ancien mot de passe est obligatoire")
    @Schema(description = "Ancien mot de passe", example = "ancienMotDePasse123", required = true)
    private String oldPassword;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 6, message = "Le nouveau mot de passe doit contenir au moins 6 caractères")
    @Schema(description = "Nouveau mot de passe", example = "nouveauMotDePasse123", required = true)
    private String newPassword;

    @NotBlank(message = "La confirmation du mot de passe est obligatoire")
    @Schema(description = "Confirmation du nouveau mot de passe", example = "nouveauMotDePasse123", required = true)
    private String confirmPassword;
}

