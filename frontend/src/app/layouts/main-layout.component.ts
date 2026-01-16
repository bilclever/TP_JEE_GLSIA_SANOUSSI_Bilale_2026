// main-layout.component.ts
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav 
        #sidenav 
        [mode]="isMobile ? 'over' : 'side'" 
        [opened]="!isMobile" 
        class="sidenav"
        [fixedInViewport]="isMobile"
        [fixedTopGap]="isMobile ? 64 : 0">\n        <div class="sidenav-header">
          <mat-icon class="logo">account_balance</mat-icon>
          <h2>Banque Ega</h2>
        </div>

        <mat-nav-list>
          <a mat-list-item *ngIf="isAdmin" routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de bord</span>
          </a>

          <a mat-list-item *ngIf="isAdmin" routerLink="/clients" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clients</span>
          </a>

          <a mat-list-item *ngIf="isAdmin" routerLink="/comptes" routerLinkActive="active">
            <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
            <span matListItemTitle>Comptes</span>
          </a>

          <a mat-list-item routerLink="/transactions" routerLinkActive="active">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Transactions</span>
          </a>

          <a mat-list-item routerLink="/operations" routerLinkActive="active">
            <mat-icon matListItemIcon>swap_horiz</mat-icon>
            <span matListItemTitle>Opérations</span>
          </a>

          <mat-divider></mat-divider>

          <a mat-list-item *ngIf="isAdmin" routerLink="/parametres" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Paramètres</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle menu">
            <mat-icon>menu</mat-icon>
          </button>

          <h1 class="toolbar-title" >{{ currentPageTitle }}</h1>

          <span class="toolbar-spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="notificationMenu" aria-label="Notifications">
            <mat-icon [matBadge]="notificationCount" [matBadgeHidden]="notificationCount === 0" matBadgeColor="warn">notifications</mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="Menu utilisateur">
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- Menu notifications -->
    <mat-menu #notificationMenu="matMenu">
      <div class="notification-header">
        <h3>Notifications</h3>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item>
        <mat-icon>info</mat-icon>
        <span>Aucune nouvelle notification</span>
      </button>
    </mat-menu>

    <!-- Menu utilisateur -->
    <mat-menu #userMenu="matMenu">
      <div class="user-menu-header">
        <mat-icon>account_circle</mat-icon>
        <div>
          <div class="user-name">{{currentUser?.firstName || currentUser?.username}} {{currentUser?.lastName || ''}}</div>
          <div class="user-role">{{currentUser?.role || 'Utilisateur'}}</div>
        </div>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item routerLink="/profil">
        <mat-icon>person</mat-icon>
        <span>Mon profil</span>
      </button>
      <button mat-menu-item *ngIf="isAdmin" routerLink="/parametres">
        <mat-icon>settings</mat-icon>
        <span>Paramètres</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>exit_to_app</mat-icon>
        <span>Déconnexion</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .sidenav-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      padding: 0;
    }

    .sidenav {
      width: 260px;
      height: 100%;
      background: #2c3e50;
      color: white;
      overflow-y: auto;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 240px;
      }
    }

    .sidenav-header {
      padding: 24px 16px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .sidenav-header .logo {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .sidenav-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    mat-nav-list {
      padding-top: 16px;
    }

    mat-nav-list a {
      color: #ecf0f1;
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s;
      display: flex !important;
      align-items: center !important;
      gap: 16px !important;
      height: 48px !important;
      padding: 0 12px !important;
    }

    mat-nav-list a:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    mat-nav-list a.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    mat-nav-list mat-icon {
      color: inherit;
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      min-width: 24px !important;
      min-height: 24px !important;
      flex-shrink: 0 !important;
    }

    mat-list-item-title {
      display: block !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      flex: 1 !important;
    }

    .main-content {
      display: flex;
      display: -ms-flexbox;
      flex-direction: column;
      -ms-flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex-shrink: 0;
      padding: 0 12px;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 600px) {
      .toolbar {
        padding: 0 8px;
        height: 56px;
      }
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 960px) {
      .toolbar-title {
        font-size: 16px;
      }
    }

    .toolbar-spacer {
      flex: 1 1 auto;
      min-width: 16px;
    }

    .toolbar button {
      flex-shrink: 0;
    }

    .toolbar mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    @media (max-width: 600px) {
      .toolbar mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .content-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px;
      background: #f5f7fa;
    }

    @media (min-width: 769px) {
      .content-wrapper {
        padding: 24px;
      }
    }

    @media (max-width: 600px) {
      .content-wrapper {
        padding: 12px;
      }
    }

    .notification-header {
      padding: 16px;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .user-menu-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 100%;
      flex-wrap: wrap;
    }

    .user-menu-header mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      color: #667eea;
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      white-space: normal;
      word-break: break-word;
      min-width: 0;
    }

    .user-role {
      font-size: 12px;
      color: #666;
      white-space: normal;
      word-break: break-word;
      width: 100%;
    }

    mat-divider {
      margin: 8px 0;
    }

    ::ng-deep .mat-mdc-menu-panel {
      min-width: 300px !important;
      background-color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-menu-item {
      min-height: 48px !important;
      padding: 12px 16px !important;
      white-space: normal !important;
      color: #000000 !important;
      background-color: #ffffff !important;
    }

    ::ng-deep .mat-mdc-menu-item:hover {
      background-color: #f5f5f5 !important;
    }

    ::ng-deep .mat-mdc-menu-item mat-icon {
      margin-right: 16px !important;
      color: #000000 !important;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  currentUser: any = null;
  notificationCount = 0;
  isMobile = false;
  currentPageTitle = 'Banque Ega';

  private routeTitles: { [key: string]: string } = {
    '/dashboard': 'Tableau de bord',
    '/clients': 'Gestion des Clients',
    '/comptes': 'Gestion des Comptes',
    '/transactions': 'Historique des Transactions',
    '/operations': 'Opérations',
    '/parametres': 'Paramètres',
    '/profil': 'Mon Profil'
  };

  get isAdmin(): boolean {
    const role = (this.currentUser?.role || '').toString().toUpperCase();
    return role === 'ADMIN';
  }

  constructor(
    public authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });

    // Détection responsive
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.cdr.markForCheck();
      });

    // Mettre à jour le titre en fonction de la route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects || event.url);
      
      // Fermer la sidebar après navigation sur mobile
      if (this.isMobile && this.sidenav) {
        this.sidenav.close();
      }
    });

    // Définir le titre initial
    this.updatePageTitle(this.router.url);
  }

  private updatePageTitle(url: string): void {
    const path = url.split('?')[0];
    this.currentPageTitle = this.routeTitles[path] || 'Banque Ega';
    this.cdr.markForCheck();
  }

  logout(): void {
    this.authService.logout();
  }
}
