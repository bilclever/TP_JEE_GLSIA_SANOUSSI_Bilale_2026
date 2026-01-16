import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login.component';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { ClientListComponent } from './shared/components/client-list.component';
import { ComptesListComponent } from './modules/comptes/comptes-list.component';
import { OperationsComponent } from './modules/operations/operations.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/components/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { title: 'Tableau de bord', roles: ['ADMIN'] }
      },
      {
        path: 'clients',
        component: ClientListComponent,
        canActivate: [roleGuard],
        data: { title: 'Gestion des clients', roles: ['ADMIN'] }
      },
      {
        path: 'comptes',
        component: ComptesListComponent,
        canActivate: [roleGuard],
        data: { title: 'Gestion des comptes', roles: ['ADMIN'] }
      },
      {
        path: 'operations',
        component: OperationsComponent,
        data: { title: 'Opérations bancaires' }
      },
      {
        path: 'transactions',
        loadComponent: () => import('./modules/transactions/transactions-list.component').then(m => m.TransactionsListComponent),
        data: { title: 'Transactions' }
      },
      {
        path: 'parametres',
        loadComponent: () => import('./modules/parametres/parametres.component').then(m => m.ParametresComponent),
        canActivate: [roleGuard],
        data: { title: 'Paramètres', roles: ['ADMIN'] }
      },
      {
        path: 'profil',
        loadComponent: () => import('./modules/profil/profil.component').then(m => m.ProfilComponent),
        data: { title: 'Mon Profil' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
