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
import { CompteService } from '../../core/services/compte.service';
import { ToastrService } from 'ngx-toastr';

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
    MatProgressSpinnerModule
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
                         placeholder="TN5912345678901234567890"
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
                         placeholder="0.00" min="0.01">
                  <span matSuffix>TND</span>
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
                         placeholder="TN5912345678901234567890"
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
                         placeholder="0.00" min="0.01">
                  <span matSuffix>TND</span>
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
                         placeholder="TN5912345678901234567890"
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
                         placeholder="TN5987654321098765432109"
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
                         placeholder="0.00" min="0.01">
                  <span matSuffix>TND</span>
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
    }

    .header {
      margin-bottom: 10px;
      text-align: center;
    }

    .header h1 {
      font-size: clamp(18px, 3vw, 22px);
      font-weight: 600;
      color: #333;
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

    .operation-card {
      margin-top: 8px;
      border-radius: 8px;
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
      color: #333;
      margin-bottom: 12px;
      font-size: clamp(16px, 2.5vw, 18px);
      font-weight: 600;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
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
      background-color: #f0f4ff;
      border-left: 4px solid #2196f3;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .client-info p {
      margin: 3px 0;
      font-size: 12px;
      color: #333;
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
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
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
          setTimeout(() => {
            this.clientDepot = compte.client;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          setTimeout(() => {
            this.clientDepot = null;
            this.cdr.markForCheck();
          });
          this.toastr.error('Compte non trouvé', 'Erreur');
        }
      });
    }
  }

  effectuerDepot(): void {
    if (this.depotForm.valid) {
      this.isLoading = true;
      const { numeroCompte, montant } = this.depotForm.value;

      this.compteService.effectuerDepot(numeroCompte, montant, '').subscribe({
        next: (response) => {
          this.toastr.success(
            `Montant: ${montant} TND<br>Référence: ${response.reference}<br>Statut: ${response.statut}`,
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
          this.toastr.error(
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
    }
  }

  chargerClientRetrait(): void {
    const numeroCompte = this.retraitForm.get('numeroCompte')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          setTimeout(() => {
            this.clientRetrait = compte.client;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          setTimeout(() => {
            this.clientRetrait = null;
            this.cdr.markForCheck();
          });
          this.toastr.error('Compte non trouvé', 'Erreur');
        }
      });
    }
  }

  effectuerRetrait(): void {
    if (this.retraitForm.valid) {
      this.isLoading = true;
      const { numeroCompte, montant } = this.retraitForm.value;

      // Vérifier le solde avant d'effectuer le retrait
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          if (compte.solde < montant) {
            // Solde insuffisant
            setTimeout(() => {
              this.toastr.warning(
                `Solde disponible: ${compte.solde} TND<br>Montant demandé: ${montant} TND<br>Montant manquant: ${(montant - compte.solde).toFixed(2)} TND`,
                '⚠ Solde insuffisant',
                { timeOut: 5000, enableHtml: true }
              );
              this.isLoading = false;
              this.cdr.markForCheck();
            });
          } else {
            // Solde suffisant, effectuer le retrait
            this.compteService.effectuerRetrait(numeroCompte, montant, '').subscribe({
              next: (response) => {
                this.toastr.success(
                  `Montant: ${montant} TND<br>Référence: ${response.reference}<br>Statut: ${response.statut}`,
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
                this.toastr.error(
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
            this.toastr.error(
              'Compte non trouvé',
              '✗ Erreur',
              { timeOut: 5000 }
            );
            this.isLoading = false;
            this.cdr.markForCheck();
          });
        }
      });
    }
  }

  chargerClientSource(): void {
    const numeroCompte = this.virementForm.get('numeroCompteSource')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          setTimeout(() => {
            this.clientSource = compte.client;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          setTimeout(() => {
            this.clientSource = null;
            this.cdr.markForCheck();
          });
          this.toastr.error('Compte source non trouvé', 'Erreur');
        }
      });
    }
  }

  chargerClientDestination(): void {
    const numeroCompte = this.virementForm.get('numeroCompteDestination')?.value;
    if (numeroCompte) {
      this.compteService.getCompteByNumero(numeroCompte).subscribe({
        next: (compte: any) => {
          setTimeout(() => {
            this.clientDestination = compte.client;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          setTimeout(() => {
            this.clientDestination = null;
            this.cdr.markForCheck();
          });
          this.toastr.error('Compte destination non trouvé', 'Erreur');
        }
      });
    }
  }

  effectuerVirement(): void {
    if (this.virementForm.valid) {
      this.isLoading = true;
      const { numeroCompteSource, numeroCompteDestination, montant } = this.virementForm.value;

      // Vérifier le solde du compte source avant d'effectuer le virement
      this.compteService.getCompteByNumero(numeroCompteSource).subscribe({
        next: (compte: any) => {
          if (compte.solde < montant) {
            // Solde insuffisant
            setTimeout(() => {
              this.toastr.warning(
                `Solde disponible: ${compte.solde} TND<br>Montant demandé: ${montant} TND<br>Montant manquant: ${(montant - compte.solde).toFixed(2)} TND`,
                '⚠ Solde insuffisant',
                { timeOut: 5000, enableHtml: true }
              );
              this.isLoading = false;
              this.cdr.markForCheck();
            });
          } else {
            // Solde suffisant, effectuer le virement
            this.compteService.effectuerVirement(numeroCompteSource, numeroCompteDestination, montant, '').subscribe({
              next: (response) => {
                this.toastr.success(
                  `Montant: ${montant} TND<br>Référence: ${response.reference}<br>Statut: ${response.statut}`,
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
                this.toastr.error(
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
            this.toastr.error(
              'Compte source non trouvé',
              '✗ Erreur',
              { timeOut: 5000 }
            );
            this.isLoading = false;
            this.cdr.markForCheck();
          });
        }
      });
    }
  }
}
