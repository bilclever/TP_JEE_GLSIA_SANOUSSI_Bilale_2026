// operations.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompteService } from '../../core/services/compte.service';
import { ClientService } from '../../core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="operations-container">
     

      <mat-tab-group>
        <!-- Dépôt -->
        <mat-tab label="Dépôt">
          <mat-card class="operation-card">
            <mat-card-content>
              <div class="operation-icon depot">
                <mat-icon>call_received</mat-icon>
              </div>
              <h2>Effectuer un dépôt</h2>
              
              <form [formGroup]="depotForm" (ngSubmit)="effectuerDepot()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Numéro de compte</mat-label>
                  <input matInput formControlName="numeroCompte" required
                         
                         (blur)="chargerClientDepot()">
                  <mat-icon matPrefix>account_balance</mat-icon>
                </mat-form-field>

                <div *ngIf="clientDepot" class="client-info">
                  <p><strong>Client:</strong> {{ clientDepot.nom }} {{ clientDepot.prenom }}</p>
                  <p><strong>Email:</strong> {{ clientDepot.email }}</p>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Montant</mat-label>
                  <input matInput type="number" formControlName="montant" required
                          min="1000">
                  <span matSuffix>FCFA</span>
                  <mat-icon matPrefix>attach_money</mat-icon>
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" 
                        class="full-width"
                        [disabled]="!depotForm.valid || isLoading">
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">check</mat-icon>
                  <span>Effectuer le dépôt</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Retrait -->
        <mat-tab label="Retrait">
          <mat-card class="operation-card">
            <mat-card-content>
              <div class="operation-icon retrait">
                <mat-icon>call_made</mat-icon>
              </div>
              <h2>Effectuer un retrait</h2>
              
              <form [formGroup]="retraitForm" (ngSubmit)="effectuerRetrait()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Numéro de compte</mat-label>
                  <input matInput formControlName="numeroCompte" required
                        
                         (blur)="chargerClientRetrait()">
                  <mat-icon matPrefix>account_balance</mat-icon>
                </mat-form-field>

                <div *ngIf="clientRetrait" class="client-info">
                  <p><strong>Client:</strong> {{ clientRetrait.nom }} {{ clientRetrait.prenom }}</p>
                  <p><strong>Email:</strong> {{ clientRetrait.email }}</p>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Montant</mat-label>
                  <input matInput type="number" formControlName="montant" required
                          min="1000">
                  <span matSuffix>FCFA</span>
                  <mat-icon matPrefix>attach_money</mat-icon>
                </mat-form-field>

                <button mat-raised-button color="warn" type="submit" 
                        class="full-width"
                        [disabled]="!retraitForm.valid || isLoading">
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">check</mat-icon>
                  <span>Effectuer le retrait</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Virement -->
        <mat-tab label="Virement">
          <mat-card class="operation-card">
            <mat-card-content>
              <div class="operation-icon virement">
                <mat-icon>swap_horiz</mat-icon>
              </div>
              <h2>Effectuer un virement</h2>
              
              <form [formGroup]="virementForm" (ngSubmit)="effectuerVirement()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Compte source</mat-label>
                  <input matInput formControlName="numeroCompteSource" required
                         
                         (blur)="chargerClientSource()">
                  <mat-icon matPrefix>account_balance</mat-icon>
                </mat-form-field>

                <div *ngIf="clientSource" class="client-info">
                  <p><strong>Source:</strong> {{ clientSource.nom }} {{ clientSource.prenom }}</p>
                  <p><strong>Email:</strong> {{ clientSource.email }}</p>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Compte destination</mat-label>
                  <input matInput formControlName="numeroCompteDestination" required
                         
                         (blur)="chargerClientDestination()">
                  <mat-icon matPrefix>account_balance</mat-icon>
                </mat-form-field>

                <div *ngIf="clientDestination" class="client-info">
                  <p><strong>Destination:</strong> {{ clientDestination.nom }} {{ clientDestination.prenom }}</p>
                  <p><strong>Email:</strong> {{ clientDestination.email }}</p>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Montant</mat-label>
                  <input matInput type="number" formControlName="montant" required
                          min="1000">
                  <span matSuffix>FCFA</span>
                  <mat-icon matPrefix>attach_money</mat-icon>
                </mat-form-field>

                <button mat-raised-button color="accent" type="submit" 
                        class="full-width"
                        [disabled]="!virementForm.valid || isLoading">
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">check</mat-icon>
                  <span>Effectuer le virement</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .operations-container {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: inherit;
    }

    .header {
      margin-bottom: 10px;
      text-align: center;
    }

    .header h1 {
      font-size: clamp(18px, 3vw, 22px);
      font-weight: 600;
      color: inherit;
      margin: 0;
    }

    @media (max-width: 600px) {
      .operations-container {
        padding: 6px;
      }
      
      .header h1 {
        font-size: 16px;
      }
    }

    mat-tab-group {
      margin-top: 8px;
      width: 100%;
    }

    ::ng-deep mat-tab-group {
      background: transparent;
    }

    ::ng-deep .mat-mdc-tab-header {
      background: rgba(15, 23, 42, 0.85) !important;
      border-bottom: 1px solid rgba(34, 211, 238, 0.15) !important;
    }

    :host-context(body.light-theme) ::ng-deep .mat-mdc-tab-header {
      background: rgba(255, 255, 255, 0.95) !important;
      border-bottom: 1px solid rgba(2, 132, 199, 0.15) !important;
    }

    ::ng-deep .mat-mdc-tab-labels {
      background: transparent !important;
    }

    ::ng-deep .mat-mdc-tab {
      color: #94a3b8 !important;
    }

    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      color: var(--primary) !important;
    }

    :host-context(body.light-theme) ::ng-deep .mat-mdc-tab {
      color: #64748b !important;
    }

    :host-context(body.light-theme) ::ng-deep .mat-mdc-tab.mdc-tab--active {
      color: var(--primary) !important;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      background: transparent;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      background: transparent !important;
    }

    ::ng-deep .mat-mdc-tab-body {
      background: transparent !important;
    }

    ::ng-deep .operation-card {
      margin-top: 8px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.9) !important;
      color: #e2e8f0 !important;
      border: 1px solid rgba(34, 211, 238, 0.18) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(34, 211, 238, 0.08) !important;
      backdrop-filter: blur(8px) !important;
    }

    :host-context(body.light-theme) ::ng-deep .operation-card {
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid rgba(2, 132, 199, 0.14) !important;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
      backdrop-filter: none !important;
    }

    :host-context(body.light-theme) ::ng-deep .operation-card h2 {
      color: #0f172a !important;
    }

    mat-card-content {
      padding: 12px;
    }

    @media (max-width: 600px) {
      mat-card-content {
        padding: 10px;
      }
    }

    .operation-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }

    .operation-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    @media (max-width: 600px) {
      .operation-icon {
        width: 45px;
        height: 45px;
      }

      .operation-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .depot {
      background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
    }

    .retrait {
      background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
    }

    .virement {
      background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
    }

    h2 {
      text-align: center;
      color: inherit;
      margin-bottom: 12px;
      font-size: clamp(16px, 2.5vw, 18px);
      font-weight: 600;
    }


    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 24px; /* Ajout pour éviter que le bouton soit coupé */
    }

    @media (max-width: 600px) {
      form {
        gap: 6px;
      }
    }

    .full-width {
      width: 100%;
    }

    button[type="submit"] {
      height: 38px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 2px;
    }

    button mat-spinner {
      display: inline-block;
      margin-right: 6px;
    }

    .client-info {
      background-color: rgba(59, 130, 246, 0.08);
      border-left: 4px solid #2196f3;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      color: inherit;
    }

    :host-context(body.light-theme) .client-info {
      background-color: rgba(59, 130, 246, 0.12);
      color: #0f172a;
    }

    .client-info p {
      margin: 3px 0;
      font-size: 12px;
      color: inherit;
    }

    .client-info strong {
      color: #2196f3;
    }
  `]
})
export class OperationsComponent {
  depotForm: FormGroup;
  retraitForm: FormGroup;
  virementForm: FormGroup;
  isLoading = false;
  clientDepot: any = null;
  clientRetrait: any = null;
  clientSource: any = null;
  clientDestination: any = null;

  constructor(
    private fb: FormBuilder,
    private compteService: CompteService,
    private clientService: ClientService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.depotForm = this.fb.group({
      numeroCompte: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.retraitForm = this.fb.group({
      numeroCompte: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.virementForm = this.fb.group({
      numeroCompteSource: ['', Validators.required],
      numeroCompteDestination: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  chargerClientDepot(): void {
    const numeroCompte = this.depotForm.get('numeroCompte')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          if (compte.clientId) {
            this.clientService.getClient(compte.clientId).subscribe({
              next: (client: any) => {
                this.clientDepot = client;
                this.cdr.markForCheck();
              },
              error: () => {
                this.clientDepot = null;
                this.toast.error('Client non trouvé', 'Erreur');
              }
            });
          } else {
            this.clientDepot = null;
            this.toast.error('Compte non trouvé', 'Erreur');
          }
        },
        error: () => {
          setTimeout(() => {
            this.clientDepot = null;
            this.cdr.markForCheck();
          });
          this.toast.error('Compte non trouvé', 'Erreur');
        }
      });
    }
  }

  effectuerDepot(): void {
    if (this.depotForm.valid) {
      const { numeroCompte, montant } = this.depotForm.value;
      if (!this.clientDepot) {
        this.toast.warning('Veuillez d\'abord charger les informations du compte', 'Client non chargé');
        return;
      }

      const clientName = this.clientDepot?.fullName || `${this.clientDepot?.prenom} ${this.clientDepot?.nom}`.trim() || 'N/A';
      const clientEmail = this.clientDepot?.email || 'N/A';

      const dialogData: ConfirmDialogData = {
        title: 'Confirmer le dépôt',
        type: 'info',
        message: 'Vérifiez les informations avant de valider.',
        details: [
          { label: 'Compte', value: numeroCompte },
          { label: 'Montant', value: `${montant} FCFA` },
          { label: 'Client', value: clientName },
          { label: 'Email', value: clientEmail }
        ],
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      };

      this.dialog.open(ConfirmDialogComponent, { data: dialogData, width: '360px', maxWidth: '95vw' }).afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.isLoading = true;
        this.compteService.effectuerDepot(numeroCompte, montant, '').subscribe({
          next: (response) => {
            this.toast.success(
              `Montant: ${montant} FCFA<br>Référence: ${response.reference}<br>Statut: ${response.statut}`,
              '✓ Dépôt réussi',
              { timeOut: 4000, enableHtml: true }
            );
            this.depotForm.reset();
            this.clientDepot = null;
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.markForCheck();
            });
          },
          error: (error) => {
            const errorMsg = error.error?.message || error.statusText || 'Erreur lors du dépôt';
            this.toast.error(
              `${errorMsg}`,
              '✗ Dépôt échoué',
              { timeOut: 5000 }
            );
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.markForCheck();
            });
          }
        });
      });
    }
  }

  chargerClientRetrait(): void {
    const numeroCompte = this.retraitForm.get('numeroCompte')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          if (compte.clientId) {
            this.clientService.getClient(compte.clientId).subscribe({
              next: (client: any) => {
                this.clientRetrait = client;
                this.cdr.markForCheck();
              },
              error: () => {
                this.clientRetrait = null;
                this.toast.error('Client non trouvé', 'Erreur');
              }
            });
          } else {
            this.clientRetrait = null;
            this.toast.error('Compte non trouvé', 'Erreur');
          }
        },
        error: () => {
          setTimeout(() => {
            this.clientRetrait = null;
            this.cdr.markForCheck();
          });
          this.toast.error('Compte non trouvé', 'Erreur');
        }
      });
    }
  }

  effectuerRetrait(): void {
    if (this.retraitForm.valid) {
      const { numeroCompte, montant } = this.retraitForm.value;

      if (!this.clientRetrait) {
        this.toast.warning('Veuillez d\'abord charger les informations du compte', 'Client non chargé');
        return;
      }

      const clientName = this.clientRetrait?.fullName || `${this.clientRetrait?.prenom} ${this.clientRetrait?.nom}`.trim() || 'N/A';
      const clientEmail = this.clientRetrait?.email || 'N/A';

      const dialogData: ConfirmDialogData = {
        title: 'Confirmer le retrait',
        type: 'warning',
        message: 'Confirmez avant de débiter le compte.',
        details: [
          { label: 'Compte', value: numeroCompte },
          { label: 'Montant', value: `${montant} FCFA` },
          { label: 'Client', value: clientName },
          { label: 'Email', value: clientEmail }
        ]
      };

      this.dialog.open(ConfirmDialogComponent, { data: dialogData, width: '360px', maxWidth: '95vw' }).afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.isLoading = true;
        // Vérifier le solde avant d'effectuer le retrait
        this.compteService.getCompteByNumero(numeroCompte).subscribe({
          next: (compte: any) => {
            if (compte.solde < montant) {
              setTimeout(() => {
                this.toast.warning(
                  `Solde disponible: ${compte.solde} FCFA<br>Montant demandé: ${montant} FCFA<br>Montant manquant: ${(montant - compte.solde).toFixed(2)} FCFA`,
                  '⚠ Solde insuffisant',
                  { timeOut: 5000, enableHtml: true }
                );
                this.isLoading = false;
                this.cdr.markForCheck();
              });
            } else {
              this.compteService.effectuerRetrait(numeroCompte, montant, '').subscribe({
                next: (response) => {
                  this.toast.success(
                    `Montant: ${montant} FCFA<br>Référence: ${response.reference}<br>Statut: ${response.statut}`,
                    '✓ Retrait réussi',
                    { timeOut: 4000, enableHtml: true }
                  );
                  this.retraitForm.reset();
                  this.clientRetrait = null;
                  setTimeout(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                  });
                },
                error: (error) => {
                  const errorMsg = error.error?.message || error.statusText || 'Erreur lors du retrait';
                  this.toast.error(
                    `${errorMsg}`,
                    '✗ Retrait échoué',
                    { timeOut: 5000 }
                  );
                  setTimeout(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                  });
                }
              });
            }
          },
          error: () => {
            setTimeout(() => {
              this.toast.error(
                'Compte non trouvé',
                '✗ Erreur',
                { timeOut: 5000 }
              );
              this.isLoading = false;
              this.cdr.markForCheck();
            });
          }
        });
      });
    }
  }

  chargerClientSource(): void {
    const numeroCompte = this.virementForm.get('numeroCompteSource')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          if (compte.clientId) {
            this.clientService.getClient(compte.clientId).subscribe({
              next: (client: any) => {
                this.clientSource = client;
                this.cdr.markForCheck();
              },
              error: () => {
                this.clientSource = null;
                this.toast.error('Compte source non trouvé', 'Erreur');
              }
            });
          } else {
            this.clientSource = null;
            this.toast.error('Compte non trouvé', 'Erreur');
          }
        },
        error: () => {
          setTimeout(() => {
            this.clientSource = null;
            this.cdr.markForCheck();
          });
          this.toast.error('Compte source non trouvé', 'Erreur');
        }
      });
    }
  }

  chargerClientDestination(): void {
    const numeroCompte = this.virementForm.get('numeroCompteDestination')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          if (compte.clientId) {
            this.clientService.getClient(compte.clientId).subscribe({
              next: (client: any) => {
                this.clientDestination = client;
                this.cdr.markForCheck();
              },
              error: () => {
                this.clientDestination = null;
                this.toast.error('Compte destination non trouvé', 'Erreur');
              }
            });
          } else {
            this.clientDestination = null;
            this.toast.error('Compte non trouvé', 'Erreur');
          }
        },
        error: () => {
          setTimeout(() => {
            this.clientDestination = null;
            this.cdr.markForCheck();
          });
          this.toast.error('Compte destination non trouvé', 'Erreur');
        }
      });
    }
  }

  effectuerVirement(): void {
    if (this.virementForm.valid) {
      const { numeroCompteSource, numeroCompteDestination, montant } = this.virementForm.value;

      if (!this.clientSource || !this.clientDestination) {
        this.toast.warning('Veuillez d\'abord charger les informations des deux comptes', 'Clients non chargés');
        return;
      }

      const clientSourceName = this.clientSource?.fullName || `${this.clientSource?.prenom} ${this.clientSource?.nom}`.trim() || 'N/A';
      const clientDestinationName = this.clientDestination?.fullName || `${this.clientDestination?.prenom} ${this.clientDestination?.nom}`.trim() || 'N/A';

      const dialogData: ConfirmDialogData = {
        title: 'Confirmer le virement',
        type: 'info',
        message: 'Validez les informations avant de transférer.',
        details: [
          { label: 'Compte source', value: numeroCompteSource },
          { label: 'Client source', value: clientSourceName },
          { label: 'Compte destination', value: numeroCompteDestination },
          { label: 'Client destination', value: clientDestinationName },
          { label: 'Montant', value: `${montant} FCFA` }
        ]
      };

      this.dialog.open(ConfirmDialogComponent, { data: dialogData, width: '360px', maxWidth: '95vw' }).afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.isLoading = true;
        // Vérifier le solde du compte source avant d'effectuer le virement
        this.compteService.getCompteByNumero(numeroCompteSource).subscribe({
          next: (compte: any) => {
            if (compte.solde < montant) {
              setTimeout(() => {
                this.toast.warning(
                  `Solde disponible: ${compte.solde} FCFA<br>Montant demandé: ${montant} FCFA<br>Montant manquant: ${(montant - compte.solde).toFixed(2)} FCFA`,
                  '⚠ Solde insuffisant',
                  { timeOut: 5000, enableHtml: true }
                );
                this.isLoading = false;
                this.cdr.markForCheck();
              });
            } else {
              this.compteService.effectuerVirement(numeroCompteSource, numeroCompteDestination, montant, '').subscribe({
                next: (response) => {
                  this.toast.success(
                    `Montant: ${montant} FCFA<br>Référence: ${response.reference}<br>Statut: ${response.statut}`,
                    '✓ Virement réussi',
                    { timeOut: 4000, enableHtml: true }
                  );
                  this.virementForm.reset();
                  this.clientSource = null;
                  this.clientDestination = null;
                  setTimeout(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                  });
                },
                error: (error) => {
                  const errorMsg = error.error?.message || error.statusText || 'Erreur lors du virement';
                  this.toast.error(
                    `${errorMsg}`,
                    '✗ Virement échoué',
                    { timeOut: 5000 }
                  );
                  setTimeout(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                  });
                }
              });
            }
          },
          error: () => {
            setTimeout(() => {
              this.toast.error(
                'Compte source non trouvé',
                '✗ Erreur',
                { timeOut: 5000 }
              );
              this.isLoading = false;
              this.cdr.markForCheck();
            });
          }
        });
      });
    }
  }
}
