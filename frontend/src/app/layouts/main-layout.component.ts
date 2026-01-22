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
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
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
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav 
        #sidenav 
        mode="over"
        [(opened)]="sidenavOpened" 
        class="sidenav"
        [fixedInViewport]="true"
        [fixedTopGap]="64">
        <div class="sidenav-header">
          <mat-icon class="logo">account_balance</mat-icon>
          <h2>Banque Ega</h2>
        </div>

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

          <a mat-list-item *ngIf="isAdmin" routerLink="/parametres" routerLinkActive="active" (click)="closeMenuOnMobile()">
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

          <button mat-icon-button (click)="toggleTheme()" aria-label="Changer le thème">
            <mat-icon>{{ isLightTheme ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="notificationMenu" aria-label="Notifications">
            <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">notifications</mat-icon>
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
      background: #0f172a;
      color: #e2e8f0;
      overflow-y: auto;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
      border-right: 1px solid rgba(226, 232, 240, 0.1);
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
    }

    :host-context(body.light-theme) .sidenav {
      background: #ffffff;
      color: #0f172a;
      border-right: 1px solid rgba(15, 23, 42, 0.1);
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 240px;
      }
    }

    .sidenav-header {
      padding: 28px 20px;
      text-align: center;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      border-top-right-radius: 16px;
    }

    :host-context(body.light-theme) .sidenav-header {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
    }

    .sidenav-header .logo {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      color: #ffffff;
    }

    .sidenav-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    mat-nav-list {
      padding-top: 12px;
    }

    mat-nav-list a {
      color: #cbd5e1;
      margin: 2px 12px;
      border-radius: 8px;
      transition: all 0.25s ease;
      display: flex !important;
      align-items: center !important;
      gap: 16px !important;
      height: 48px !important;
      padding: 0 16px !important;
      border: 1px solid transparent;
      font-size: 14px;
      font-weight: 500;
    }

    :host-context(body.light-theme) mat-nav-list a {
      color: #475569;
    }

    mat-nav-list a:hover {
      background: rgba(226, 232, 240, 0.1);
      color: #e0f2fe;
      border-color: rgba(226, 232, 240, 0.15);
      transform: translateX(4px);
    }

    :host-context(body.light-theme) mat-nav-list a:hover {
      background: rgba(14, 165, 233, 0.08);
      color: #0284c7;
      border-color: rgba(14, 165, 233, 0.2);
    }

    mat-nav-list a.active {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      font-weight: 600;
      transform: translateX(4px);
    }

    :host-context(body.light-theme) mat-nav-list a.active {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: #ffffff;
      box-shadow: 0 3px 10px rgba(14, 165, 233, 0.25);
    }

    mat-nav-list mat-icon {
      color: inherit;
      font-size: 22px !important;
      width: 22px !important;
      height: 22px !important;
      min-width: 22px !important;
      min-height: 22px !important;
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
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(11, 17, 31, 0.94) 55%, rgba(17, 94, 89, 0.35) 100%);
      backdrop-filter: blur(8px);
    }

    :host-context(body.light-theme) .main-content {
      background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 40%, #bae6fd 100%);
      backdrop-filter: none;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(34, 211, 238, 0.12);
      flex-shrink: 0;
      padding: 0 12px;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 29, 52, 0.95) 60%, rgba(34, 211, 238, 0.16) 100%);
      color: #e2e8f0;
    }

    @media (max-width: 600px) {
      .toolbar {
        padding: 0 8px;
        height: 56px;
      }
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #e0f2fe;
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
      background: transparent;
      color: #e2e8f0;
    }

    :host-context(body.light-theme) .content-wrapper {
      color: #0f172a;
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

    /* Notifications Panel */
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
      color: #e2e8f0;
    }

    body.light-theme .notification-header {
      color: #0f172a;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #e2e8f0;
    }

    body.light-theme .notification-header h3 {
      color: #0f172a;
    }

    .notification-header button {
      color: #7dd3fc;
    }

    body.light-theme .notification-header button {
      color: #0284c7;
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
      transition: all 0.2s ease;
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
      content: '''';
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

    .notification-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: #e2e8f0;
    }

    body.light-theme .notification-title {
      color: #0f172a;
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

    body.light-theme .notification-time {
      color: #64748b;
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
      font-size: 18px;
      width: 18px;
      height: 18px;
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

    body.light-theme .notification-empty {
      color: #64748b;
    }

    .notification-empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
      margin-bottom: 8px;
    }

    .notification-empty p {
      margin: 0;
      font-size: 14px;
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

    .notification-footer button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }

    .user-menu-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 100%;
      flex-wrap: wrap;
      color: #e2e8f0;
    }

    body.light-theme .user-menu-header {
      color: #0f172a;
    }

    .user-menu-header mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      color: var(--primary);
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 700;
      color: #e2e8f0;
      white-space: normal;
      word-break: break-word;
      min-width: 0;
    }

    body.light-theme .user-name {
      color: #0f172a;
    }

    .user-role {
      font-size: 12px;
      color: #94a3b8;
      white-space: normal;
      word-break: break-word;
      width: 100%;
    }

    body.light-theme .user-role {
      color: #64748b;
    }

    mat-divider {
      margin: 8px 12px;
      border-color: rgba(226, 232, 240, 0.15);
    }

    :host-context(body.light-theme) mat-divider {
      border-color: rgba(15, 23, 42, 0.1);
    }

    /* User menu overlay background (dark) */
    ::ng-deep .user-menu .mat-mdc-menu-panel {
      background: rgba(15, 23, 42, 0.96) !important;
      border: 1px solid rgba(34, 211, 238, 0.2) !important;
      color: #e2e8f0 !important;
    }

    /* User menu overlay background (light) */
    body.light-theme ::ng-deep .user-menu .mat-mdc-menu-panel {
      background: rgba(255,255,255,0.98) !important;
      border: 1px solid rgba(2, 132, 199, 0.2) !important;
      color: #0f172a !important;
    }

    ::ng-deep .mat-mdc-menu-panel {
      min-width: 300px !important;
      background: rgba(15, 23, 42, 0.96) !important;
      border: 1px solid rgba(34, 211, 238, 0.2) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35) !important;
      backdrop-filter: blur(12px) !important;
      color: #e2e8f0 !important;
    }

    ::ng-deep .mat-mdc-menu-item {
      min-height: 48px !important;
      padding: 12px 16px !important;
      white-space: normal !important;
      color: #e2e8f0 !important;
      background: transparent !important;
      transition: background 0.2s ease, color 0.2s ease;
    }

    /* Ensure menu text inside MDC wrappers inherits the intended color */
    ::ng-deep .mat-mdc-menu-item .mdc-list-item__primary-text,
    ::ng-deep .mat-mdc-menu-item .mat-mdc-menu-item-text {
      color: #e2e8f0 !important;
    }

    ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(34, 211, 238, 0.12) !important;
      color: #e0f2fe !important;
    }

    ::ng-deep .mat-mdc-menu-item mat-icon {
      margin-right: 16px !important;
      color: inherit !important;
    }

    /* Light theme overrides for menus (placed after dark defaults to win cascade) */
    body.light-theme ::ng-deep .mat-mdc-menu-panel {
      background: rgba(255,255,255,0.98) !important;
      border: 1px solid rgba(2, 132, 199, 0.2) !important;
      box-shadow: 0 16px 30px rgba(0,0,0,0.12) !important;
      color: #0f172a !important;
    }

    body.light-theme ::ng-deep .mat-mdc-menu-item {
      color: #0f172a !important;
    }

    body.light-theme ::ng-deep .mat-mdc-menu-item .mdc-list-item__primary-text,
    body.light-theme ::ng-deep .mat-mdc-menu-item .mat-mdc-menu-item-text {
      color: #0f172a !important;
    }

    body.light-theme ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(2, 132, 199, 0.08) !important;
      color: #0c4a6e !important;
    }

    body.light-theme .user-menu-header {
      color: #0f172a;
    }

    body.light-theme .user-name {
      color: #0f172a;
    }

    body.light-theme .user-role {
      color: #475569;
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  currentUser: any = null;
  isMobile = false;
  sidenavOpened = true;
  currentPageTitle = 'Banque Ega';
  private destroy$ = new Subject<void>();
  isLightTheme = false;

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
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private toast: ToastService,
    private theme: ThemeService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });

    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavOpened = !result.matches;
        this.cdr.markForCheck();
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects || event.url);
      
      if (this.isMobile && this.sidenav) {
        this.sidenav.close();
      }
    });

    this.updatePageTitle(this.router.url);
    // Thème initial
    this.isLightTheme = this.theme.current === 'light';
    this.theme.isLight$.subscribe(mode => {
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
    this.cdr.markForCheck();
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
