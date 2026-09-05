// login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-shell">
      <div class="login-grid">
        <section class="login-aside">
          

          <div class="aside-copy">
            <span class="eyebrow">Banque Ega</span>
            <h1>Une interface de banque plus nette, plus fiable, plus pro.</h1>
            <p>
              Connectez-vous à votre espace sécurisé pour piloter les comptes, les clients
              et les opérations depuis une interface claire et orientée métier.
            </p>
          </div>

          <div class="trust-panel">
            <div class="trust-item">
              <strong>Suivi centralisé</strong>
              <span>Clients, comptes et transactions réunis au même endroit.</span>
            </div>
            <div class="trust-item">
              <strong>Contrôle sécurisé</strong>
              <span>Accès authentifié et navigation adaptée au rôle utilisateur.</span>
            </div>
            <div class="trust-item">
              <strong>Exécution rapide</strong>
              <span>Déposer, retirer et virer sans friction inutile dans le parcours.</span>
            </div>
          </div>
        </section>

        <mat-card class="login-card">
          <div class="card-header">
            <span class="card-badge">Espace sécurisé</span>
            <h2>Connexion</h2>
            <p>Renseignez vos identifiants pour accéder au back-office.</p>
          </div>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="username" placeholder="Votre identifiant" required>
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Le nom d'utilisateur est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <input
                  matInput
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Votre mot de passe"
                  required
                >
                <mat-icon matPrefix>lock</mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="hidePassword ? 'Afficher le mot de passe' : 'Masquer le mot de passe'"
                >
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Le mot de passe est requis
                </mat-error>
              </mat-form-field>

              <div class="form-options">
                <mat-checkbox formControlName="rememberMe">
                  Se souvenir de moi
                </mat-checkbox>
                <button type="button" class="forgot-password" (click)="showPasswordHelp()">
                  Besoin d'aide ?
                </button>
              </div>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="full-width login-button"
                [disabled]="!loginForm.valid || isLoading"
              >
                <mat-spinner diameter="18" strokeWidth="3" *ngIf="isLoading"></mat-spinner>
                <span>{{ isLoading ? 'Connexion en cours...' : 'Accéder au tableau de bord' }}</span>
              </button>
            </form>
          </mat-card-content>

        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background:
        radial-gradient(circle at top left, rgba(34, 211, 238, 0.16), transparent 32%),
        radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.14), transparent 28%),
        linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%);
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .login-shell::before,
    .login-shell::after {
      content: '';
      position: absolute;
      border-radius: 999px;
      filter: blur(80px);
      opacity: 0.5;
      pointer-events: none;
    }

    .login-shell::before {
      width: 320px;
      height: 320px;
      top: -80px;
      left: -60px;
      background: rgba(14, 165, 233, 0.22);
    }

    .login-shell::after {
      width: 360px;
      height: 360px;
      right: -120px;
      bottom: -120px;
      background: rgba(20, 184, 166, 0.18);
    }

    .login-grid {
      position: relative;
      z-index: 1;
      width: min(1120px, 100%);
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(380px, 460px);
      gap: 28px;
      align-items: stretch;
    }

    .login-aside,
    .login-card {
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(18px);
      box-shadow: 0 24px 70px rgba(2, 6, 23, 0.45);
    }

    .login-aside {
      border-radius: 28px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 60px;
      color: #e2e8f0;
    }

    .brand-mark {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 45%, #14b8a6 100%);
      box-shadow: 0 18px 40px rgba(14, 165, 233, 0.28);
    }

    .brand-mark mat-icon {
      width: 34px;
      height: 34px;
      font-size: 34px;
      color: #f8fafc;
    }

    .aside-copy {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-width: 560px;
      margin-top: -9px;
    }

    .eyebrow {
      display: inline-flex;
      align-self: flex-start;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(34, 211, 238, 0.12);
      border: 1px solid rgba(34, 211, 238, 0.18);
      color: #67e8f9;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .aside-copy h1 {
      margin: 0;
      color: #f8fafc;
      font-size: clamp(30px, 4vw, 46px);
      line-height: 1.08;
      letter-spacing: -0.03em;
    }

    .aside-copy p {
      margin: 0;
      max-width: 560px;
      color: #cbd5e1;
      font-size: 16px;
      line-height: 1.7;
    }

    .trust-panel {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: -30px;
    }

    .trust-item {
      padding: 18px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(148, 163, 184, 0.12);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .trust-item strong {
      color: #f8fafc;
      font-size: 14px;
      font-weight: 700;
    }

    .trust-item span {
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.6;
    }

    .login-card {
      border-radius: 28px;
      padding: 34px 32px;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 24px;
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .card-badge {
      display: inline-flex;
      align-self: flex-start;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(15, 118, 110, 0.18);
      border: 1px solid rgba(45, 212, 191, 0.18);
      color: #99f6e4;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .card-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .card-header p {
      margin: 0;
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
    }

    mat-card-content {
      padding: 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.96);
      border-radius: 16px;
      box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    ::ng-deep .mat-mdc-form-field:focus-within .mat-mdc-text-field-wrapper {
      transform: translateY(-1px);
      box-shadow:
        inset 0 0 0 1px rgba(14, 165, 233, 0.26),
        0 10px 24px rgba(14, 165, 233, 0.12);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element,
    :host-context(body.light-theme) ::ng-deep .mat-mdc-form-field .mat-mdc-input-element,
    :host-context(body:not(.light-theme)) ::ng-deep .mat-mdc-form-field .mat-mdc-input-element {
      color: #0f172a !important;
      caret-color: #0f172a !important;
      -webkit-text-fill-color: #0f172a !important;
      font-size: 14px !important;
    }

    :host ::ng-deep input.mat-mdc-input-element:-webkit-autofill {
      -webkit-text-fill-color: #0f172a !important;
      caret-color: #0f172a !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-label {
      color: #64748b !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label,
    ::ng-deep .mat-mdc-form-field .mdc-floating-label--float-above {
      color: #0284c7 !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-icon {
      color: #64748b !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-icon {
      color: #0284c7 !important;
    }

    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing {
      border-color: rgba(148, 163, 184, 0.42) !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: rgba(2, 132, 199, 0.64) !important;
      border-width: 2px !important;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: -2px;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-label {
      color: #cbd5e1 !important;
      font-size: 13px !important;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-checkbox__background {
      border-color: #38bdf8 !important;
    }

    ::ng-deep .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background {
      background-color: #38bdf8 !important;
      border-color: #38bdf8 !important;
    }

    .forgot-password {
      border: none;
      background: transparent;
      color: #7dd3fc;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .forgot-password:hover {
      color: #bae6fd;
    }

    .login-button {
      min-height: 52px;
      margin-top: 8px;
      border-radius: 16px !important;
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 55%, #14b8a6 100%) !important;
      color: #082f49 !important;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.01em;
      box-shadow: 0 18px 35px rgba(14, 165, 233, 0.22);
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 22px 40px rgba(14, 165, 233, 0.28);
    }

    .login-button:disabled {
      opacity: 0.65;
      box-shadow: none;
    }

    .card-footer {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 18px;
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      color: #94a3b8;
      font-size: 12px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 0 6px rgba(52, 211, 153, 0.14);
      flex-shrink: 0;
    }

    @media (max-width: 1080px) {
      .login-grid {
        grid-template-columns: 1fr;
      }

      .trust-panel {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .login-shell {
        padding: 18px;
      }

      .login-aside,
      .login-card {
        padding: 24px 20px;
        border-radius: 22px;
      }

      .aside-copy h1 {
        font-size: 32px;
      }

      .card-header h2 {
        font-size: 24px;
      }
    }

    @media (max-width: 640px) {
      .login-aside {
        gap: 24px;
      }

      .brand-mark {
        width: 60px;
        height: 60px;
      }

      .brand-mark mat-icon {
        width: 28px;
        height: 28px;
        font-size: 28px;
      }

      .form-options {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success('Connexion réussie !', 'Bienvenue');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error?.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect';
          this.toastr.error(message, 'Erreur de connexion');
        }
      });
    }
  }

  showPasswordHelp(): void {
    this.toastr.info(
      'Contactez un administrateur pour réinitialiser votre accès.',
      'Assistance connexion'
    );
  }
}
