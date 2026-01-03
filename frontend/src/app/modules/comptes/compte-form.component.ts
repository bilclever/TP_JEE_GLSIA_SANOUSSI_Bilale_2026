// compte-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CompteService, Compte, CompteCreateRequest } from '../../core/services/compte.service';
import { ClientService, Client } from '../../core/services/client.service';
import { Observable, debounceTime, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-compte-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  template: `
    <h2 mat-dialog-title>{{isEditMode ? 'Modifier le compte' : 'Nouveau compte'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="compteForm" class="compte-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type de compte</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="COURANT">Compte Courant</mat-option>
            <mat-option value="EPARGNE">Compte Épargne</mat-option>
          </mat-select>
          <mat-error *ngIf="compteForm.get('type')?.hasError('required')">
            Le type de compte est requis
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Client</mat-label>
          <input matInput formControlName="clientSearch" 
                 [matAutocomplete]="auto" placeholder="Rechercher un client...">
          <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayClient"
                           (optionSelected)="onClientSelected($event)">
            <mat-option *ngFor="let client of filteredClients | async" [value]="client">
              {{client.nom}} {{client.prenom}} - {{client.email}}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" 
              [disabled]="!compteForm.valid || !selectedClient">
        {{isEditMode ? 'Modifier' : 'Créer'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .compte-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
      padding: 16px 0;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CompteFormComponent implements OnInit {
  compteForm!: FormGroup;
  isEditMode = false;
  selectedClient: Client | null = null;
  filteredClients!: Observable<Client[]>;

  constructor(
    private fb: FormBuilder,
    private compteService: CompteService,
    private clientService: ClientService,
    private dialogRef: MatDialogRef<CompteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { compte?: Compte; mode: string }
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    this.initForm();
    this.setupClientAutocomplete();
  }

  initForm(): void {
    this.compteForm = this.fb.group({
      type: [this.data.compte?.typeCompte || '', Validators.required],
      clientSearch: [''],
      clientId: [this.data.compte?.clientId || null, Validators.required]
    });
  }

  setupClientAutocomplete(): void {
    this.filteredClients = this.compteForm.get('clientSearch')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        const searchTerm = typeof value === 'string' ? value : '';
        if (searchTerm.length < 2) return [];
        return this.clientService.searchClients(searchTerm);
      })
    );
  }

  displayClient(client: Client): string {
    return client ? `${client.nom} ${client.prenom}` : '';
  }

  onClientSelected(event: any): void {
    this.selectedClient = event.option.value;
    this.compteForm.patchValue({ clientId: this.selectedClient!.id });
  }

  onSubmit(): void {
    if (this.compteForm.valid && this.selectedClient) {
      const formValue = this.compteForm.value;
      const compteData: CompteCreateRequest = {
        type: formValue.type,
        clientId: this.selectedClient.id
      };

      console.log('Creating compte with data:', compteData);
      this.compteService.createCompte(compteData).subscribe({
        next: (compte) => {
          console.log('Compte created:', compte);
          this.dialogRef.close(compte);
        },
        error: (error) => {
          console.error('Error creating compte:', error);
          this.dialogRef.close(null);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
