package com.ega.bank_system.enums;

/**
 * Énumération des rôles utilisateur
 */
public enum Role {
    ADMIN("Administrateur - Accès complet au système"),
    AGENT("Agent bancaire - Gestion des opérations courantes");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

