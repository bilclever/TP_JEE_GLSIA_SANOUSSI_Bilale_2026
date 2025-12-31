package com.ega.bank_system.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("COURANT")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class CompteCourant extends Compte {
    public BigDecimal getLimiteRetrait() {
        return new BigDecimal("5000");
    }

    @Override
    public BigDecimal getTauxInteret() {
        return BigDecimal.ZERO;
    }
}