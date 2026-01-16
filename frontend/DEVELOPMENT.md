# Banque Ega - Frontend Angular

## 🏦 Description du Projet
Application de gestion bancaire pour la **Banque Ega**, permettant la gestion des clients et de leurs comptes bancaires (comptes courants et comptes épargne).

### Contexte métier
La société bancaire « Ega » souhaite mettre en place un système de gestion de ses clients et des comptes. 

**Règles métier :**
- Un client peut avoir plusieurs comptes
- Deux types de comptes : **Compte Épargne** et **Compte Courant**
- Le numéro de compte est unique et formaté selon les standards (IBAN)
- Le solde initial d'un compte est nul lors de sa création
- Les clients peuvent effectuer des opérations : dépôt, retrait, virement

## 📋 Informations Client
- Nom, Prénom
- Date de naissance
- Sexe
- Adresse
- Numéro de téléphone
- Courriel
- Nationalité

## 📋 Informations Compte
- Numéro de compte (IBAN unique)
- Type de compte (COURANT / EPARGNE)
- Date de création
- Solde
- Propriétaire (Client)

## 🚀 Technologies utilisées
- **Angular 21** - Framework principal
- **Angular Material** - Composants UI
- **Chart.js / ng2-charts** - Graphiques et visualisations
- **ngx-toastr** - Notifications
- **ngx-cookie-service** - Gestion des cookies
- **XLSX** - Export Excel
- **RxJS** - Programmation réactive

## 📡 API Backend - Endpoints disponibles

### Clients (`/api/v1/clients`)
- `GET /api/v1/clients` - Obtenir tous les clients
- `GET /api/v1/clients/{id}` - Obtenir un client par ID
- `GET /api/v1/clients/code/{clientCode}` - Obtenir un client par code
- `GET /api/v1/clients/{id}/with-comptes` - Obtenir un client avec ses comptes
- `GET /api/v1/clients/{id}/comptes` - Obtenir les comptes d'un client
- `GET /api/v1/clients/search` - Rechercher des clients
- `POST /api/v1/clients` - Créer un nouveau client
- `PUT /api/v1/clients/{id}` - Mettre à jour un client
- `DELETE /api/v1/clients/{id}` - Supprimer un client (désactiver)
- `PATCH /api/v1/clients/{id}/activate` - Activer un client
- `PATCH /api/v1/clients/{id}/deactivate` - Désactiver un client

### Comptes (`/api/v1/comptes`)
- `GET /api/v1/comptes/{numeroCompte}` - Obtenir un compte par son numéro
- `GET /api/v1/comptes/client/{clientId}` - Obtenir les comptes d'un client
- `GET /api/v1/comptes/type/{type}` - Obtenir les comptes par type (COURANT/EPARGNE)
- `GET /api/v1/comptes/{numeroCompte}/solde` - Obtenir le solde d'un compte
- `GET /api/v1/comptes/{numeroCompte}/transactions` - Obtenir les transactions d'un compte
- `GET /api/v1/comptes/{numeroCompte}/transactions/period` - Obtenir les transactions sur une période
- `POST /api/v1/comptes` - Créer un nouveau compte
- `POST /api/v1/comptes/{numeroCompte}/depot` - Effectuer un dépôt
- `POST /api/v1/comptes/{numeroCompte}/retrait` - Effectuer un retrait
- `POST /api/v1/comptes/virement` - Effectuer un virement
- `DELETE /api/v1/comptes/{numeroCompte}` - Supprimer un compte
- `PATCH /api/v1/comptes/{numeroCompte}/activate` - Activer un compte
- `PATCH /api/v1/comptes/{numeroCompte}/deactivate` - Désactiver un compte

## ✅ Fonctionnalités implémentées

### Dashboard
- Statistiques en temps réel (clients actifs, comptes, transactions, actifs totaux)
- Graphiques de répartition des comptes (Pie chart)
- Graphique d'activité mensuelle (Bar chart)
- Liste des transactions récentes
- Actions rapides (nouveau client, nouveau compte, dépôt, virement)

