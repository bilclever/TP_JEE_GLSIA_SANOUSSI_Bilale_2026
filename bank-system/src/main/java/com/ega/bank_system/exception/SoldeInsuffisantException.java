package com.ega.bank_system.exception;

import java.math.BigDecimal;

public class SoldeInsuffisantException extends BusinessException {

    private final BigDecimal soldeActuel;
    private final BigDecimal montantTente;

    public SoldeInsuffisantException(BigDecimal soldeActuel, BigDecimal montantTente) {
        super(String.format("Solde insuffisant. Solde actuel: %s, Montant tenté: %s",
                soldeActuel, montantTente));
        this.soldeActuel = soldeActuel;
        this.montantTente = montantTente;
    }

    public BigDecimal getSoldeActuel() {
        return soldeActuel;
    }

    public BigDecimal getMontantTente() {
        return montantTente;
    }
}