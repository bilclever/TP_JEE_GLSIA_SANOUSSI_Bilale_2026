package com.ega.bank_system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_code", unique = true)
    private String clientCode;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Column(nullable = false, length = 1)
    private String sexe;

    @Column(nullable = false, length = 200)
    private String adresse;

    @Column(nullable = false, unique = true, length = 15)
    private String telephone;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 50)
    private String nationalite;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Compte> comptes = new ArrayList<>();

    @PrePersist
    private void generateClientCode() {
        if (this.clientCode == null) {
            String initials = (this.nom.substring(0, 1) + this.prenom.substring(0, 1)).toUpperCase();
            String timestamp = String.valueOf(System.currentTimeMillis() % 10000);
            this.clientCode = "CLI" + initials + timestamp;
        }
    }

    public String getFullName() {
        return nom + " " + prenom;
    }

    public int getAge() {
        return LocalDate.now().getYear() - dateNaissance.getYear();
    }
}