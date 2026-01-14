import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AuthService, ChangePasswordRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="page-wrapper">
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">lock</mat-icon>
          <mat-card-title>Modifier le mot de passe</mat-card-title>
          <mat-card-subtitle>Changez votre mot de passe actuel</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Ancien mot de passe</mat-label>
              <input matInput type="password" formControlName="oldPassword" required />
              <mat-error *ngIf="passwordForm.get('oldPassword')?.hasError('required')">Requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nouveau mot de passe</mat-label>
              <input matInput type="password" formControlName="newPassword" required />
              <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">Requis</mat-error>
              <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">6 caractères minimum</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirmer le mot de passe</mat-label>
              <input matInput type="password" formControlName="confirmPassword" required />
              <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">Requis</mat-error>
              <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('mismatch')">Les mots de passe ne correspondent pas</mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-stroked-button color="primary" (click)="passwordForm.reset()" [disabled]="loading">Réinitialiser</button>
          <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || !passwordForm.valid">
            <mat-icon *ngIf="!loading">save</mat-icon>
            <mat-icon *ngIf="loading" class="spin">autorenew</mat-icon>
            <span>{{ loading ? 'Modification...' : 'Modifier' }}</span>
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="user-info-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">account_circle</mat-icon>
          <mat-card-title>Informations du profil</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-row">
            <span class="label">Nom d'utilisateur:</span>
            <span class="value">{{ currentUser?.username }}</span>
          </div>
          <div class="info-row" *ngIf="currentUser?.firstName || currentUser?.lastName">
            <span class="label">Nom complet:</span>
            <span class="value">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          </div>
          <div class="info-row" *ngIf="currentUser?.email">
            <span class="label">Email:</span>
            <span class="value">{{ currentUser?.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Rôle:</span>
            <span class="value role-badge">{{ currentUser?.role }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
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

    .user-info-card {
      margin-top: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      font-weight: 600;
      color: #333;
    }

    .role-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      text-transform: uppercase;
    }
  `]
})
export class ProfilComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  loading = false;
  currentUser = this.authService.getCurrentUser();

  passwordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loading) return;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toastr.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ mismatch: true });
      this.toastr.error('Les mots de passe ne correspondent pas');
      return;
    }

    this.loading = true;
    const payload: ChangePasswordRequest = {
      oldPassword: this.passwordForm.value.oldPassword!,
      newPassword: this.passwordForm.value.newPassword!,
      confirmPassword: this.passwordForm.value.confirmPassword!
    };

    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.toastr.success(response || 'Mot de passe modifié avec succès');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error || 'Échec de la modification du mot de passe');
        this.loading = false;
      }
    });
  }
}
