package com.ega.bank_system.enums;

public enum TypeTransaction {
    DEPOT("Dépôt"),
    RETRAIT("Retrait"),
    VIREMENT_EMIS("Virement émis"),
    VIREMENT_RECU("Virement reçu"),
    FRAIS("Frais"),
    INTERET("Intérêt");

    private final String libelle;

    TypeTransaction(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}