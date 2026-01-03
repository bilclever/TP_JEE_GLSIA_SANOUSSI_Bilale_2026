package com.ega.bank_system.dto;

import com.ega.bank_system.enums.TypeCompte;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Représente un compte bancaire")
public class CompteDTO {

    @Schema(description = "Numéro du compte bancaire (généré automatiquement)",
            example = "TN5901234567890123456789",
            accessMode = Schema.AccessMode.READ_ONLY)
    private String numeroCompte;

    @NotNull(message = "Le type de compte est obligatoire")
    @Schema(description = "Type de compte",
            example = "COURANT",
            allowableValues = {"COURANT", "EPARGNE"},
            requiredMode = Schema.RequiredMode.REQUIRED)
    private TypeCompte type;

    @Schema(description = "Date de création du compte (générée automatiquement à la création)",
            example = "2024-01-15",
            accessMode = Schema.AccessMode.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateCreation;

    @Schema(description = "Solde actuel du compte (initialisé à 0 à la création)",
            example = "0.00",
            accessMode = Schema.AccessMode.READ_ONLY)
    private BigDecimal solde;

    @NotNull(message = "L'identifiant du client propriétaire est obligatoire")
    @Positive(message = "L'identifiant du client doit être positif")
    @Schema(description = "ID du client propriétaire du compte",
            example = "1",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private Long clientId;

    @Schema(description = "Informations du client propriétaire du compte",
            accessMode = Schema.AccessMode.READ_ONLY)
    private ClientDTO client;

    @DecimalMin(value = "0.0", message = "Le taux d'intérêt ne peut pas être négatif")
    @DecimalMax(value = "100.0", message = "Le taux d'intérêt ne peut pas dépasser 100%")
    @Schema(description = "Taux d'intérêt annuel (uniquement pour les comptes épargne)",
            example = "2.5",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private BigDecimal tauxInteret;
}