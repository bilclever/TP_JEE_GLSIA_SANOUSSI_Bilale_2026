// comptes-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompteService, Compte } from '../../core/services/compte.service';
import { ClientService } from '../../core/services/client.service';
import { ToastrService } from 'ngx-toastr';
import { CompteFormComponent } from './compte-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-comptes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
    MatDividerModule
  ],
  template: `
    <div class="comptes-container">
      <div class="header">
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nouveau Compte
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <!-- Barre de recherche et filtres -->
          <div class="search-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher un compte</mat-label>
              <input matInput [(ngModel)]="searchTerm" 
                     (keyup.enter)="applyFilter()"
                     placeholder="Numéro de compte, client...">
              <button mat-icon-button matSuffix (click)="applyFilter()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>

            <button mat-stroked-button [matMenuTriggerFor]="filterMenu">
              <mat-icon>filter_list</mat-icon>
              Filtres
            </button>
          </div>

          <!-- Tableau des comptes -->
          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="dataSource" matSort class="comptes-table">
              <!-- Numéro de compte -->
              <ng-container matColumnDef="numeroCompte">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Numéro de compte</th>
                <td mat-cell *matCellDef="let compte">
                  <div class="compte-number">{{compte.numeroCompte}}</div>
                </td>
              </ng-container>

              <!-- Client Full Name -->
              <ng-container matColumnDef="clientFullName">
                <th mat-header-cell *matHeaderCellDef>Client</th>
                <td mat-cell *matCellDef="let compte">
                  {{compte.client?.fullName || (compte.clientNom + ' ' + compte.clientPrenom) || 'N/A'}}
                </td>
              </ng-container>

              <!-- Type -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let compte">
                  <mat-chip [class]="compte.type === 'EPARGNE' ? 'chip-epargne' : 'chip-courant'">
                    {{compte.type}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Solde -->
              <ng-container matColumnDef="solde">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Solde</th>
                <td mat-cell *matCellDef="let compte">
                  <span class="solde" [class.negative]="compte.solde < 0">
                    {{compte.solde | currency:'':'symbol':'1.2-2'}}
                  </span>
                </td>
              </ng-container>

              <!-- Date de création -->
              <ng-container matColumnDef="dateCreation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de création</th>
                <td mat-cell *matCellDef="let compte">
                  <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                    <span>{{compte.dateCreation | date:'dd/MM/yyyy'}}</span>
                    <button mat-icon-button [matMenuTriggerFor]="actionsMenu" (click)="setMenuCompte(compte)" matTooltip="Actions">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionsMenu="matMenu">
                      <button mat-menu-item [routerLink]="['/comptes', menuCompte.numeroCompte]" *ngIf="menuCompte">
                        <mat-icon>visibility</mat-icon>
                        <span>Voir détails</span>
                      </button>
                      <button mat-menu-item [routerLink]="['/comptes', menuCompte.numeroCompte, 'transactions']" *ngIf="menuCompte">
                        <mat-icon>receipt_long</mat-icon>
                        <span>Transactions</span>
                      </button>
                      <button mat-menu-item (click)="menuCompte && deleteCompte(menuCompte)" class="danger" *ngIf="menuCompte">
                        <mat-icon>delete</mat-icon>
                        <span>Supprimer</span>
                      </button>
                    </mat-menu>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <!-- État vide -->
          <div *ngIf="!isLoading && dataSource.data.length === 0" class="empty-state">
            <mat-icon>account_balance_wallet</mat-icon>
            <h3>Aucun compte trouvé</h3>
            <p>Commencez par créer un nouveau compte</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Créer un compte
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Menu filtres -->
    <mat-menu #filterMenu="matMenu">
      <button mat-menu-item (click)="filterByType('COURANT')">
        <mat-icon>account_balance</mat-icon>
        <span>Comptes Courants</span>
      </button>
      <button mat-menu-item (click)="filterByType('EPARGNE')">
        <mat-icon>savings</mat-icon>
        <span>Comptes Épargne</span>
      </button>
      <button mat-menu-item (click)="filterByStatus('ACTIF')">
        <mat-icon>check_circle</mat-icon>
        <span>Actifs uniquement</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="clearFilters()">
        <mat-icon>clear</mat-icon>
        <span>Réinitialiser</span>
      </button>
    </mat-menu>

    <ng-template #loading>
      <div class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des comptes...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .comptes-container {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .search-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .search-field {
      max-width: 300px;
      min-width: 180px;
      height: 40px;
    }

    .table-container {
      overflow-x: auto;
    }

    .comptes-table {
      width: 100%;
      background: white;
    }

    .compte-number {
      font-family: monospace;
      font-weight: 600;
      color: #667eea;
    }

    .solde {
      font-weight: 600;
      color: #4caf50;
    }

    .solde.negative {
      color: #f44336;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 600;
    }

    .chip-epargne {
      background: #e3f2fd;
      color: #1976d2;
    }

    .chip-courant {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .status-actif {
      background: #e8f5e9;
      color: #4caf50;
    }

    .status-bloque {
      background: #fff3e0;
      color: #ff9800;
    }

    .status-ferme {
      background: #ffebee;
      color: #f44336;
    }

    .action-buttons {
      text-align: right;
    }

    .danger {
      color: #c62828;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      color: #666;
      margin: 16px 0 8px 0;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 24px;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-state p {
      margin-top: 16px;
      color: #666;
    }
  `]
})
export class ComptesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['numeroCompte', 'clientFullName', 'type', 'solde', 'dateCreation'];
  dataSource = new MatTableDataSource<Compte>();
  isLoading = true;
  searchTerm = '';
  menuCompte: Compte | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private compteService: CompteService,
    private clientService: ClientService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadComptes();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadComptes(): void {
    this.isLoading = true;
    console.log('Loading comptes from API...');
    this.compteService.getAllComptes(0, 1000).subscribe({
      next: (response: any) => {
        console.log('Comptes response:', response);
        // L'API retourne maintenant un tableau direct de Compte[]
        const comptes = Array.isArray(response) ? response : [];
        console.log('Number of comptes:', comptes.length);
        
        // Charger les informations des clients pour chaque compte
        if (comptes.length > 0) {
          const clientIds = [...new Set(comptes.map((c: any) => c.clientId).filter((id: any) => id))] as number[];
          console.log('Loading clients for IDs:', clientIds);

          const clientRequests = clientIds.map((id: number) =>
            this.clientService.getClient(id).pipe(catchError(() => of(null)))
          );

          if (clientRequests.length === 0) {
            this.dataSource.data = comptes;
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
            this.isLoading = false;
            this.cdr.markForCheck();
            return;
          }

          forkJoin(clientRequests).subscribe({
            next: (clients) => {
              const clientMap = new Map();
              clients.forEach((client: any) => {
                if (client) {
                  clientMap.set(client.id, client);
                }
              });

              const enrichedComptes = comptes.map((compte: any) => ({
                ...compte,
                client: clientMap.get(compte.clientId)
              }));

              this.dataSource.data = enrichedComptes;
              if (this.sort) {
                this.dataSource.sort = this.sort;
              }
              this.isLoading = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Error loading client details:', err);
              this.dataSource.data = comptes;
              if (this.sort) {
                this.dataSource.sort = this.sort;
              }
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.dataSource.data = comptes;
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error loading comptes:', error);
        this.toastr.error('Erreur lors du chargement des comptes');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter(): void {
    // Implémenter la recherche
    this.loadComptes();
  }

  filterByType(type: string): void {
    this.compteService.getComptesByType(type as 'COURANT' | 'EPARGNE').subscribe({
      next: (comptes) => {
        this.dataSource.data = comptes;
      }
    });
  }

  filterByStatus(status: string): void {
    this.loadComptes();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.loadComptes();
  }

  setMenuCompte(compte: Compte): void {
    this.menuCompte = compte;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CompteFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: Compte) => {
      if (result) {
        this.loadComptes();
        this.toastr.success('Compte créé avec succès');
      }
    });
  }

  toggleStatus(compte: Compte): void {
    const action = compte.statut === 'ACTIF' ? 'désactiver' : 'activer';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: `Voulez-vous ${action} ce compte ?`,
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        const operation = compte.statut === 'ACTIF'
          ? this.compteService.desactiverCompte(compte.numeroCompte)
          : this.compteService.activerCompte(compte.numeroCompte);

        operation.subscribe({
          next: () => {
            this.toastr.success(`Compte ${action} avec succès`);
            this.loadComptes();
          },
          error: () => {
            this.toastr.error(`Erreur lors de l'opération`);
          }
        });
      }
    });
  }

  deleteCompte(compte: Compte): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suppression',
        message: `Êtes-vous sûr de vouloir supprimer le compte ${compte.numeroCompte} ?`,
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.compteService.deleteCompte(compte.numeroCompte).subscribe({
          next: () => {
            this.toastr.success('Compte supprimé avec succès');
            this.loadComptes();
          },
          error: () => {
            this.toastr.error('Erreur lors de la suppression');
          }
        });
      }
    });
  }
}
