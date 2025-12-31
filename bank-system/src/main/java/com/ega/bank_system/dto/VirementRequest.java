package com.ega.bank_system.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VirementRequest {

    @NotBlank(message = "Le compte source est obligatoire")
    @Schema(description = "Numéro du compte source", example = "1234567890")
    private String compteSource;

    @NotBlank(message = "Le compte destination est obligatoire")
    @Schema(description = "Numéro du compte destinataire", example = "0987654321")
    private String compteDestination;

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    @Schema(description = "Montant du virement", example = "500.00")
    private BigDecimal montant;

    @Schema(description = "Description du virement", example = "Paiement facture")
    private String description;
}