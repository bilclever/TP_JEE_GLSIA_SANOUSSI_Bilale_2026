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
              <div class="demo-badge">MODE DÉMO</div>
              <div class="logo">
                <mat-icon>account_balance</mat-icon>
              </div>
              <h1>Banque Ega</h1>
              <p>Connexion à votre espace</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom d'utilisateur</mat-label>
                <input matInput formControlName="username" required>
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Le nom d'utilisateur est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mot de passe</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" 
                       formControlName="password" required>
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
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Se connecter</span>
              </button>
            </form>
          </mat-card-content>

          <mat-card-footer>
            <p class="footer-text">
              Pas encore de compte ? <a href="#" routerLink="/register">S'inscrire</a>
            </p>
          </mat-card-footer>
        </mat-card>

        <div class="info-section">
          <h3>Bienvenue sur Banque Ega</h3>
          <ul>
            <li><mat-icon>check_circle</mat-icon> Gestion de vos comptes</li>
            <li><mat-icon>check_circle</mat-icon> Opérations bancaires sécurisées</li>
            <li><mat-icon>check_circle</mat-icon> Suivi en temps réel</li>
            <li><mat-icon>check_circle</mat-icon> Support 24/7</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card-wrapper {
      display: grid;
      grid-template-columns: 450px 350px;
      gap: 30px;
      max-width: 850px;
    }

    .login-card {
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .header-content {
      text-align: center;
      width: 100%;
      margin-bottom: 24px;
    }

    .demo-badge {
      display: inline-block;
      background-color: #ff9800;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-bottom: 16px;
    }

    .logo mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px 0;
    }

    p {
      color: #666;
      margin: 0;
    }

    mat-card-content {
      padding: 24px 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .forgot-password {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
    }

    .login-button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    mat-card-footer {
      padding: 16px 0 0 0;
      border-top: 1px solid #e0e0e0;
    }

    .footer-text {
      text-align: center;
      margin: 0;
      padding-top: 16px;
    }

    .footer-text a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .footer-text a:hover {
      text-decoration: underline;
    }

    .info-section {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .info-section h3 {
      color: #333;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 24px 0;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-section li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      color: #666;
      font-size: 16px;
    }

    .info-section li mat-icon {
      color: #4caf50;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    @media (max-width: 900px) {
      .login-card-wrapper {
        grid-template-columns: 1fr;
        max-width: 450px;
      }

      .info-section {
        display: none;
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

    // Pré-remplir le formulaire en mode DÉMO
    this.loginForm = this.fb.group({
      username: ['admin', Validators.required],
      password: ['demo123', Validators.required],
      rememberMe: [true]
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
          this.toastr.error('Nom d\'utilisateur ou mot de passe incorrect', 'Erreur de connexion');
        }
      });
    }
  }
}
