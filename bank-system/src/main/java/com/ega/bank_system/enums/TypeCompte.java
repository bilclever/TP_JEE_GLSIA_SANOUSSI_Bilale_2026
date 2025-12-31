package com.ega.bank_system.enums;

public enum TypeCompte {
    COURANT("Compte Courant"),
    EPARGNE("Compte Épargne");

    private final String libelle;

    TypeCompte(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}