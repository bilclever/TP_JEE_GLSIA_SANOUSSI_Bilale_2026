package com.ega.bank_system.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("EPARGNE")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class CompteEpargne extends Compte {

    private BigDecimal tauxInteret;

    @Override
    public BigDecimal getLimiteRetrait() {
        return new BigDecimal("3000");
    }

    @Override
    public BigDecimal getTauxInteret() {
        return tauxInteret != null ? tauxInteret : new BigDecimal("2.5");
    }
}