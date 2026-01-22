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
    <div class="login-container">
      <div class="login-card-wrapper">
        <mat-card class="login-card">
          <mat-card-header>
            <div class="header-content">
              <div class="logo">
                <mat-icon>account_balance</mat-icon>
              </div>
              <h1>Banque Ega</h1>
              <p>Connexion sécurisée</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom d'utilisateur</mat-label>
                <input matInput formControlName="username" placeholder="admin" required>
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Le nom d'utilisateur est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mot de passe</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" 
                       formControlName="password" placeholder="admin123" required>
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Le mot de passe est requis
                </mat-error>
              </mat-form-field>

              <div class="form-options">
                <mat-checkbox formControlName="rememberMe">
                  Se souvenir de moi
                </mat-checkbox>
                <a href="#" class="forgot-password">Mot de passe oublié ?</a>
              </div>

              <button mat-raised-button color="primary" type="submit" 
                      class="full-width login-button"
                      [disabled]="!loginForm.valid || isLoading">
                <mat-spinner diameter="18" strokeWidth="3" *ngIf="isLoading"></mat-spinner>
                <span>{{ isLoading ? 'Connexion...' : 'Se connecter' }}</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    @keyframes slideDiagonal {
      from { background-position: 0 0, 0 0; }
      to { background-position: 320px 320px, -320px -320px; }
    }

    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #0b2a36 45%, #0f766e 100%);
      background-size: 220% 220%;
      animation: gradient 18s ease infinite;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      animation: float 8s ease-in-out infinite;
    }

    .login-container::after {
      content: '';
      position: absolute;
      inset: -20%;
      background:
        repeating-linear-gradient(120deg, rgba(34,211,238,0.08) 0 12px, transparent 12px 32px),
        repeating-linear-gradient(300deg, rgba(16,185,129,0.07) 0 10px, transparent 10px 28px);
      animation: slideDiagonal 18s linear infinite;
      opacity: 0.75;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .login-card-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 450px;
      width: 100%;
      animation: fadeInUp 0.6s ease-out;
      position: relative;
      z-index: 1;
    }

    .login-card {
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 25px 80px rgba(15,23,42,0.65), 0 0 60px rgba(14,165,233,0.25);
      backdrop-filter: blur(12px);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(34, 211, 238, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      width: 100%;
      color: #e2e8f0;
    }

    .login-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 90px rgba(15,23,42,0.7), 0 0 120px rgba(34, 211, 238, 0.35);
      border-color: rgba(34, 211, 238, 0.35);
    }

    .header-content {
      text-align: center;
      width: 100%;
      margin-bottom: 24px;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 50%, #14b8a6 100%);
      margin-bottom: 12px;
      box-shadow: 0 10px 30px rgba(34, 211, 238, 0.35);
      position: relative;
      transition: transform 0.3s ease;
    }

    .logo::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22d3ee, #0ea5e9, #14b8a6);
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .logo:hover::before {
      opacity: 1;
      animation: shimmer 2s infinite;
    }

    .logo:hover {
      transform: scale(1.1) rotate(5deg);
    }

    .logo mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #22d3ee 0%, #34d399 50%, #0ea5e9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }

    p {
      color: #cbd5e1;
      margin: 0;
      font-size: 13px;
      font-weight: 500;
    }

    mat-card-content {
      padding: 20px 0;
      animation: fadeInUp 1s ease-out 0.4s both;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field {
      transition: transform 0.2s ease;
    }

    ::ng-deep .mat-mdc-form-field:focus-within {
      transform: translateY(-2px);
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-form-field:focus-within .mat-mdc-text-field-wrapper {
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.25);
      border-color: rgba(34, 211, 238, 0.5);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 10px;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-label {
      color: #94a3b8 !important;
      font-size: 14px !important;
      top: 16px !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label,
    ::ng-deep .mat-mdc-form-field .mdc-floating-label--float-above {
      top: 8px !important;
      font-size: 12px !important;
      color: #0ea5e9 !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element {
      color: #000000 !important;
      font-size: 14px !important;
      padding-top: 12px !important;
      padding-bottom: 8px !important;
    }

    /* Force black input text regardless of theme */
    :host-context(body.light-theme) ::ng-deep .mat-mdc-form-field .mat-mdc-input-element,
    :host-context(body:not(.light-theme)) ::ng-deep .mat-mdc-form-field .mat-mdc-input-element {
      color: #000000 !important;
      caret-color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
    }

    /* Ensure autofill keeps black text */
    :host ::ng-deep input.mat-mdc-input-element:-webkit-autofill {
      -webkit-text-fill-color: #000000 !important;
      caret-color: #000000 !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-input-element::placeholder {
      color: #cbd5e1 !important;
      opacity: 0 !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-input-element::placeholder {
      opacity: 0.6 !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field .mat-mdc-notched-outline .mdc-notched-outline__trailing {
      border-color: rgba(148, 163, 184, 0.5) !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: rgba(34, 211, 238, 0.8) !important;
      border-width: 2px !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-icon {
      color: #64748b !important;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-icon {
      color: #22d3ee !important;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-label {
      color: #cbd5e1 !important;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin: 6px 0 12px 0;
      flex-wrap: nowrap;
    }

    ::ng-deep .mat-mdc-checkbox {
      flex-shrink: 0;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-label {
      color: #cbd5e1 !important;
      font-size: 13px !important;
      white-space: nowrap;
    }

    .forgot-password::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -2px;
      left: 0;
      background: linear-gradient(90deg, #22d3ee, #34d399);
      transition: width 0.3s ease;
    }

    .forgot-password:hover {
      color: #34d399;
    }

    .forgot-password:hover::after {
      width: 100%;
    }

    .login-button {
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      margin-top: 12px;
      background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 45%, #14b8a6 100%) !important;
      border-radius: 10px !important;
      box-shadow: 0 10px 24px rgba(34, 211, 238, 0.35);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      letter-spacing: 0.5px;
      color: #0b1220;
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }

    .login-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .login-button:hover::before {
      left: 100%;
    }

    .login-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px rgba(34, 211, 238, 0.45);
    }

    .login-button:active {
      transform: translateY(0);
    }

    .login-button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-checkbox__background {
      border-color: #22d3ee !important;
    }

    ::ng-deep .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background {
      background-color: #22d3ee !important;
    }

    @media (max-width: 600px) {
      .login-container {
        padding: 16px;
      }

      .login-card {
        padding: 28px 20px;
      }

      .logo {
        width: 52px;
        height: 52px;
      }

      .logo mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      h1 {
        font-size: 20px;
      }

      .login-button {
        height: 40px;
        font-size: 13px;
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
}
