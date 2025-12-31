package com.ega.bank_system.enums;

public enum StatutTransaction {
    EN_ATTENTE("En attente"),
    VALIDEE("Validée"),
    REJETEE("Rejetée"),
    ANNULEE("Annulée");

    private final String libelle;

    StatutTransaction(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}