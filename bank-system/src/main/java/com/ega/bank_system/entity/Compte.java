package com.ega.bank_system.entity;

import com.ega.bank_system.enums.TypeCompte;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comptes")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("BASE")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public abstract class Compte {

    @Id
    @Column(name = "numero_compte", length = 34, unique = true, updatable = false)
    private String numeroCompte;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", insertable = false, updatable = false)
    private TypeCompte type;

    @Column(name = "libelle", length = 100)
    private String libelle;

    @Column(name = "date_creation")
    private LocalDate dateCreation;

    @Column(name = "solde", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal solde = BigDecimal.ZERO;

    @Column(name = "devise", length = 3)
    @Builder.Default
    private String devise = "TND";

    @Column(name = "statut", length = 20)
    @Builder.Default
    private String statut = "ACTIF";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL)
    @Builder.Default
    @OrderBy("dateOperation DESC")
    private List<Transaction> transactions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public abstract BigDecimal getLimiteRetrait();
    public abstract BigDecimal getTauxInteret();

    public boolean peutRetirer(BigDecimal montant) {
        return solde.compareTo(montant) >= 0;
    }

    public void deposer(BigDecimal montant) {
        this.solde = this.solde.add(montant);
    }

    public void retirer(BigDecimal montant) {
        this.solde = this.solde.subtract(montant);
    }
}