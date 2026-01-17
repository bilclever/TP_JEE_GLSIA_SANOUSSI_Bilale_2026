# Guide de Sécurité - Système Bancaire EGA

## Vue d'ensemble
Le système bancaire EGA utilise une architecture sécurisée basée sur JWT (JSON Web Tokens) avec deux rôles d'utilisateurs :

### 1. **ADMIN** (Administrateur)
- Accès complet au système
- Peut créer/modifier/supprimer les comptes
- Peut effectuer les opérations bancaires (dépôt, retrait, virement)
- Peut créer/modifier/supprimer les utilisateurs

### 2. **AGENT** (Agent Bancaire)
- Accès limité aux opérations courantes
- Peut effectuer les opérations bancaires (dépôt, retrait, virement)
- **NE PEUT PAS** créer/modifier/supprimer les comptes
- **NE PEUT PAS** gérer les utilisateurs

---

## Utilisateurs par défaut

### Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@ega-bank.tn`

### Agent
- **Username**: `agent`
- **Password**: `agent123`
- **Email**: `agent@ega-bank.tn`

---

## Endpoints de l'API

### 1. Authentication (Pas d'authentification requise)

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

#### Logout (Authentification requise)
```
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}

Response: "Déconnexion réussie"
```

#### Register (ADMIN seulement)
```
POST /api/v1/auth/register
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "username": "nouvel_agent",
  "email": "agent@example.com",
  "password": "password123",
  "role": "AGENT"
}
```

#### Change Password (Authentification requise)
```
POST /api/v1/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "oldPassword": "admin123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh
Authorization: Bearer {refreshToken}
```

---

### 2. Gestion des Comptes Bancaires

#### Créer un compte (ADMIN seulement)
```
POST /api/v1/comptes
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "clientId": 1,
  "type": "COURANT"
}

ou pour compte épargne:
{
  "clientId": 1,
  "type": "EPARGNE",
  "tauxInteret": 2.5
}
```

#### Lister tous les comptes (Authentification requise)
```
GET /api/v1/comptes
Authorization: Bearer {accessToken}
```

#### Obtenir un compte (Authentification requise)
```
GET /api/v1/comptes/{numeroCompte}
Authorization: Bearer {accessToken}
```

#### Obtenir les comptes d'un client (Authentification requise)
```
GET /api/v1/comptes/client/{clientId}
Authorization: Bearer {accessToken}
```

#### Activer un compte (ADMIN seulement)
```
PATCH /api/v1/comptes/{numeroCompte}/activate
Authorization: Bearer {adminToken}
```

#### Désactiver un compte (ADMIN seulement)
```
PATCH /api/v1/comptes/{numeroCompte}/deactivate
Authorization: Bearer {adminToken}
```

#### Supprimer un compte (ADMIN seulement)
```
DELETE /api/v1/comptes/{numeroCompte}
Authorization: Bearer {adminToken}
```

---

### 3. Opérations Bancaires (AGENT et ADMIN)

#### Dépôt
```
POST /api/v1/comptes/{numeroCompte}/depot?montant=500&description=Dépôt%20espèces
Authorization: Bearer {agentToken ou adminToken}

Response: TransactionDTO
```

#### Retrait
```
POST /api/v1/comptes/{numeroCompte}/retrait?montant=200&description=Retrait%20espèces
Authorization: Bearer {agentToken ou adminToken}

Response: TransactionDTO
```

#### Virement
```
POST /api/v1/comptes/virement
Authorization: Bearer {agentToken ou adminToken}
Content-Type: application/json

{
  "numeroCompteSource": "123456789",
  "numeroCompteDestination": "987654321",
  "montant": 1000,
  "description": "Virement"
}

Response: TransactionDTO
```

#### Consulter le solde
```
GET /api/v1/comptes/{numeroCompte}/solde
Authorization: Bearer {accessToken}

Response: 5000.00
```

#### Consulter les transactions
```
GET /api/v1/comptes/{numeroCompte}/transactions
Authorization: Bearer {accessToken}

Response: List<TransactionDTO>
```

#### Consulter les transactions sur une période
```
GET /api/v1/comptes/{numeroCompte}/transactions/period?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
Authorization: Bearer {accessToken}

Response: List<TransactionDTO>
```

---

## Règles de Sécurité

### Authentification
- Tous les endpoints (sauf login et register) nécessitent un token JWT valide
- Le token doit être fourni dans l'en-tête `Authorization: Bearer {token}`
- Les tokens expirent après 24 heures
- Les refresh tokens expirent après 7 jours

### Autorisation (Contrôle d'Accès)
| Opération | ADMIN | AGENT |
|-----------|-------|-------|
| Login | ✅ | ✅ |
| Logout | ✅ | ✅ |
| Créer utilisateur | ✅ | ❌ |
| Créer compte | ✅ | ❌ |
| Lister comptes | ✅ | ✅ |
| Consulter solde | ✅ | ✅ |
| Dépôt | ✅ | ✅ |
| Retrait | ✅ | ✅ |
| Virement | ✅ | ✅ |
| Activer/Désactiver compte | ✅ | ❌ |
| Supprimer compte | ✅ | ❌ |

---

## Codes d'Erreur

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Succès (pas de contenu) |
| 400 | Données invalides |
| 401 | Non authentifié ou token expiré |
| 403 | Accès refusé (droits insuffisants) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## Exemple de flux complet

### 1. Login en tant qu'agent
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent",
    "password": "agent123"
  }'
```

### 2. Effectuer un dépôt
```bash
curl -X POST "http://localhost:8081/api/v1/comptes/123456789/depot?montant=500&description=Dépôt" \
  -H "Authorization: Bearer {accessToken}"
```

### 3. Consulter le solde
```bash
curl -X GET "http://localhost:8081/api/v1/comptes/123456789/solde" \
  -H "Authorization: Bearer {accessToken}"
```

### 4. Logout
```bash
curl -X POST http://localhost:8081/api/v1/auth/logout \
  -H "Authorization: Bearer {accessToken}"
```

---

## Notes de Sécurité

1. **Ne jamais exposer les tokens** dans les logs ou consoles
2. **Les mots de passe** sont hashés avec BCrypt
3. **Les tokens JWT** sont signés avec une clé secrète
4. **La clé secrète** doit être changée en production
5. **HTTPS** doit être utilisé en production
6. **Les tokens expirent** automatiquement après la période définie
7. **Les opérations sensibles** sont loggées pour audit

---

## Configuration

Les paramètres JWT peuvent être configurés dans `application.properties` ou `application.yaml` :

```yaml
jwt:
  secret: "votre-clé-secrète-en-production"
  expiration: 86400000  # 24 heures en millisecondes
  refresh:
    expiration: 604800000  # 7 jours en millisecondes
```

---

## Support

Pour toute question ou problème de sécurité, veuillez contacter l'équipe de support EGA.

