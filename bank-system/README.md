# EGA Bank System

Système bancaire RESTful développé avec **Spring Boot 3.5.9**, offrant une gestion complète des clients, des comptes bancaires et des opérations financières, sécurisé par JWT.

---

## Table des matières

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Configuration](#configuration)
- [Données initiales](#données-initiales)
- [API Reference](#api-reference)
  - [Authentification](#authentification)
  - [Clients](#clients)
  - [Comptes](#comptes)
  - [Opérations bancaires](#opérations-bancaires)
- [Modèle de données](#modèle-de-données)
- [Sécurité](#sécurité)
- [Limites et règles métier](#limites-et-règles-métier)
- [Documentation interactive](#documentation-interactive)

---

## Aperçu

EGA Bank System est une API bancaire back-end couvrant :

- Gestion des **clients** (CRUD, activation/désactivation, recherche)
- Gestion des **comptes** bancaires (Courant et Épargne, avec génération automatique d'IBAN)
- **Opérations financières** : dépôt, retrait, virement inter-comptes
- **Historique des transactions** avec filtrage par période
- **Authentification JWT** avec access token (24h) + refresh token (7j) et blacklist à la déconnexion
- Contrôle d'accès par rôles (**ADMIN** / **AGENT**)
- Export PDF des relevés (iText)
- Documentation API via **Swagger UI**

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Spring Boot 3.5.9 |
| Langage | Java 17 |
| Sécurité | Spring Security + JJWT 0.11.5 (HS256) |
| Persistance | Spring Data JPA / Hibernate |
| Base de données | PostgreSQL (hébergé sur Supabase) |
| Documentation | SpringDoc OpenAPI 2.6.0 (Swagger UI) |
| Build | Maven 3 (Wrapper inclus) |
| Utilitaires | Lombok, Jakarta Validation, iText PDF 5.5.13 |

---

## Architecture

Le projet suit une architecture **MVC en couches** classique pour Spring Boot :

```
src/main/java/com/ega/bank_system/
├── config/          # SecurityConfig, WebConfig, OpenApiConfig, DataInitializer
├── controller/      # AuthController, ClientController, CompteController, TransactionController
├── dto/             # Objets de transfert (Request / Response)
├── entity/          # Entités JPA : User, Client, Compte (abstract), CompteCourant, CompteEpargne, Transaction
├── enums/           # Role, TypeCompte, TypeTransaction, StatutTransaction
├── exception/       # Exceptions métier custom (BusinessException, SoldeInsuffisantException, ...)
├── repository/      # Interfaces Spring Data JPA
├── security/        # JwtService, JwtAuthenticationFilter, BlacklistService, CustomUserDetailsService
├── service/         # Interfaces de service
│   └── impl/        # Implémentations : ClientServiceImpl, CompteServiceImpl, TransactionServiceImpl
└── util/            # IbanGenerator, PDFGenerator
```

**Héritage JPA** : `Compte` utilise la stratégie `SINGLE_TABLE` avec un discriminateur (`COURANT` / `EPARGNE`), ce qui unifie la table `comptes` tout en conservant des comportements distincts via le polymorphisme.

---

## Prérequis

- **Java 17+**
- **Maven 3.6+** (ou utiliser le wrapper `./mvnw`)
- Une base **PostgreSQL** accessible (le projet est configuré pour Supabase par défaut)

---

## Installation et démarrage

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd bank-system

# Compiler et lancer
./mvnw spring-boot:run

# Ou construire le JAR puis l'exécuter
./mvnw clean package -DskipTests
java -jar target/bank-system-0.0.1-SNAPSHOT.jar
```

L'API démarre sur le port **8081** par défaut.

---

## Configuration

Le fichier principal est `src/main/resources/application.yaml`.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<host>:5432/<database>
    username: <username>
    password: <password>

server:
  port: 8081

# Paramètres JWT (à surcharger en production)
jwt:
  secret: "votre-cle-secrete-base64-minimum-32-octets"
  expiration: 86400000       # 24h en ms
  refresh:
    expiration: 604800000    # 7j en ms

# Limites de transactions (valeurs par défaut)
app:
  transaction:
    max-withdrawal: 5000
    max-transfer: 10000
  bank:
    country-code: TN
    bank-code: EGA
```

> **Production** : Externalisez les secrets via des variables d'environnement ou un vault. Ne commitez jamais la clé JWT ni les credentials DB.

---

## Données initiales

Au premier démarrage, le `DataInitializer` crée automatiquement deux comptes système s'ils n'existent pas :

| Rôle | Username | Password | Email |
|---|---|---|---|
| ADMIN | `admin` | `admin123` | admin@ega-bank.tn |
| AGENT | `agent` | `agent123` | agent@ega-bank.tn |

> Changez ces mots de passe dès le premier démarrage en production via `POST /api/v1/auth/change-password`.

---

## API Reference

Base URL : `http://localhost:8081/api/v1`

Toutes les requêtes protégées nécessitent le header :
```
Authorization: Bearer <accessToken>
```

---

### Authentification

#### `POST /auth/login`
Connexion — public, aucun token requis.

**Body** :
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Réponse 200** :
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "username": "admin",
  "role": "ADMIN"
}
```

---

#### `POST /auth/register` — 🔒 ADMIN
Crée un nouvel utilisateur (ADMIN ou AGENT).

**Body** :
```json
{
  "username": "agent2",
  "email": "agent2@ega-bank.tn",
  "password": "motdepasse123",
  "role": "AGENT"
}
```

---

#### `POST /auth/refresh`
Renouvelle l'access token à partir d'un refresh token valide.

**Header** : `Authorization: Bearer <refreshToken>`

---

#### `POST /auth/change-password` — 🔒 Authentifié
```json
{
  "oldPassword": "admin123",
  "newPassword": "nouveauMdp456",
  "confirmPassword": "nouveauMdp456"
}
```

---

#### `POST /auth/logout` — 🔒 Authentifié
Révoque le token courant (ajout en blacklist jusqu'à expiration) et invalide la session.

---

### Clients

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/clients` | Authentifié | Créer un client |
| `GET` | `/clients` | Authentifié | Lister tous les clients |
| `GET` | `/clients/{id}` | Authentifié | Obtenir un client par ID |
| `GET` | `/clients/code/{clientCode}` | Authentifié | Obtenir par code unique |
| `GET` | `/clients/search?query=` | Authentifié | Recherche textuelle |
| `PUT` | `/clients/{id}` | Authentifié | Mettre à jour un client |
| `DELETE` | `/clients/{id}` | Authentifié | Désactiver (soft delete) |
| `PATCH` | `/clients/{id}/activate` | Authentifié | Activer |
| `PATCH` | `/clients/{id}/deactivate` | Authentifié | Désactiver |
| `GET` | `/clients/{id}/comptes` | Authentifié | Comptes du client |
| `GET` | `/clients/{id}/with-comptes` | Authentifié | Client + ses comptes |

**Exemple — créer un client** :
```json
{
  "nom": "Ben Ali",
  "prenom": "Mohamed",
  "email": "m.benali@example.com",
  "telephone": "+21650000000",
  "adresse": "12 Rue de la République, Tunis",
  "dateNaissance": "1990-06-15",
  "sexe": "M",
  "nationalite": "Tunisienne"
}
```

---

### Comptes

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/comptes` | ADMIN | Créer un compte |
| `GET` | `/comptes` | Authentifié | Lister tous les comptes |
| `GET` | `/comptes/{numeroCompte}` | Authentifié | Détail d'un compte |
| `GET` | `/comptes/client/{clientId}` | Authentifié | Comptes d'un client |
| `GET` | `/comptes/type/{type}` | Authentifié | Par type (COURANT / EPARGNE) |
| `PATCH` | `/comptes/{numeroCompte}/activate` | ADMIN | Activer |
| `PATCH` | `/comptes/{numeroCompte}/deactivate` | ADMIN | Désactiver |
| `DELETE` | `/comptes/{numeroCompte}` | ADMIN | Supprimer |

**Créer un compte courant** :
```json
{
  "clientId": 1,
  "type": "COURANT"
}
```

**Créer un compte épargne** :
```json
{
  "clientId": 1,
  "type": "EPARGNE",
  "tauxInteret": 2.5
}
```

Le `numeroCompte` est un IBAN généré automatiquement au format `TN + checkDigits + EGA + numeroAléatoire` (24 caractères pour la Tunisie).

---

### Opérations bancaires

#### `POST /comptes/{numeroCompte}/depot` — 🔒 AGENT / ADMIN
```
POST /comptes/TN59EGA0123456789/depot?montant=1000&description=Dépôt%20espèces
```

#### `POST /comptes/{numeroCompte}/retrait` — 🔒 AGENT / ADMIN
```
POST /comptes/TN59EGA0123456789/retrait?montant=200
```

#### `POST /comptes/virement` — 🔒 AGENT / ADMIN
```json
{
  "compteSource": "TN59EGA0123456789",
  "compteDestination": "TN31EGA9876543210",
  "montant": 500.00,
  "description": "Remboursement"
}
```

Un virement crée deux transactions liées : `VIREMENT_EMIS` sur le compte source et `VIREMENT_RECU` sur le compte destination.

#### `GET /comptes/{numeroCompte}/solde` — 🔒 Authentifié
Retourne le solde courant sous forme de `BigDecimal`.

#### `GET /comptes/{numeroCompte}/transactions` — 🔒 Authentifié
Historique complet des transactions du compte, trié par date décroissante.

#### `GET /comptes/{numeroCompte}/transactions/period` — 🔒 Authentifié
```
GET /comptes/TN59EGA0123456789/transactions/period?startDate=2026-01-01T00:00:00&endDate=2026-09-01T23:59:59
```

**Réponse transaction** :
```json
{
  "id": 42,
  "reference": "TRX17234567890123",
  "type": "DEPOT",
  "statut": "VALIDEE",
  "montant": 1000.00,
  "devise": "TND",
  "dateOperation": "2026-09-02T10:30:00",
  "description": "Dépôt espèces",
  "libelle": "Dépôt",
  "compteId": "TN59EGA0123456789",
  "compteDestinationId": null
}
```

---

## Modèle de données

```
users
├── id (PK), username (UNIQUE), email (UNIQUE), password (BCrypt)
├── role (ADMIN | AGENT)
└── enabled, accountNonExpired, accountNonLocked, credentialsNonExpired

clients
├── id (PK), client_code (UNIQUE, auto-généré)
├── nom, prenom, date_naissance, sexe, nationalite
├── adresse, telephone (UNIQUE), email (UNIQUE)
└── active, created_at, updated_at

comptes  (SINGLE_TABLE — discriminateur: type)
├── numero_compte (PK, UNIQUE, IBAN 24 chars)
├── type (COURANT | EPARGNE)
├── solde (DECIMAL 15,2), date_creation
├── client_id (FK → clients)
└── taux_interet (EPARGNE uniquement)

transactions
├── id (PK), reference (UNIQUE, auto-générée: TRXxxxxxxxxxx)
├── type (DEPOT | RETRAIT | VIREMENT_EMIS | VIREMENT_RECU | FRAIS | INTERET)
├── statut (EN_ATTENTE | VALIDEE | REJETEE | ANNULEE)
├── montant (DECIMAL 15,2), devise (TND par défaut)
├── date_operation, description, libelle
├── compte_id (FK → comptes)
└── compte_destination_id (FK → comptes, nullable)
```

---

## Sécurité

### Flux d'authentification

```
1. POST /auth/login  →  Génération access_token (24h) + refresh_token (7j)
2. Requête protégée  →  JwtAuthenticationFilter extrait et valide le JWT
3. Vérification BlacklistService (tokens révoqués)
4. SecurityContextHolder alimenté → @PreAuthorize évalué
```

### Matrice des droits

| Opération | ADMIN | AGENT |
|---|:---:|:---:|
| Login / Logout / Change password | ✅ | ✅ |
| Créer un utilisateur | ✅ | ❌ |
| Créer / Activer / Désactiver / Supprimer un compte | ✅ | ❌ |
| Lister les comptes / Consulter le solde | ✅ | ✅ |
| Dépôt / Retrait / Virement | ✅ | ✅ |
| Gestion des clients | ✅ | ✅ |

### Détails d'implémentation

- Mots de passe hashés avec **BCrypt**
- JWT signé en **HS256** avec une clé configurable (`jwt.secret`)
- Déconnexion via **blacklist en mémoire** (nettoyage toutes les 60s) — à remplacer par Redis en production
- Session **stateless** (STATELESS SessionCreationPolicy)
- CORS ouvert (`*`) — à restreindre en production

---

## Limites et règles métier

| Règle | Valeur par défaut | Propriété |
|---|---|---|
| Retrait max global | 5 000 TND | `app.transaction.max-withdrawal` |
| Virement max global | 10 000 TND | `app.transaction.max-transfer` |
| Limite retrait CompteCourant | 5 000 TND | Défini dans l'entité |
| Limite retrait CompteEpargne | 3 000 TND | Défini dans l'entité |
| Taux d'intérêt épargne (défaut) | 2,5 % | Configurable à la création |
| Devise par défaut | TND | Hardcodé dans le service |
| Virement vers soi-même | ❌ Interdit | Validation dans TransactionServiceImpl |

---

## Documentation interactive

Swagger UI est disponible à l'adresse suivante après démarrage :

```
http://localhost:8081/swagger-ui.html
```

La spec OpenAPI JSON est accessible sur :

```
http://localhost:8081/v3/api-docs
```

Une collection **Postman** est incluse à la racine du projet : `postman_collection.json`.

---

## Codes HTTP

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Succès sans contenu |
| 400 | Données invalides / règle métier violée |
| 401 | Non authentifié ou token expiré |
| 403 | Droits insuffisants |
| 404 | Ressource non trouvée |
| 409 | Conflit (doublon username / email) |
| 500 | Erreur serveur |
