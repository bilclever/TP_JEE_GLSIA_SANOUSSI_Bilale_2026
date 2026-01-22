import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AuthService, RegisterRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="page-wrapper">
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">admin_panel_settings</mat-icon>
          <mat-card-title>Création d'utilisateur</mat-card-title>
          <mat-card-subtitle>Créer un compte Agent ou Admin</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nom d'utilisateur</mat-label>
              <input matInput formControlName="username" required />
              <mat-error *ngIf="userForm.get('username')?.hasError('required')">Requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rôle</mat-label>
              <mat-select formControlName="role" required>
                <mat-option value="ADMIN">Admin</mat-option>
                <mat-option value="AGENT">Agent</mat-option>
              </mat-select>
              <mat-error *ngIf="userForm.get('role')?.hasError('required')">Requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" required />
              <mat-error *ngIf="userForm.get('password')?.hasError('required')">Requis</mat-error>
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">6 caractères minimum</mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-stroked-button color="primary" (click)="userForm.reset()" [disabled]="loading">Réinitialiser</button>
          <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading">
            <mat-icon *ngIf="!loading">person_add</mat-icon>
            <mat-icon *ngIf="loading" class="spin">autorenew</mat-icon>
            <span>{{ loading ? 'Création...' : 'Créer' }}</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: 8px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-top: 12px;
    }

    mat-card-actions {
      padding: 16px;
      gap: 8px;
    }

    button mat-icon {
      margin-right: 6px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Thème avec bon contraste */
    ::ng-deep body:not(.light-theme) mat-card-title {
      color: #ffffff !important;
    }

    ::ng-deep body.light-theme mat-card-title {
      color: #0f172a !important;
    }

    ::ng-deep body:not(.light-theme) mat-card-subtitle {
      color: #cbd5e1 !important;
    }

    ::ng-deep body.light-theme mat-card-subtitle {
      color: #475569 !important;
    }

    ::ng-deep body:not(.light-theme) .mat-mdc-form-field-label {
      color: #e2e8f0 !important;
    }

    ::ng-deep body.light-theme .mat-mdc-form-field-label {
      color: #0f172a !important;
    }

    ::ng-deep body:not(.light-theme) .mat-mdc-input-element {
      color: #ffffff !important;
    }

    ::ng-deep body.light-theme .mat-mdc-input-element {
      color: #0f172a !important;
    }

    ::ng-deep body:not(.light-theme) .mat-mdc-select {
      color: #ffffff !important;
    }

    ::ng-deep body.light-theme .mat-mdc-select {
      color: #0f172a !important;
    }

    ::ng-deep body:not(.light-theme) .mat-mdc-select-arrow {
      color: #e2e8f0 !important;
    }

    ::ng-deep body.light-theme .mat-mdc-select-arrow {
      color: #0f172a !important;
    }
  `]
})
export class ParametresComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  loading = false;

  userForm = this.fb.group({
    username: ['', Validators.required],
    role: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loading) return;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.loading = true;
    const payload: RegisterRequest = this.userForm.value as RegisterRequest;

    this.authService.register(payload).subscribe({
      next: () => {
        this.toastr.success('Utilisateur créé avec succès');
        this.userForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Échec de la création');
        this.loading = false;
      }
    });
  }
}
