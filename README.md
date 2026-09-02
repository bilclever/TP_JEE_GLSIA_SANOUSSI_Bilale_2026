# EGA Bank System — Monorepo

Plateforme bancaire full-stack composée d'une API REST Spring Boot et d'une SPA Angular. Elle couvre la gestion des clients, des comptes bancaires (Courant / Épargne), les opérations financières (dépôt, retrait, virement) et un tableau de bord analytique.

```
/
├── bank-system/    → API REST (Spring Boot 3.5.9, Java 17)
└── frontend/       → Application web (Angular 21, Tailwind CSS, Angular Material)
```




## Architecture

```
┌─────────────────────────┐        HTTP/JSON        ┌──────────────────────────────┐
│   Angular 21 (SPA)      │ ──────────────────────► │   Spring Boot 3.5.9 (REST)   │
│   localhost:4200         │   Authorization: Bearer  │   localhost:8081             │
│                         │ ◄────────────────────── │                              │
└─────────────────────────┘                          └──────────────┬───────────────┘
                                                                     │ Spring Data JPA
                                                                     ▼
                                                          ┌─────────────────────┐
                                                          │  PostgreSQL          │
                                                          │  (Supabase Cloud)    │
                                                          └─────────────────────┘
```

Le frontend communique exclusivement via l'API REST. Un interceptor Angular injecte automatiquement le JWT dans chaque requête et gère le rafraîchissement du token.

---

## Backend — bank-system

### Stack technique backend

| Couche | Technologie |
|---|---|
| Framework | Spring Boot 3.5.9 |
| Langage | Java 17 |
| Sécurité | Spring Security + JJWT 0.11.5 (HS256) |
| Persistance | Spring Data JPA / Hibernate (DDL auto: update) |
| Base de données | PostgreSQL |
| Documentation API | SpringDoc OpenAPI 2.6.0 — Swagger UI |
| Build | Maven 3 (wrapper inclus) |
| Utilitaires | Lombok, Jakarta Validation, iText PDF 5.5.13 |

### Démarrage rapide backend

```bash
cd bank-system

# Démarrer avec le wrapper Maven
./mvnw spring-boot:run

# Ou construire le JAR
./mvnw clean package -DskipTests
java -jar target/bank-system-0.0.1-SNAPSHOT.jar
```

L'API est disponible sur `http://localhost:8081`.

### Configuration

Fichier : `bank-system/src/main/resources/application.yaml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<host>:5432/<database>
    username: <username>
    password: <password>           # À externaliser en production

server:
  port: 8081

jwt:
  secret: "<clé-base64-min-32-octets>"  # À changer obligatoirement en production
  expiration: 86400000                   # 24h
  refresh:
    expiration: 604800000                # 7 jours

app:
  transaction:
    max-withdrawal: 5000    # Limite globale retrait (TND)
    max-transfer: 10000     # Limite globale virement (TND)
  bank:
    country-code: TN
    bank-code: EGA
```

### Données initiales

Au premier démarrage, le `DataInitializer` crée ces deux comptes s'ils n'existent pas :

| Rôle | Username | Password |
|---|---|---|
| ADMIN | `admin` | `admin123` |
| AGENT | `agent` | `agent123` |

> Changez ces mots de passe immédiatement en production via `POST /api/v1/auth/change-password`.

### API Reference

Base URL : `http://localhost:8081/api/v1`

Header requis pour les routes protégées : `Authorization: Bearer <accessToken>`

#### Authentification — `/auth`

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Connexion, retourne access + refresh tokens |
| `POST` | `/auth/register` | ADMIN | Créer un utilisateur (ADMIN ou AGENT) |
| `POST` | `/auth/refresh` | Bearer refreshToken | Renouveler l'access token |
| `POST` | `/auth/change-password` | Authentifié | Modifier son mot de passe |
| `POST` | `/auth/logout` | Authentifié | Déconnexion (révocation token) |

