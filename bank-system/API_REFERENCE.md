# 📚 Référence des APIs - Système Bancaire EGA

## Table des matières
1. [Authentification](#authentification)
2. [Gestion des Comptes](#gestion-des-comptes)
3. [Opérations Bancaires](#opérations-bancaires)
4. [Codes d'Erreur](#codes-derreur)

---

## Authentification

### 1. Login
Permet à un utilisateur de se connecter et obtenir des tokens JWT.

**Endpoint**: `POST /api/v1/auth/login`  
**Authentification**: Non requise  
**Rôles autorisés**: Tous

**Request Body**:
```json
{
  "username": "agent",
  "password": "agent123"
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZ2VudCIsImlhdCI6MTY2NDcxMzIwMCwiZXhwIjoxNjY0Nzk5NjAwfQ.xxx",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZ2VudCIsImlhdCI6MTY2NDcxMzIwMCwiZXhwIjoxNjY1MzE4MDAwfQ.xxx",
  "username": "agent",
  "role": "AGENT"
}
```

**Erreurs possibles**:
- `401`: Identifiants invalides

---

### 2. Logout
Permet à un utilisateur de se déconnecter.

**Endpoint**: `POST /api/v1/auth/logout`  
**Authentification**: ✅ Requise (accessToken)  
**Rôles autorisés**: AGENT, ADMIN

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```
"Déconnexion réussie"
```

**Erreurs possibles**:
- `401`: Token expiré ou manquant
- `403`: Non autorisé

---

### 3. Register (Créer un utilisateur)
Permet à un admin de créer un nouvel utilisateur.

**Endpoint**: `POST /api/v1/auth/register`  
**Authentification**: ✅ Requise (accessToken admin)  
**Rôles autorisés**: ADMIN seulement

**Headers**:
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "agent2",
  "email": "agent2@ega-bank.tn",
  "password": "agent2123",
  "role": "AGENT"
}
```

**Response (200)**:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "username": "agent2",
  "role": "AGENT"
}
```

**Erreurs possibles**:
- `400`: Données invalides, utilisateur existe déjà
- `401`: Token invalide
- `403`: Accès refusé (non admin)

---

### 4. Change Password
Permet à un utilisateur authentifié de changer son mot de passe.

**Endpoint**: `POST /api/v1/auth/change-password`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "oldPassword": "agent123",
  "newPassword": "newAgent123",
  "confirmPassword": "newAgent123"
}
```

**Response (200)**:
```
"Mot de passe modifié avec succès"
```

**Erreurs possibles**:
- `400`: Ancien mot de passe incorrect, mots de passe non identiques
- `401`: Non authentifié

---

### 5. Refresh Token
Permet de générer un nouveau accessToken à partir d'un refreshToken.

**Endpoint**: `POST /api/v1/auth/refresh`  
**Authentification**: ✅ Requise (refreshToken)  
**Rôles autorisés**: Tous

**Headers**:
```
Authorization: Bearer {refreshToken}
```

**Response (200)**:
```json
{
  "accessToken": "nouveau_token_jwt",
  "refreshToken": "refresh_token",
  "username": "agent",
  "role": "AGENT"
}
```

**Erreurs possibles**:
- `401`: Refresh token invalide ou expiré

---

## Gestion des Comptes

### 1. Créer un compte
Crée un nouveau compte bancaire pour un client.

**Endpoint**: `POST /api/v1/comptes`  
**Authentification**: ✅ Requise (accessToken)  
**Rôles autorisés**: ADMIN seulement

**Headers**:
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "clientId": 1,
  "type": "COURANT"
}
```

Ou pour compte épargne:
```json
{
  "clientId": 1,
  "type": "EPARGNE",
  "tauxInteret": 2.5
}
```

**Response (201)**:
```json
{
  "numeroCompte": "1234567890",
  "solde": 0,
  "type": "COURANT",
  "dateCreation": "2024-01-17T10:30:00",
  "active": true,
  "clientId": 1
}
```

**Erreurs possibles**:
- `400`: Données invalides
- `403`: Non admin
- `404`: Client non trouvé

---

### 2. Lister tous les comptes
Récupère la liste de tous les comptes.

**Endpoint**: `GET /api/v1/comptes`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```json
[
  {
    "numeroCompte": "1234567890",
    "solde": 5000,
    "type": "COURANT",
    "dateCreation": "2024-01-17T10:30:00",
    "active": true,
    "clientId": 1
  },
  {
    "numeroCompte": "0987654321",
    "solde": 10000,
    "type": "EPARGNE",
    "dateCreation": "2024-01-18T14:15:00",
    "active": true,
    "clientId": 2,
    "tauxInteret": 2.5
  }
]
```

---

### 3. Obtenir un compte
Récupère les détails d'un compte spécifique.

**Endpoint**: `GET /api/v1/comptes/{numeroCompte}`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```json
{
  "numeroCompte": "1234567890",
  "solde": 5000,
  "type": "COURANT",
  "dateCreation": "2024-01-17T10:30:00",
  "active": true,
  "clientId": 1
}
```

**Erreurs possibles**:
- `404`: Compte non trouvé

---

### 4. Obtenir les comptes d'un client
Récupère tous les comptes d'un client spécifique.

**Endpoint**: `GET /api/v1/comptes/client/{clientId}`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `clientId` (number): ID du client

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```json
[
  {
    "numeroCompte": "1234567890",
    "solde": 5000,
    "type": "COURANT",
    "dateCreation": "2024-01-17T10:30:00",
    "active": true,
    "clientId": 1
  }
]
```

---

### 5. Activer un compte
Active un compte désactivé.

**Endpoint**: `PATCH /api/v1/comptes/{numeroCompte}/activate`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: ADMIN seulement

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Response (200)**:
```
(vide)
```

**Erreurs possibles**:
- `403`: Non admin
- `404`: Compte non trouvé

---

### 6. Désactiver un compte
Désactive un compte.

**Endpoint**: `PATCH /api/v1/comptes/{numeroCompte}/deactivate`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: ADMIN seulement

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Response (200)**:
```
(vide)
```

---

### 7. Supprimer un compte
Supprime complètement un compte.

**Endpoint**: `DELETE /api/v1/comptes/{numeroCompte}`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: ADMIN seulement

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Response (204)**:
```
(aucun contenu)
```

**Erreurs possibles**:
- `403`: Non admin
- `404`: Compte non trouvé

---

## Opérations Bancaires

### 1. Dépôt
Effectue un dépôt sur un compte.

**Endpoint**: `POST /api/v1/comptes/{numeroCompte}/depot`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Query Parameters**:
- `montant` (number, required): Montant du dépôt
- `description` (string, optional): Description du dépôt

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Exemple**:
```
POST /api/v1/comptes/1234567890/depot?montant=500&description=Dépôt%20espèces
```

**Response (200)**:
```json
{
  "id": 1,
  "numeroCompte": "1234567890",
  "type": "DEPOT",
  "montant": 500,
  "description": "Dépôt espèces",
  "dateTransaction": "2024-01-17T11:45:30",
  "statut": "RÉUSSIE",
  "nouveauSolde": 5500
}
```

**Erreurs possibles**:
- `403`: Non autorisé (agent ne peut pas déposer)
- `404`: Compte non trouvé
- `400`: Montant invalide

---

### 2. Retrait
Effectue un retrait sur un compte.

**Endpoint**: `POST /api/v1/comptes/{numeroCompte}/retrait`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Query Parameters**:
- `montant` (number, required): Montant du retrait
- `description` (string, optional): Description

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Exemple**:
```
POST /api/v1/comptes/1234567890/retrait?montant=200
```

**Response (200)**:
```json
{
  "id": 2,
  "numeroCompte": "1234567890",
  "type": "RETRAIT",
  "montant": 200,
  "description": "Retrait espèces",
  "dateTransaction": "2024-01-17T11:50:00",
  "statut": "RÉUSSIE",
  "nouveauSolde": 5300
}
```

**Erreurs possibles**:
- `403`: Non autorisé
- `404`: Compte non trouvé
- `400`: Solde insuffisant ou montant invalide

---

### 3. Virement
Effectue un virement entre deux comptes.

**Endpoint**: `POST /api/v1/comptes/virement`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "numeroCompteSource": "1234567890",
  "numeroCompteDestination": "0987654321",
  "montant": 1000,
  "description": "Virement salaire"
}
```

**Response (200)**:
```json
{
  "id": 3,
  "numeroCompte": "1234567890",
  "type": "VIREMENT",
  "montant": 1000,
  "description": "Virement salaire",
  "dateTransaction": "2024-01-17T12:00:00",
  "statut": "RÉUSSIE",
  "nouveauSolde": 4300,
  "compteDestination": "0987654321"
}
```

**Erreurs possibles**:
- `403`: Non autorisé
- `404`: Compte source ou destination non trouvé
- `400`: Solde insuffisant ou montant invalide

---

### 4. Consulter le solde
Obtient le solde actuel d'un compte.

**Endpoint**: `GET /api/v1/comptes/{numeroCompte}/solde`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```
5300.00
```

**Erreurs possibles**:
- `404`: Compte non trouvé

---

### 5. Consulter les transactions
Récupère l'historique des transactions d'un compte.

**Endpoint**: `GET /api/v1/comptes/{numeroCompte}/transactions`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "numeroCompte": "1234567890",
    "type": "DEPOT",
    "montant": 500,
    "dateTransaction": "2024-01-17T11:45:30",
    "statut": "RÉUSSIE"
  },
  {
    "id": 2,
    "numeroCompte": "1234567890",
    "type": "RETRAIT",
    "montant": 200,
    "dateTransaction": "2024-01-17T11:50:00",
    "statut": "RÉUSSIE"
  }
]
```

---

### 6. Consulter les transactions sur une période
Récupère les transactions d'un compte entre deux dates.

**Endpoint**: `GET /api/v1/comptes/{numeroCompte}/transactions/period`  
**Authentification**: ✅ Requise  
**Rôles autorisés**: AGENT, ADMIN

**Path Parameters**:
- `numeroCompte` (string): Numéro du compte

**Query Parameters**:
- `startDate` (ISO 8601, required): Date de début
- `endDate` (ISO 8601, required): Date de fin

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Exemple**:
```
GET /api/v1/comptes/1234567890/transactions/period?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "numeroCompte": "1234567890",
    "type": "DEPOT",
    "montant": 500,
    "dateTransaction": "2024-01-17T11:45:30",
    "statut": "RÉUSSIE"
  }
]
```

---

## Codes d'Erreur

| Code | Signification | Cause |
|------|---------------|-------|
| 200 | OK | La requête a réussi |
| 201 | Created | La ressource a été créée |
| 204 | No Content | La requête a réussi, pas de contenu |
| 400 | Bad Request | Données invalides, solde insuffisant |
| 401 | Unauthorized | Token manquant, invalide ou expiré |
| 403 | Forbidden | Accès refusé (droits insuffisants) |
| 404 | Not Found | Ressource non trouvée |
| 500 | Internal Server Error | Erreur serveur |

---

## Exemples complets avec cURL

### 1. Login et stockage du token
```bash
TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"agent","password":"agent123"}' \
  | jq -r '.accessToken')

echo "Token: $TOKEN"
```

### 2. Effectuer un dépôt
```bash
curl -X POST "http://localhost:8081/api/v1/comptes/1234567890/depot?montant=500" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Consulter le solde
```bash
curl -X GET "http://localhost:8081/api/v1/comptes/1234567890/solde" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Logout
```bash
curl -X POST http://localhost:8081/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

**Dernière mise à jour**: 17 janvier 2026

