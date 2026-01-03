package com.ega.bank_system.controller;

import com.ega.bank_system.dto.CompteDTO;
import com.ega.bank_system.dto.TransactionDTO;
import com.ega.bank_system.dto.VirementRequest;
import com.ega.bank_system.enums.TypeCompte;
import com.ega.bank_system.service.CompteService;
import com.ega.bank_system.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/comptes")
@RequiredArgsConstructor
@Tag(name = "Comptes", description = "API de gestion des comptes bancaires")
public class CompteController {

    private final CompteService compteService;
    private final TransactionService transactionService;

    @PostMapping
    @Operation(
        summary = "Créer un nouveau compte bancaire",
        description = "Crée un nouveau compte bancaire pour un client existant. Le solde initial est toujours 0. Le numéro de compte et la date de création sont générés automatiquement."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Compte créé avec succès",
            content = @Content(schema = @Schema(implementation = CompteDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Données de création invalides (type de compte manquant ou ID client invalide)"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Client avec l'ID spécifié non trouvé"
        )
    })
    public ResponseEntity<CompteDTO> createCompte(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Informations du compte à créer (type et clientId requis)",
                required = true,
                content = @Content(
                    schema = @Schema(implementation = CompteDTO.class),
                    examples = {
                        @io.swagger.v3.oas.annotations.media.ExampleObject(
                            name = "Compte Courant",
                            value = "{\"type\": \"COURANT\", \"clientId\": 1}",
                            description = "Création d'un compte courant"
                        ),
                        @io.swagger.v3.oas.annotations.media.ExampleObject(
                            name = "Compte Épargne",
                            value = "{\"type\": \"EPARGNE\", \"clientId\": 1, \"tauxInteret\": 2.5}",
                            description = "Création d'un compte épargne avec taux d'intérêt"
                        )
                    }
                )
            )
            @Valid @RequestBody CompteDTO compteDTO) {
        CompteDTO createdCompte = compteService.createCompte(compteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCompte);
    }

    @GetMapping
    @Operation(
        summary = "Lister tous les comptes",
        description = "Récupère la liste de tous les comptes bancaires enregistrés dans le système"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Liste des comptes récupérée avec succès",
        content = @Content(schema = @Schema(implementation = CompteDTO.class))
    )
    public ResponseEntity<List<CompteDTO>> getAllComptes() {
        List<CompteDTO> comptes = compteService.getAllComptes();
        return ResponseEntity.ok(comptes);
    }

    @GetMapping("/{numeroCompte}")
    @Operation(summary = "Obtenir un compte par son numéro", description = "Récupère les informations détaillées d'un compte")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compte trouvé"),
        @ApiResponse(responseCode = "404", description = "Compte non trouvé")
    })
    public ResponseEntity<CompteDTO> getCompte(
            @Parameter(description = "Numéro du compte", example = "1234567890") @PathVariable String numeroCompte) {
        CompteDTO compte = compteService.getCompteByNumero(numeroCompte);
        return ResponseEntity.ok(compte);
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Obtenir les comptes d'un client", description = "Récupère tous les comptes associés à un client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comptes du client récupérés"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<List<CompteDTO>> getComptesByClient(
            @Parameter(description = "ID du client", example = "1") @PathVariable Long clientId) {
        List<CompteDTO> comptes = compteService.getComptesByClient(clientId);
        return ResponseEntity.ok(comptes);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Obtenir les comptes par type", description = "Récupère tous les comptes d'un type spécifique (COURANT ou EPARGNE)")
    @ApiResponse(responseCode = "200", description = "Comptes du type spécifié récupérés")
    public ResponseEntity<List<CompteDTO>> getComptesByType(
            @Parameter(description = "Type de compte", example = "COURANT", schema = @Schema(allowableValues = {"COURANT", "EPARGNE"}))
            @PathVariable TypeCompte type) {
        List<CompteDTO> comptes = compteService.getComptesByType(type);
        return ResponseEntity.ok(comptes);
    }

    @PatchMapping("/{numeroCompte}/activate")
    @Operation(summary = "Activer un compte")
    public ResponseEntity<Void> activateCompte(@PathVariable String numeroCompte) {
        compteService.activateCompte(numeroCompte);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{numeroCompte}/deactivate")
    @Operation(summary = "Désactiver un compte")
    public ResponseEntity<Void> deactivateCompte(@PathVariable String numeroCompte) {
        compteService.deactivateCompte(numeroCompte);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{numeroCompte}")
    @Operation(summary = "Supprimer un compte")
    public ResponseEntity<Void> deleteCompte(@PathVariable String numeroCompte) {
        compteService.deleteCompte(numeroCompte);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{numeroCompte}/depot")
    @Operation(summary = "Effectuer un dépôt")
    public ResponseEntity<TransactionDTO> faireDepot(
            @PathVariable String numeroCompte,
            @RequestParam BigDecimal montant,
            @RequestParam(required = false) String description) {
        TransactionDTO transaction = transactionService.faireDepot(numeroCompte, montant, description);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/{numeroCompte}/retrait")
    @Operation(summary = "Effectuer un retrait")
    public ResponseEntity<TransactionDTO> faireRetrait(
            @PathVariable String numeroCompte,
            @RequestParam BigDecimal montant,
            @RequestParam(required = false) String description) {
        TransactionDTO transaction = transactionService.faireRetrait(numeroCompte, montant, description);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/virement")
    @Operation(summary = "Effectuer un virement")
    public ResponseEntity<TransactionDTO> faireVirement(@Valid @RequestBody VirementRequest virementRequest) {
        TransactionDTO transaction = transactionService.faireVirement(virementRequest);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{numeroCompte}/transactions")
    @Operation(summary = "Obtenir les transactions d'un compte")
    public ResponseEntity<List<TransactionDTO>> getTransactions(@PathVariable String numeroCompte) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByCompte(numeroCompte);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{numeroCompte}/transactions/period")
    @Operation(summary = "Obtenir les transactions d'un compte sur une période")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByPeriod(
            @PathVariable String numeroCompte,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByPeriod(numeroCompte, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{numeroCompte}/solde")
    @Operation(summary = "Obtenir le solde d'un compte")
    public ResponseEntity<BigDecimal> getSolde(@PathVariable String numeroCompte) {
        BigDecimal solde = transactionService.getSolde(numeroCompte);
        return ResponseEntity.ok(solde);
    }
}