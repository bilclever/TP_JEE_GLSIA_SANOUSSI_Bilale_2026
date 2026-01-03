package com.ega.bank_system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "ID unique du client", example = "1", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Code unique du client", example = "CLI001", accessMode = Schema.AccessMode.READ_ONLY)
    private String clientCode;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    @Schema(description = "Nom du client", example = "Dupont", required = true)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    @Schema(description = "Prénom du client", example = "Jean", required = true)
    private String prenom;

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Date de naissance", example = "1990-05-15", required = true)
    private LocalDate dateNaissance;

    @NotBlank(message = "Le sexe est obligatoire")
    @Pattern(regexp = "^(M|F)$", message = "Le sexe doit être M ou F")
    @Schema(description = "Sexe du client", example = "M", allowableValues = {"M", "F"}, required = true)
    private String sexe;

    @NotBlank(message = "L'adresse est obligatoire")
    @Size(max = 200, message = "L'adresse ne doit pas dépasser 200 caractères")
    @Schema(description = "Adresse du client", example = "123 Rue de la Paix, Paris", required = true)
    private String adresse;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Numéro de téléphone invalide")
    @Schema(description = "Numéro de téléphone", example = "+22870214908", required = true)
    private String telephone;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Schema(description = "Email du client", example = "jean.dupont@example.com", required = true)
    private String email;

    @NotBlank(message = "La nationalité est obligatoire")
    @Size(min = 2, max = 50, message = "La nationalité doit contenir entre 2 et 50 caractères")
    @Schema(description = "Nationalité du client", example = "Française", required = true)
    private String nationalite;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Statut actif du client", example = "true", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private boolean active;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Date de création", example = "2024-01-15 10:30:00", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private LocalDateTime createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Date de dernière mise à jour", example = "2024-12-30 14:45:00", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private LocalDateTime updatedAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Âge du client", example = "34", accessMode = Schema.AccessMode.READ_ONLY)
    private int age;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Nom complet du client", example = "Jean Dupont", accessMode = Schema.AccessMode.READ_ONLY, hidden = true)
    private String fullName;

    public int getAge() {
        if (dateNaissance == null) return 0;
        return LocalDate.now().getYear() - dateNaissance.getYear();
    }

    public String getFullName() {
        return nom + " " + prenom;
    }
}