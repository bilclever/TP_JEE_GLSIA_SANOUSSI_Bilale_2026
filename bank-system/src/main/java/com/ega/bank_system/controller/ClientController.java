package com.ega.bank_system.controller;

import com.ega.bank_system.dto.ClientDTO;
import com.ega.bank_system.dto.CompteDTO;
import com.ega.bank_system.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "API de gestion des clients")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @Operation(summary = "Créer un nouveau client", description = "Crée un nouveau client avec les informations fournies")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Client créé avec succès",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ClientDTO.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Client déjà existant")
    })
    public ResponseEntity<ClientDTO> createClient(@Valid @RequestBody ClientDTO clientDTO) {
        ClientDTO createdClient = clientService.createClient(clientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClient);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un client par ID", description = "Récupère les informations d'un client spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client trouvé"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<ClientDTO> getClient(
            @Parameter(description = "ID unique du client", example = "1") @PathVariable Long id) {
        ClientDTO client = clientService.getClientById(id);
        return ResponseEntity.ok(client);
    }

    @GetMapping("/code/{clientCode}")
    @Operation(summary = "Obtenir un client par code", description = "Récupère un client en utilisant son code unique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client trouvé"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<ClientDTO> getClientByCode(
            @Parameter(description = "Code unique du client", example = "CLI001") @PathVariable String clientCode) {
        ClientDTO client = clientService.getClientByCode(clientCode);
        return ResponseEntity.ok(client);
    }

    @GetMapping
    @Operation(summary = "Obtenir tous les clients", description = "Récupère la liste complète de tous les clients")
    @ApiResponse(responseCode = "200", description = "Liste des clients récupérée avec succès")
    public ResponseEntity<List<ClientDTO>> getAllClients() {
        List<ClientDTO> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un client", description = "Met à jour les informations d'un client existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client mis à jour avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<ClientDTO> updateClient(
            @Parameter(description = "ID du client à mettre à jour", example = "1") @PathVariable Long id,
            @Valid @RequestBody ClientDTO clientDTO) {
        ClientDTO updatedClient = clientService.updateClient(id, clientDTO);
        return ResponseEntity.ok(updatedClient);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un client (désactiver)", description = "Désactive un client au lieu de le supprimer physiquement")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Client supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<Void> deleteClient(
            @Parameter(description = "ID du client à supprimer", example = "1") @PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activer un client", description = "Active un client pour qu'il puisse utiliser ses services")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client activé avec succès"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<Void> activateClient(
            @Parameter(description = "ID du client à activer", example = "1") @PathVariable Long id) {
        clientService.activateClient(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Désactiver un client", description = "Désactive un client pour bloquer l'accès à ses services")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client désactivé avec succès"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<Void> deactivateClient(
            @Parameter(description = "ID du client à désactiver", example = "1") @PathVariable Long id) {
        clientService.deactivateClient(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/comptes")
    @Operation(summary = "Obtenir les comptes d'un client", description = "Récupère la liste de tous les comptes bancaires d'un client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comptes du client récupérés"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<List<CompteDTO>> getClientComptes(
            @Parameter(description = "ID du client", example = "1") @PathVariable Long id) {
        List<CompteDTO> comptes = clientService.getClientComptes(id);
        return ResponseEntity.ok(comptes);
    }

    @GetMapping("/{id}/with-comptes")
    @Operation(summary = "Obtenir un client avec ses comptes", description = "Récupère les informations d'un client avec la liste de ses comptes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client avec ses comptes récupéré"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    public ResponseEntity<ClientDTO> getClientWithComptes(
            @Parameter(description = "ID du client", example = "1") @PathVariable Long id) {
        ClientDTO client = clientService.getClientWithComptes(id);
        return ResponseEntity.ok(client);
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des clients", description = "Recherche des clients par critères (nom, prénom, email, etc.)")
    @ApiResponse(responseCode = "200", description = "Résultats de recherche retournés")
    public ResponseEntity<List<ClientDTO>> searchClients(
            @Parameter(description = "Requête de recherche", example = "Dupont") @RequestParam String query) {
        List<ClientDTO> clients = clientService.searchClients(query);
        return ResponseEntity.ok(clients);
    }
}