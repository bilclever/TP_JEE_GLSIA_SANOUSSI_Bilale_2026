package com.ega.bank_system.dto;

import com.ega.bank_system.enums.TypeTransaction;
import com.ega.bank_system.enums.StatutTransaction;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {

    @Schema(description = "ID unique de la transaction", example = "1", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private Long id;

    @Schema(description = "Référence unique de la transaction", example = "TXN20241230001", accessMode = Schema.AccessMode.READ_ONLY)
    private String reference;

    @NotNull(message = "Le type de transaction est obligatoire")
    @Schema(description = "Type de transaction", example = "DEPOT", allowableValues = {"DEPOT", "RETRAIT", "VIREMENT"}, required = true)
    private TypeTransaction type;

    @NotNull(message = "Le statut est obligatoire")
    @Schema(description = "Statut de la transaction", example = "COMPLETEE", allowableValues = {"PENDANTE", "COMPLETEE", "ECHOUEE"})
    private StatutTransaction statut;

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    @Schema(description = "Montant de la transaction", example = "1000.00", required = true)
    private BigDecimal montant;

    @NotBlank(message = "La devise est obligatoire")
    @Size(min = 3, max = 3, message = "La devise doit contenir 3 caractères")
    @Schema(description = "Devise de la transaction", example = "EUR", required = true)
    private String devise;

    @NotNull(message = "La date d'opération est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Date et heure de l'opération", example = "2024-12-30 14:30:00", required = true)
    private LocalDateTime dateOperation;

    @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères")
    @Schema(description = "Description de la transaction", example = "Dépôt effectué au guichet")
    private String description;

    @Size(max = 200, message = "Le libellé ne doit pas dépasser 200 caractères")
    @Schema(description = "Libellé ou motif de la transaction", example = "Versement")
    private String libelle;

    @NotNull(message = "Le compte est obligatoire")
    @Schema(description = "Numéro du compte source", example = "1234567890", required = true)
    private String compteId;

    @Schema(description = "Numéro du compte destinataire (pour virements)", example = "9876543210", hidden = true)
    private String compteDestinationId;

    @Schema(description = "Informations du compte source", hidden = true)
    private CompteDTO compte;

    @Schema(description = "Informations du compte destinataire", hidden = true)
    private CompteDTO compteDestination;
}