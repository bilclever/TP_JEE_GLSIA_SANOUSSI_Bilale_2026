// main-layout.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from '../core/services/toast.service';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
  link?: string;
}

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
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        #sidenav
        class="sidenav"
        [mode]="isMobile ? 'over' : 'side'"
        [(opened)]="sidenavOpened"
        [fixedInViewport]="isMobile"
      >
        <div class="sidenav-panel">
          <div class="sidenav-header">
            <div class="brand-icon">
              <mat-icon>account_balance</mat-icon>
            </div>
            <div class="brand-copy">
              <span class="brand-name">Banque Ega</span>
              <span class="brand-subtitle">Back-office bancaire</span>
            </div>
          </div>

          <div class="user-summary" *ngIf="currentUser">
            <div class="user-avatar">{{ getInitials() }}</div>
            <div class="user-meta">
              <strong>{{ currentUser?.firstName || currentUser?.username }} {{ currentUser?.lastName || '' }}</strong>
              <span>{{ currentUser?.role || 'Utilisateur' }}</span>
            </div>
          </div>

          <div class="nav-block">
            <span class="nav-label">Navigation</span>
            <mat-nav-list>
              <a mat-list-item *ngIf="isAdmin" routerLink="/dashboard" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Tableau de bord</span>
              </a>

              <a mat-list-item *ngIf="isAdmin" routerLink="/clients" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Clients</span>
              </a>

              <a mat-list-item *ngIf="isAdmin" routerLink="/comptes" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
                <span matListItemTitle>Comptes</span>
              </a>

              <a mat-list-item routerLink="/transactions" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>receipt_long</mat-icon>
                <span matListItemTitle>Transactions</span>
              </a>

              <a mat-list-item routerLink="/operations" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>swap_horiz</mat-icon>
                <span matListItemTitle>Opérations</span>
              </a>

              <mat-divider></mat-divider>

              <a mat-list-item routerLink="/profil" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>Profil</span>
              </a>

              <a mat-list-item *ngIf="isAdmin" routerLink="/parametres" routerLinkActive="active" (click)="closeMenuOnMobile()">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>Paramètres</span>
              </a>
            </mat-nav-list>
          </div>

          <div class="sidenav-footer">
            <button mat-stroked-button class="footer-button" routerLink="/profil" (click)="closeMenuOnMobile()">
              <mat-icon>badge</mat-icon>
              Mon profil
            </button>
            <button mat-button class="footer-button footer-button-ghost" (click)="logout()">
              <mat-icon>logout</mat-icon>
              Déconnexion
            </button>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar class="toolbar">
          <div class="toolbar-left">
            <button mat-icon-button class="action-button" (click)="sidenav.toggle()" aria-label="Ouvrir ou fermer le menu">
              <mat-icon>menu</mat-icon>
            </button>

            <div class="toolbar-copy">
              <span class="toolbar-kicker">Banque Ega</span>
              <h1 class="toolbar-title">{{ currentPageTitle }}</h1>
              <p class="toolbar-subtitle">{{ currentPageDescription }}</p>
            </div>
          </div>

          <div class="toolbar-right">
            <div class="toolbar-date hide-mobile">{{ todayLabel }}</div>

            <button
              mat-icon-button
              class="action-button"
              (click)="toggleTheme()"
              [matTooltip]="isLightTheme ? 'Activer le thème sombre' : 'Activer le thème clair'"
              aria-label="Changer le thème"
            >
              <mat-icon>{{ isLightTheme ? 'dark_mode' : 'light_mode' }}</mat-icon>
            </button>

            <button
              mat-icon-button
              class="action-button"
              [matMenuTriggerFor]="notificationMenu"
              aria-label="Notifications"
            >
              <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">
                notifications
              </mat-icon>
            </button>

            <button
              mat-stroked-button
              class="user-trigger"
              [matMenuTriggerFor]="userMenu"
              aria-label="Menu utilisateur"
            >
              <span class="user-trigger-name hide-mobile">
                {{ currentUser?.firstName || currentUser?.username || 'Mon compte' }}
              </span>
              <span class="user-trigger-avatar">{{ getInitials() }}</span>
            </button>
          </div>
        </mat-toolbar>

        <div class="content-wrapper">
          <div class="content-shell">
            <router-outlet></router-outlet>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- Menu notifications -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-panel" (click)="$event.stopPropagation()">
        <div class="notification-header">
          <h3>Notifications</h3>
          <button mat-icon-button *ngIf="unreadCount > 0" (click)="markAllAsRead()" matTooltip="Tout marquer comme lu">
            <mat-icon>done_all</mat-icon>
          </button>
        </div>
        <mat-divider></mat-divider>
        
        <div class="notification-list" *ngIf="notifications.length > 0">
          <div *ngFor="let notification of notifications" 
               class="notification-item" 
               [class.unread]="!notification.read"
               [class.notification-info]="notification.type === 'info'"
               [class.notification-success]="notification.type === 'success'"
               [class.notification-warning]="notification.type === 'warning'"
               [class.notification-error]="notification.type === 'error'"
               (click)="markAsRead(notification)">
            <div class="notification-icon">
              <mat-icon>{{ notification.icon }}</mat-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
            </div>
            <button mat-icon-button class="notification-delete" (click)="deleteNotification(notification, $event)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
        
        <div class="notification-empty" *ngIf="notifications.length === 0">
          <mat-icon>notifications_off</mat-icon>
          <p>Aucune notification</p>
        </div>
        
        <mat-divider *ngIf="notifications.length > 0"></mat-divider>
        <div class="notification-footer" *ngIf="notifications.length > 0">
          <button mat-button (click)="clearAll()">
            <mat-icon>delete_sweep</mat-icon>
            Tout effacer
          </button>
        </div>
      </div>
    </mat-menu>

    <!-- Menu utilisateur -->
    <mat-menu #userMenu="matMenu" class="user-menu">
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
      inset: 0;
    }

    .shell-container {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 22%),
        linear-gradient(180deg, #020617 0%, #0f172a 100%);
    }

    .sidenav {
      width: 294px;
      border-right: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(2, 6, 23, 0.92);
      color: #e2e8f0;
    }

    :host-context(body.light-theme) .sidenav {
      background: rgba(255, 255, 255, 0.92);
      color: #0f172a;
      border-right-color: rgba(148, 163, 184, 0.2);
    }

    .sidenav-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px 16px 16px;
      background:
        linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.92) 100%);
      backdrop-filter: blur(20px);
    }

    :host-context(body.light-theme) .sidenav-panel {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 8px 8px 4px;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #14b8a6 100%);
      box-shadow: 0 14px 28px rgba(14, 165, 233, 0.22);
      flex-shrink: 0;
    }

    .brand-icon mat-icon {
      color: #f8fafc;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .brand-copy {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .brand-name {
      color: #f8fafc;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      color: #94a3b8;
      font-size: 12px;
    }

    :host-context(body.light-theme) .brand-name {
      color: #0f172a;
    }

    :host-context(body.light-theme) .brand-subtitle {
      color: #64748b;
    }

    .user-summary {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    :host-context(body.light-theme) .user-summary {
      background: rgba(14, 165, 233, 0.05);
      border-color: rgba(14, 165, 233, 0.12);
    }

    .user-avatar,
    .user-trigger-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.28), rgba(20, 184, 166, 0.28));
      color: #e0f2fe;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    :host-context(body.light-theme) .user-avatar,
    :host-context(body.light-theme) .user-trigger-avatar {
      color: #075985;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(20, 184, 166, 0.18));
    }

    .user-meta {
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .user-meta strong {
      color: #f8fafc;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-meta span {
      color: #94a3b8;
      font-size: 12px;
    }

    :host-context(body.light-theme) .user-meta strong {
      color: #0f172a;
    }

    :host-context(body.light-theme) .user-meta span {
      color: #64748b;
    }

    .nav-block {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 0;
      flex: 1;
    }

    .nav-label {
      padding: 0 10px;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    mat-nav-list {
      padding-top: 0;
    }

    mat-nav-list a {
      margin: 4px 0;
      border-radius: 16px;
      min-height: 52px !important;
      padding: 0 14px !important;
      color: #cbd5e1;
      border: 1px solid transparent;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }

    :host-context(body.light-theme) mat-nav-list a {
      color: #334155;
    }

    mat-nav-list a:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(148, 163, 184, 0.14);
      transform: translateX(2px);
    }

    :host-context(body.light-theme) mat-nav-list a:hover {
      background: rgba(14, 165, 233, 0.08);
      border-color: rgba(14, 165, 233, 0.14);
    }

    mat-nav-list a.active {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(20, 184, 166, 0.14));
      color: #f8fafc;
      border-color: rgba(56, 189, 248, 0.2);
      box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.06);
    }

    :host-context(body.light-theme) mat-nav-list a.active {
      color: #0f172a;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.14), rgba(14, 165, 233, 0.08));
      border-color: rgba(14, 165, 233, 0.16);
    }

    mat-nav-list mat-icon {
      color: inherit;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      min-width: 20px !important;
      min-height: 20px !important;
    }

    mat-list-item-title {
      font-size: 14px !important;
      font-weight: 600;
    }

    mat-divider {
      margin: 10px 8px;
      border-color: rgba(148, 163, 184, 0.14);
    }

    .sidenav-footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid rgba(148, 163, 184, 0.12);
    }

    .footer-button {
      justify-content: flex-start;
      min-height: 44px;
      border-radius: 14px !important;
    }

    .footer-button-ghost {
      color: #cbd5e1 !important;
    }

    :host-context(body.light-theme) .footer-button-ghost {
      color: #334155 !important;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background:
        radial-gradient(circle at top, rgba(34, 211, 238, 0.08), transparent 24%),
        linear-gradient(180deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.92) 100%);
    }

    :host-context(body.light-theme) .main-content {
      background:
        radial-gradient(circle at top, rgba(14, 165, 233, 0.08), transparent 20%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      min-height: 76px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      background: rgba(2, 6, 23, 0.7);
      backdrop-filter: blur(18px);
      color: #e2e8f0;
    }

    :host-context(body.light-theme) .toolbar {
      background: rgba(255, 255, 255, 0.72);
      color: #0f172a;
      border-bottom-color: rgba(148, 163, 184, 0.18);
    }

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .toolbar-left {
      flex: 1;
    }

    .toolbar-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toolbar-kicker {
      color: #67e8f9;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .toolbar-title {
      margin: 0;
      color: #f8fafc;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.03em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toolbar-subtitle {
      margin: 0;
      color: #94a3b8;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host-context(body.light-theme) .toolbar-kicker {
      color: #0284c7;
    }

    :host-context(body.light-theme) .toolbar-title {
      color: #0f172a;
    }

    :host-context(body.light-theme) .toolbar-subtitle {
      color: #64748b;
    }

    .toolbar-date {
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(148, 163, 184, 0.12);
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
      white-space: nowrap;
    }

    :host-context(body.light-theme) .toolbar-date {
      background: rgba(14, 165, 233, 0.05);
      color: #475569;
      border-color: rgba(14, 165, 233, 0.12);
    }

    .action-button {
      color: inherit;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .user-trigger {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 0 8px 0 14px;
      border-radius: 999px !important;
      color: inherit !important;
      border-color: rgba(148, 163, 184, 0.16) !important;
      background: rgba(255, 255, 255, 0.04) !important;
    }

    .user-trigger-name {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
    }

    .content-wrapper {
      flex: 1;
      overflow: auto;
      padding: 24px;
    }

    .content-shell {
      width: min(1400px, 100%);
      margin: 0 auto;
    }

    ::ng-deep .notification-menu .mat-mdc-menu-panel {
      max-width: 420px !important;
      width: 420px !important;
      max-height: 600px !important;
    }

    @media (max-width: 480px) {
      ::ng-deep .notification-menu .mat-mdc-menu-panel {
        max-width: 95vw !important;
        width: 95vw !important;
      }
    }

    .notification-panel {
      background: rgba(15, 23, 42, 0.98);
      color: #e2e8f0;
    }

    body.light-theme .notification-panel {
      background: rgba(255, 255, 255, 0.98);
      color: #0f172a;
    }

    .notification-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: inherit;
    }

    .notification-header h3,
    .notification-title {
      color: inherit;
    }

    .notification-list {
      max-height: 450px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      cursor: pointer;
      transition: background 0.2s ease;
      border-left: 3px solid transparent;
      position: relative;
    }

    .notification-item:hover {
      background: rgba(34, 211, 238, 0.08);
    }

    body.light-theme .notification-item:hover {
      background: rgba(2, 132, 199, 0.08);
    }

    .notification-item.unread {
      background: rgba(34, 211, 238, 0.05);
    }

    body.light-theme .notification-item.unread {
      background: rgba(59, 130, 246, 0.06);
    }

    .notification-item.unread::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #22d3ee;
    }

    .notification-item.notification-info .notification-icon {
      color: #3b82f6;
    }

    .notification-item.notification-success .notification-icon {
      color: #10b981;
    }

    .notification-item.notification-warning .notification-icon {
      color: #f59e0b;
    }

    .notification-item.notification-error .notification-icon {
      color: #ef4444;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(34, 211, 238, 0.1);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-message {
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 4px;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    body.light-theme .notification-message {
      color: #475569;
    }

    .notification-time {
      font-size: 11px;
      color: #94a3b8;
    }

    .notification-delete {
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .notification-item:hover .notification-delete {
      opacity: 1;
    }

    .notification-delete mat-icon {
      color: #94a3b8;
    }

    .notification-delete:hover mat-icon {
      color: #ef4444;
    }

    .notification-empty {
      padding: 40px 20px;
      text-align: center;
      color: #94a3b8;
    }

    .notification-footer {
      padding: 12px 20px;
      text-align: center;
    }

    .notification-footer button {
      color: #7dd3fc;
      font-size: 13px;
    }

    body.light-theme .notification-footer button {
      color: #0284c7;
    }

    .user-menu-header {
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      color: inherit;
    }

    .user-menu-header mat-icon {
      font-size: 38px;
      width: 38px;
      height: 38px;
      color: var(--primary);
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 700;
      color: inherit;
      word-break: break-word;
    }

    .user-role {
      font-size: 12px;
      color: #94a3b8;
      word-break: break-word;
    }

    ::ng-deep .user-menu .mat-mdc-menu-panel,
    ::ng-deep .mat-mdc-menu-panel {
      min-width: 300px !important;
      background: rgba(15, 23, 42, 0.96) !important;
      border: 1px solid rgba(34, 211, 238, 0.16) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35) !important;
      backdrop-filter: blur(14px) !important;
      color: #e2e8f0 !important;
      border-radius: 18px !important;
    }

    body.light-theme ::ng-deep .user-menu .mat-mdc-menu-panel,
    body.light-theme ::ng-deep .mat-mdc-menu-panel {
      background: rgba(255, 255, 255, 0.98) !important;
      border-color: rgba(14, 165, 233, 0.14) !important;
      color: #0f172a !important;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12) !important;
    }

    ::ng-deep .mat-mdc-menu-item {
      min-height: 48px !important;
      padding: 12px 16px !important;
      color: inherit !important;
    }

    ::ng-deep .mat-mdc-menu-item .mdc-list-item__primary-text,
    ::ng-deep .mat-mdc-menu-item .mat-mdc-menu-item-text {
      color: inherit !important;
    }

    ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(34, 211, 238, 0.12) !important;
    }

    body.light-theme ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(2, 132, 199, 0.08) !important;
    }

    @media (max-width: 960px) {
      .toolbar {
        padding: 12px 14px;
      }

      .toolbar-date {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 280px;
      }

      .content-wrapper {
        padding: 16px;
      }

      .toolbar-title {
        font-size: 18px;
      }
    }

    @media (max-width: 600px) {
      .toolbar {
        min-height: 68px;
        align-items: flex-start;
      }

      .toolbar-left {
        align-items: flex-start;
      }

      .toolbar-subtitle {
        display: none;
      }

      .user-trigger {
        min-width: 44px;
        padding: 0 4px !important;
      }

      .content-wrapper {
        padding: 12px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  currentUser: any = null;
  isMobile = false;
  sidenavOpened = true;
  currentPageTitle = 'Banque Ega';
  currentPageDescription = 'Suivi global de vos opérations bancaires';
  private destroy$ = new Subject<void>();
  isLightTheme = false;
  todayLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  notifications: Notification[] = [
    {
      id: 1,
      type: 'success',
      title: 'Dépôt effectué',
      message: 'Un dépôt de 50,000 FCFA a été effectué sur le compte 123456789',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      icon: 'account_balance_wallet'
    },
    {
      id: 2,
      type: 'info',
      title: 'Nouveau client',
      message: 'Jean Dupont a été ajouté avec succès',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      icon: 'person_add'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Solde faible',
      message: 'Le compte 987654321 a un solde inférieur à 10,000 FCFA',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      icon: 'warning'
    },
    {
      id: 4,
      type: 'error',
      title: 'Transaction échouée',
      message: 'Le virement de 100,000 FCFA a échoué - solde insuffisant',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      icon: 'error'
    }
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private routeTitles: { [key: string]: string } = {
    '/dashboard': 'Tableau de bord',
    '/clients': 'Clients',
    '/comptes': 'Comptes',
    '/transactions': 'Transactions',
    '/operations': 'Opérations',
    '/parametres': 'Paramètres',
    '/profil': 'Mon Profil'
  };

  private routeDescriptions: { [key: string]: string } = {
    '/dashboard': 'Vue d’ensemble des indicateurs et de l’activité récente',
    '/clients': 'Gestion du portefeuille client et suivi des profils',
    '/comptes': 'Pilotage des comptes bancaires et de leurs statuts',
    '/transactions': 'Lecture et contrôle de l’historique transactionnel',
    '/operations': 'Exécution des dépôts, retraits et virements',
    '/parametres': 'Réglages de la plateforme et préférences système',
    '/profil': 'Informations personnelles et accès utilisateur'
  };

  get isAdmin(): boolean {
    const role = (this.currentUser?.role || '').toString().toUpperCase();
    return role === 'ADMIN';
  }

  constructor(
    public authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private theme: ThemeService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        this.currentUser = user;
        this.cdr.markForCheck();
      });

    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavOpened = !result.matches;
        this.cdr.markForCheck();
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects || event.url);
      
      if (this.isMobile && this.sidenav) {
        this.sidenav.close();
      }
    });

    this.updatePageTitle(this.router.url);
    // Thème initial
    this.isLightTheme = this.theme.current === 'light';
    this.theme.isLight$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isLightTheme = this.theme.current === 'light';
        this.cdr.markForCheck();
      });
    // Abonnement aux toasts pour créer des notifications correspondantes
    this.toast.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        const icon = evt.type === 'success' ? 'check_circle'
                  : evt.type === 'warning' ? 'warning'
                  : evt.type === 'error'   ? 'error'
                  : 'info';
        this.addNotification({
          id: 0, // sera corrigé dans addNotification
          type: evt.type,
          title: evt.title,
          message: evt.message,
          timestamp: evt.timestamp,
          read: false,
          icon
        });
      });
  }
  toggleTheme(): void {
    this.theme.toggle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle(url: string): void {
    const path = url.split('?')[0];
    this.currentPageTitle = this.routeTitles[path] || 'Banque Ega';
    this.currentPageDescription = this.routeDescriptions[path] || 'Suivi global de vos opérations bancaires';
    this.cdr.markForCheck();
  }

  getInitials(): string {
    const source = `${this.currentUser?.firstName || ''} ${this.currentUser?.lastName || ''}`.trim()
      || this.currentUser?.username
      || 'BE';

    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0])
      .join('')
      .toUpperCase();
  }

  closeMenuOnMobile(): void {
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
    }
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
    this.cdr.markForCheck();
    this.toast.info('Notification marquée comme lue', 'Notifications');
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.cdr.markForCheck();
    this.toast.success('Toutes les notifications ont été marquées comme lues', 'Notifications');
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.cdr.markForCheck();
    }
  }

  clearAll(): void {
    this.notifications = [];
    this.cdr.markForCheck();
  }

  // Permet d'ajouter une notification (ex: temps réel) et d'afficher un toast
  addNotification(notification: Notification): void {
    // Générer un id si manquant/0
    const nextId = (this.notifications.length ? Math.max(...this.notifications.map(n => n.id)) : 0) + 1;
    const finalIcon = notification.icon || (notification.type === 'success' ? 'check_circle' : notification.type);
    const withDefaults: Notification = {
      ...notification,
      id: notification.id && notification.id > 0 ? notification.id : nextId,
      icon: finalIcon,
      read: notification.read ?? false,
      timestamp: notification.timestamp || new Date()
    };
    // Insérer en tête de liste
    this.notifications.unshift(withDefaults);
    this.cdr.markForCheck();
    this.showNotificationToast(notification);
  }

  private showNotificationToast(notification: Notification): void {
    const title = notification.title || 'Notification';
    const message = notification.message || '';
    switch (notification.type) {
      case 'success':
        this.toast.success(message, title);
        break;
      case 'warning':
        this.toast.warning(message, title);
        break;
      case 'error':
        this.toast.error(message, title);
        break;
      default:
        this.toast.info(message, title);
        break;
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.toast.success('Déconnexion réussie', 'À bientôt');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.toast.info('Déconnexion effectuée', 'Session terminée');
        this.router.navigate(['/login']);
      }
    });
  }
}