**Login — exemple :**
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "username": "admin",
  "role": "ADMIN"
}
```

#### Clients — `/clients`

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/clients` | Créer un client |
| `GET` | `/clients` | Lister tous les clients |
| `GET` | `/clients/{id}` | Détail par ID |
| `GET` | `/clients/code/{code}` | Détail par code unique |
| `GET` | `/clients/search?query=` | Recherche textuelle |
| `PUT` | `/clients/{id}` | Mettre à jour |
| `DELETE` | `/clients/{id}` | Désactiver (soft delete) |
| `PATCH` | `/clients/{id}/activate` | Activer |
| `PATCH` | `/clients/{id}/deactivate` | Désactiver |
| `GET` | `/clients/{id}/comptes` | Comptes du client |
| `GET` | `/clients/{id}/with-comptes` | Client + ses comptes |

#### Comptes — `/comptes`

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/comptes` | ADMIN | Créer un compte (IBAN généré automatiquement) |
| `GET` | `/comptes` | Authentifié | Lister tous les comptes |
| `GET` | `/comptes/{numeroCompte}` | Authentifié | Détail d'un compte |
| `GET` | `/comptes/client/{clientId}` | Authentifié | Comptes d'un client |
| `GET` | `/comptes/type/{type}` | Authentifié | Par type : `COURANT` ou `EPARGNE` |
| `PATCH` | `/comptes/{numeroCompte}/activate` | ADMIN | Activer |
| `PATCH` | `/comptes/{numeroCompte}/deactivate` | ADMIN | Désactiver |
| `DELETE` | `/comptes/{numeroCompte}` | ADMIN | Supprimer |

**Créer un compte :**
```json
// Compte courant
{ "clientId": 1, "type": "COURANT" }

// Compte épargne avec taux
{ "clientId": 1, "type": "EPARGNE", "tauxInteret": 2.5 }
```

#### Opérations bancaires

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/comptes/{num}/depot` | AGENT / ADMIN | Dépôt (`?montant=500&description=...`) |
| `POST` | `/comptes/{num}/retrait` | AGENT / ADMIN | Retrait (`?montant=200`) |
| `POST` | `/comptes/virement` | AGENT / ADMIN | Virement inter-comptes (body JSON) |
| `GET` | `/comptes/{num}/solde` | Authentifié | Solde courant |
| `GET` | `/comptes/{num}/transactions` | Authentifié | Historique complet |
| `GET` | `/comptes/{num}/transactions/period` | Authentifié | Transactions sur période (`?startDate=...&endDate=...`) |

**Virement :**
```json
{
  "compteSource": "TN59EGA0123456789",
  "compteDestination": "TN31EGA9876543210",
  "montant": 500.00,
  "description": "Remboursement"
}
```

Un virement génère deux transactions liées : `VIREMENT_EMIS` (débit source) et `VIREMENT_RECU` (crédit destination).

#### Codes HTTP

| Code | Signification |
|---|---|
| `200` | Succès |
| `201` | Ressource créée |
| `204` | Succès sans contenu |
| `400` | Données invalides / règle métier violée |
| `401` | Non authentifié ou token expiré |
| `403` | Droits insuffisants |
| `404` | Ressource non trouvée |
| `409` | Conflit (username ou email déjà pris) |

### Sécurité

**Matrice des droits :**

| Opération | ADMIN | AGENT |
|---|:---:|:---:|
| Login / Logout / Changer mot de passe | ✅ | ✅ |
| Créer un utilisateur | ✅ | ❌ |
| Créer / Modifier / Supprimer un compte | ✅ | ❌ |
| Consulter comptes / solde / transactions | ✅ | ✅ |
| Dépôt / Retrait / Virement | ✅ | ✅ |
| Gestion des clients (CRUD) | ✅ | ✅ |
| Dashboard & rapports | ✅ | ❌ |

**Détails :**
- Mots de passe hashés avec **BCrypt**
- JWT signé **HS256**, clé configurable dans `application.yaml`
- Session **stateless** — aucun cookie serveur
- Déconnexion via **blacklist en mémoire** (nettoyage toutes les 60s) — à remplacer par Redis en production
- CORS ouvert (`*`) — à restreindre selon les domaines frontend en production
- Endpoints publics : `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/swagger-ui/**`, `/v3/api-docs/**`

### Règles métier

