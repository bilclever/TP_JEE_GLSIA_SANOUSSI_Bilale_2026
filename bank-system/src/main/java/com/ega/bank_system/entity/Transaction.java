package com.ega.bank_system.entity;

import com.ega.bank_system.enums.TypeTransaction;
import com.ega.bank_system.enums.StatutTransaction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference", unique = true, nullable = false, length = 50)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private TypeTransaction type;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutTransaction statut = StatutTransaction.EN_ATTENTE;

    @Column(name = "montant", precision = 15, scale = 2, nullable = false)
    private BigDecimal montant;

    @Column(name = "devise", length = 3, nullable = false)
    @Builder.Default
    private String devise = "TND";

    @Column(name = "date_operation", nullable = false)
    @CreationTimestamp
    private LocalDateTime dateOperation;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "libelle", length = 200)
    private String libelle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_id", nullable = false)
    private Compte compte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_destination_id")
    private Compte compteDestination;

    @PrePersist
    private void generateReference() {
        if (this.reference == null) {
            String timestamp = String.valueOf(System.currentTimeMillis());
            String random = String.valueOf((int)(Math.random() * 1000));
            this.reference = "TRX" + timestamp.substring(timestamp.length() - 10) + random;
        }
    }
}