### Gestion des Clients
- Liste paginée avec recherche
- Création/Édition de clients
- Activation/Désactivation de clients
- Suppression de clients
- Export Excel/CSV
- Visualisation des détails et comptes

### Services créés
1. **AuthService** - Authentification et gestion des utilisateurs
2. **ClientService** - Gestion des clients (aligné avec API v1)
3. **CompteService** - Gestion des comptes bancaires (aligné avec API v1)
4. **TransactionService** - Gestion des transactions
5. **ExportService** - Export de données (Excel, CSV, JSON, Print)

### Composants créés
1. **DashboardComponent** - Tableau de bord principal
2. **ClientListComponent** - Liste des clients avec filtres
3. **ClientFormComponent** - Formulaire création/édition client
4. **ConfirmDialogComponent** - Dialogue de confirmation réutilisable

### Pipes personnalisés
- **PhonePipe** - Formatage des numéros de téléphone (format international/national)

## 🛠️ Installation et Configuration

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start

# Ouvrir dans le navigateur
http://localhost:4200
```

## ⚙️ Configuration Backend

Modifiez `src/environments/environment.ts` pour configurer l'URL de votre API backend :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Banque Ega',
  version: '1.0.0',
  domain: 'localhost'
};
```

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts           → API: /api/v1/auth
│   │   │   ├── client.service.ts         → API: /api/v1/clients
│   │   │   ├── compte.service.ts         → API: /api/v1/comptes
│   │   │   ├── transaction.service.ts    → API: /api/v1/transactions
│   │   │   └── export.service.ts
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── dashboard.component.*
│   │   │   ├── client-list.component.*
│   │   │   ├── client-form/
│   │   │   └── confirm-dialog/
│   │   └── pipes/
│   │       └── phone.pipe.ts
│   ├── layouts/
│   ├── modules/
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.ts
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## 🎨 Routes disponibles

```typescript
/                    → Redirige vers /dashboard
/dashboard           → Tableau de bord principal
/clients             → Liste et gestion des clients
```

## 📝 Scripts disponibles

```bash
npm start          # Démarre le serveur de dev (port 4200)
npm run build      # Compile pour la production
npm test           # Lance les tests
npm run watch      # Mode watch pour le développement
```

## 🔄 Prochaines étapes recommandées

1. ✅ Créer la page de gestion des comptes
2. ✅ Créer la page des transactions
3. ✅ Implémenter les opérations bancaires (dépôt, retrait, virement)
4. ✅ Ajouter les guards d'authentification
5. ✅ Créer les interceptors HTTP (gestion token, erreurs)
6. ✅ Ajouter la validation des formulaires
7. ✅ Implémenter le format IBAN pour les numéros de compte
8. ✅ Ajouter les rapports et statistiques avancés
9. ✅ Tests unitaires et e2e

## 🔒 Sécurité

- Authentification par JWT tokens
- Cookies sécurisés (HttpOnly)
- Guards pour protéger les routes
- Interceptors pour gérer les tokens automatiquement

## 📊 Dépendances principales

```json
{
  "@angular/core": "^21.0.0",
  "@angular/material": "^21.0.0",
  "@angular/animations": "^21.0.0",
  "chart.js": "latest",
  "ng2-charts": "latest",
  "ngx-cookie-service": "latest",
  "ngx-toastr": "latest",
  "xlsx": "latest"
}
```

## ✅ Résolution des problèmes

Toutes les erreurs TypeScript ont été résolues :
- ✅ Modules manquants installés
- ✅ Fichiers environment créés
- ✅ Services alignés avec l'API backend v1
- ✅ Composants standalone avec imports corrects
- ✅ Types explicites (pas de `any`)
- ✅ Chemins d'import corrigés
- ✅ Branding "Banque Ega" appliqué

## 📞 Support

Pour toute question ou problème :
- Documentation Angular : https://angular.io/docs
- Documentation Angular Material : https://material.angular.io
