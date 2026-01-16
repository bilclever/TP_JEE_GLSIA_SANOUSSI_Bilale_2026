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
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="firstName" required />
              <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">Requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="lastName" required />
              <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">Requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required />
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">Email invalide</mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">Requis</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="phoneNumber" />
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

            <mat-form-field appearance="outline">
              <mat-label>Confirmation</mat-label>
              <input matInput type="password" formControlName="confirmPassword" required />
              <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('required')">Requis</mat-error>
              <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('mismatch')">Les mots de passe ne correspondent pas</mat-error>
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
  `]
})
export class ParametresComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  loading = false;

  userForm = this.fb.group({
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    role: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loading) return;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
      this.userForm.get('confirmPassword')?.setErrors({ mismatch: true });
      this.toastr.error('Les mots de passe ne correspondent pas');
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
