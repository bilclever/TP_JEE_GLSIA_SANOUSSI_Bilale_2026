// client-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Client, ClientCreateRequest } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Modifier le client' : 'Nouveau client' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="clientForm" class="client-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" required>
            <mat-error *ngIf="clientForm.get('nom')?.hasError('required')">
              Le nom est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom" required>
            <mat-error *ngIf="clientForm.get('prenom')?.hasError('required')">
              Le prénom est requis
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Date de naissance</mat-label>
                 <input matInput 
                   [matDatepicker]="picker" 
                   formControlName="dateNaissance" 
                   required 
                   readonly
                   [max]="today"
                  
                   (focus)="picker.open()"
                   (click)="picker.open()">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                 <mat-datepicker #picker [touchUi]="true" startView="multi-year"></mat-datepicker>
            <mat-error *ngIf="clientForm.get('dateNaissance')?.hasError('required')">
              La date de naissance est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sexe</mat-label>
            <mat-select formControlName="sexe" required>
              <mat-option value="M">Homme</mat-option>
              <mat-option value="F">Femme</mat-option>
            </mat-select>
            <mat-error *ngIf="clientForm.get('sexe')?.hasError('required')">
              Le sexe est requis
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse</mat-label>
          <textarea matInput formControlName="adresse" rows="2" required></textarea>
          <mat-error *ngIf="clientForm.get('adresse')?.hasError('required')">
            L'adresse est requise
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone" required>
            <mat-error *ngIf="clientForm.get('telephone')?.hasError('required')">
              Le téléphone est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required>
            <mat-error *ngIf="clientForm.get('email')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="clientForm.get('email')?.hasError('email')">
              Email invalide
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nationalité</mat-label>
          <input matInput formControlName="nationalite" required>
          <mat-error *ngIf="clientForm.get('nationalite')?.hasError('required')">
            La nationalité est requise
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!clientForm.valid">
        {{ isEditMode ? 'Modifier' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .client-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
      padding: 16px 0;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    /* Désactive les styles globaux et force le texte saisi en noir uniquement pour ce formulaire */
    :host ::ng-deep input.mat-mdc-input-element,
    :host ::ng-deep textarea.mat-mdc-input-element {
      color: #000000 !important;
      caret-color: #000000 !important;
      background-color: #ffffff !important;
      -webkit-text-fill-color: #000000 !important;
    }
    :host ::ng-deep input.mat-mdc-input-element::placeholder,
    :host ::ng-deep textarea.mat-mdc-input-element::placeholder {
      color: #000000 !important;
      opacity: 0.6 !important;
    }
    :host ::ng-deep .mat-mdc-form-field-wrapper {
      background: #ffffff !important;
    }
    :host ::ng-deep .mat-mdc-select-value {
      color: #000000 !important;
    }
    :host ::ng-deep .mat-mdc-select-arrow {
      color: #000000 !important;
    }
    /* Options dropdown (toujours blanc sur noir) */
    :host ::ng-deep .mat-mdc-option-text {
      color: #000000 !important;
    }
    :host ::ng-deep .mdc-list-item__primary-text {
      color: #000000 !important;
    }
    :host ::ng-deep .mat-mdc-select-panel {
      background-color: #ffffff !important;
    }
    :host ::ng-deep .mat-mdc-option {
      background-color: #ffffff !important;
    }
    :host ::ng-deep .mat-mdc-option:hover {
      background-color: #f5f5f5 !important;
    }
    :host ::ng-deep .mat-autocomplete-panel {
      background-color: #ffffff !important;
    }
    :host ::ng-deep .cdk-overlay-pane {
      background-color: #ffffff !important;
    }
  `]
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode = false;
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client?: Client }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.client;
    this.initForm();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      nom: [this.data?.client?.nom || '', Validators.required],
      prenom: [this.data?.client?.prenom || '', Validators.required],
      dateNaissance: [this.toDate(this.data?.client?.dateNaissance) || null, Validators.required],
      sexe: [this.data?.client?.sexe || '', Validators.required],
      adresse: [this.data?.client?.adresse || '', Validators.required],
      telephone: [this.data?.client?.telephone || '', Validators.required],
      email: [this.data?.client?.email || '', [Validators.required, Validators.email]],
      nationalite: [this.data?.client?.nationalite || '', Validators.required]
    });
  }

  onSubmit(): void {
    console.log('Form valid:', this.clientForm.valid);
    console.log('Form value:', this.clientForm.value);

    if (this.clientForm.valid) {
      const dateNaissanceFormatted = this.formatDate(this.clientForm.value.dateNaissance);
      
      if (!dateNaissanceFormatted) {
        console.error('Date de naissance invalide:', this.clientForm.value.dateNaissance);
        return;
      }

      const payload: ClientCreateRequest = {
        nom: (this.clientForm.value.nom || '').trim(),
        prenom: (this.clientForm.value.prenom || '').trim(),
        dateNaissance: dateNaissanceFormatted,
        sexe: this.clientForm.value.sexe,
        adresse: (this.clientForm.value.adresse || '').trim(),
        telephone: this.cleanPhone(this.clientForm.value.telephone),
        email: (this.clientForm.value.email || '').trim(),
        nationalite: (this.clientForm.value.nationalite || '').trim()
      } as ClientCreateRequest;

      console.log('=== PAYLOAD CLIENT FORM ===');
      console.log('Payload complet:', JSON.stringify(payload, null, 2));
      console.log('Type de sexe:', typeof payload.sexe);
      console.log('Valeur sexe:', payload.sexe);
      console.log('Type de dateNaissance:', typeof payload.dateNaissance);
      console.log('Valeur dateNaissance:', payload.dateNaissance);

      this.dialogRef.close({
        mode: this.isEditMode ? 'edit' : 'create',
        payload
      });
    } else {
      console.error('Formulaire invalide');
      Object.keys(this.clientForm.controls).forEach(key => {
        const control = this.clientForm.get(key);
        if (control && control.errors) {
          console.error(`${key}: ${JSON.stringify(control.errors)}`);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

   // Convertit string | Date en Date pour le datepicker
  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  // Formate en yyyy-MM-dd pour l'API
  private formatDate(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

  // Nettoie le numéro de téléphone : supprime espaces, tirets, etc. Garde seulement + et chiffres
  private cleanPhone(phone: string): string {
    return phone.replace(/[\s\-()]/g, '').trim();
  }
}