| Règle | Valeur par défaut | Propriété configurable |
|---|---|---|
| Retrait max global | 5 000 TND | `app.transaction.max-withdrawal` |
| Virement max global | 10 000 TND | `app.transaction.max-transfer` |
| Limite retrait Compte Courant | 5 000 TND | — |
| Limite retrait Compte Épargne | 3 000 TND | — |
| Taux intérêt épargne par défaut | 2,5 % | Paramétrable à la création |
| Devise par défaut | TND | — |
| Virement vers soi-même | ❌ Interdit | — |
| Solde initial d'un compte | 0 | — |

---

## Frontend — Angular

### Stack technique frontend

| Couche | Technologie |
|---|---|
| Framework | Angular 21 (standalone components) |
| UI | Angular Material 21 + Tailwind CSS 3 |
| Graphiques | Chart.js 4 + ng2-charts 8 |
| Notifications | ngx-toastr |
| Cookies | ngx-cookie-service |
| Export | xlsx (Excel) + jsPDF (PDF) |
| HTTP | Angular HttpClient + interceptors |
| Réactivité | RxJS 7 |
| Tests | Vitest |
| Build | Angular CLI 21 / esbuild |

### Démarrage rapide frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
# → http://localhost:4200

# Build production
npm run build
# → dist/ (à déployer sur Vercel, Nginx, etc.)
```

La configuration de l'URL API se trouve dans `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  appName: 'Banque Ega',
  version: '1.0.0',
  domain: 'localhost'
};
```



**Dashboard :**
- KPIs temps réel : comptes actifs, clients, solde total, nombre de transactions
- Graphiques par onglet : transactions (bar + doughnut), comptes (line + pie), clients (line + top 10)
- Filtres par période : aujourd'hui, semaine, mois, année, personnalisé
- Export PDF du rapport
- Support thème clair / sombre

**Gestion des clients :**
- Liste paginée avec recherche textuelle
- Formulaire création / édition (validation complète)
- Activation / désactivation
- Visualisation des comptes associés
- Export Excel, CSV, JSON, impression

**Opérations bancaires :**
- Dépôt et retrait avec validation du montant
- Virement inter-comptes
- Retour immédiat de la transaction créée

### Structure du projet

```
frontend/src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts         → Vérifie la présence du JWT
│   │   └── role.guard.ts         → Vérifie le rôle requis par la route
│   ├── interceptors/
│   │   ├── auth.interceptor.ts   → Injecte le Bearer token sur chaque requête
│   │   └── error.interceptor.ts  → Gestion globale des erreurs HTTP (401, 403, 500)
│   └── services/
│       ├── auth.service.ts       → Login, logout, refresh token, profil
│       ├── client.service.ts     → CRUD clients
│       ├── compte.service.ts     → CRUD comptes
│       ├── transaction.service.ts→ Opérations et historique
│       ├── export.service.ts     → Export Excel / CSV / JSON / PDF
│       ├── theme.service.ts      → Bascule thème clair / sombre
│       └── toast.service.ts      → Notifications (ngx-toastr)
├── layouts/
│   └── main-layout.component.ts  → Shell principal (sidebar + header)
├── modules/
│   ├── auth/login.component.ts
│   ├── comptes/
│   ├── operations/
│   ├── transactions/
│   ├── parametres/
│   ├── profil/
│   └── rapports/
├── shared/
│   ├── components/
│   │   ├── dashboard.component.ts
│   │   ├── client-list.component.ts
│   │   ├── client-form/
│   │   └── confirm-dialog/
│   └── pipes/
│       └── phone.pipe.ts         → Formatage numéros de téléphone
├── app.routes.ts                 → Routes avec lazy loading + guards
├── app.config.ts
└── app.ts
```

---

## Démarrage de l'ensemble

Pour lancer les deux parties simultanément, ouvrez deux terminaux :

**Terminal 1 — Backend :**
```bash
cd bank-system
./mvnw spring-boot:run
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm start
```

Accès :
- Application : `http://localhost:4200`
- API : `http://localhost:8081`
- Swagger UI : `http://localhost:8081/swagger-ui.html`

---

## Documentation interactive

| Ressource | URL |
|---|---|
| Swagger UI | `http://localhost:8081/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8081/v3/api-docs` |
| Collection Postman | `bank-system/postman_collection.json` |
| Référence API détaillée | `bank-system/API_REFERENCE.md` |
| Guide sécurité | `bank-system/SECURITY_GUIDE.md` |
| Guide développement frontend | `frontend/DEVELOPMENT.md` |
