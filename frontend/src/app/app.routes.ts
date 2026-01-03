import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login.component';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { ClientListComponent } from './shared/components/client-list.component';
import { ComptesListComponent } from './modules/comptes/comptes-list.component';
import { OperationsComponent } from './modules/operations/operations.component';
import { authGuard } from './core/guards/auth.guard';

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
        data: { title: 'Tableau de bord' }
      },
      {
        path: 'clients',
        component: ClientListComponent,
        data: { title: 'Gestion des clients' }
      },
      {
        path: 'comptes',
        component: ComptesListComponent,
        data: { title: 'Gestion des comptes' }
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
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
