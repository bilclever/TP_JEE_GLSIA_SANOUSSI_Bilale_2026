package com.ega.bank_system.dto;

import com.ega.bank_system.enums.TypeCompte;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompteDTO {

    @Schema(description = "Numéro du compte bancaire", example = "1234567890", accessMode = Schema.AccessMode.READ_ONLY)
    private String numeroCompte;

    @NotNull(message = "Le type de compte est obligatoire")
    @Schema(description = "Type de compte", example = "COURANT", allowableValues = {"COURANT", "EPARGNE"}, required = true)
    private TypeCompte type;

    @Size(max = 100, message = "Le libellé ne doit pas dépasser 100 caractères")
    @Schema(description = "Libellé ou nom du compte", example = "Compte principal")
    private String libelle;

    @NotNull(message = "La date de création est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Date de création du compte", example = "2024-01-15", required = true)
    private LocalDate dateCreation;

    @NotNull(message = "Le solde est obligatoire")
    @DecimalMin(value = "0.00", message = "Le solde ne peut pas être négatif")
    @Schema(description = "Solde actuel du compte", example = "5000.00")
    private BigDecimal solde;

    @NotBlank(message = "La devise est obligatoire")
    @Size(min = 3, max = 3, message = "La devise doit contenir 3 caractères")
    @Schema(description = "Devise du compte", example = "EUR", required = true)
    private String devise;

    @Schema(description = "Statut du compte", example = "ACTIF", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private String statut;

    @NotNull(message = "Le client est obligatoire")
    @Schema(description = "ID du client propriétaire du compte", example = "1", required = true)
    private Long clientId;

    @Schema(description = "Informations du client", hidden = true)
    private ClientDTO client;

    @Schema(description = "Taux d'intérêt du compte épargne", example = "2.5", hidden = true)
    private BigDecimal tauxInteret;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Date de création de l'enregistrement", hidden = true)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Date de dernière mise à jour", hidden = true)
    private LocalDateTime updatedAt;
}