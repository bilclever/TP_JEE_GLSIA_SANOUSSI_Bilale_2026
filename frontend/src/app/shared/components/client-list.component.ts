// client-list.component.ts - NOUVEAU DESIGN
import { AfterViewInit, Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Client, ClientService } from '../../core/services/client.service';
import { ClientFormComponent } from './client-form/client-form.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ClientCreateRequest } from '../../core/services/client.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  template: `
    <div class="clients-container">
      <div class="header">
        <button mat-raised-button color="primary" (click)="openClientForm()">
          <mat-icon>add</mat-icon>
          Nouveau client
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="search-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher un client</mat-label>
              <input matInput [(ngModel)]="searchTerm" (keyup.enter)="applyFilters(true)" >
              <button mat-icon-button matSuffix (click)="applyFilters(true)">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>

            <mat-chip-listbox [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters(true)">
              <mat-chip-option value="all">Tous</mat-chip-option>
              <mat-chip-option value="active">Actifs</mat-chip-option>
              <mat-chip-option value="inactive">Inactifs</mat-chip-option>
            </mat-chip-listbox>
          </div>

          <div class="table-container" *ngIf="!isLoading">
            <table mat-table [dataSource]="dataSource" matSort class="clients-table">

              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom complet</th>
                <td mat-cell *matCellDef="let client">
                  <div class="client-cell">
                    <div>
                      <div class="client-name">{{client.fullName || (client.prenom + ' ' + client.nom)}}</div>
                      <div class="client-email">{{client.email}}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="dateNaissance">
                <th mat-header-cell *matHeaderCellDef>Date de naissance</th>
                <td mat-cell *matCellDef="let client">{{client.dateNaissance | date:'dd/MM/yyyy'}}</td>
              </ng-container>

              <ng-container matColumnDef="sexe">
                <th mat-header-cell *matHeaderCellDef>Sexe</th>
                <td mat-cell *matCellDef="let client">{{client.sexe}}</td>
              </ng-container>

              <ng-container matColumnDef="nationalite">
                <th mat-header-cell *matHeaderCellDef>Nationalité</th>
                <td mat-cell *matCellDef="let client">{{client.nationalite}}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let client">{{client.telephone || 'Non renseigné'}}</td>
              </ng-container>

              <ng-container matColumnDef="adresse">
                <th mat-header-cell *matHeaderCellDef>Adresse</th>
                <td mat-cell *matCellDef="let client">{{client.adresse || 'Non renseigné'}}</td>
              </ng-container>

              <ng-container matColumnDef="age">
                <th mat-header-cell *matHeaderCellDef>Âge</th>
                <td mat-cell *matCellDef="let client">{{client.age}}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let client">
                  <mat-chip [class.active]="client.active" [class.inactive]="!client.active">
                    {{client.active ? 'ACTIF' : 'INACTIF'}}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé le</th>
                <td mat-cell *matCellDef="let client">{{client.createdAt | date:'dd/MM/yyyy HH:mm'}}</td>
              </ng-container>

              <ng-container matColumnDef="updatedAt">
                <th mat-header-cell *matHeaderCellDef>Mis à jour</th>
                <td mat-cell *matCellDef="let client">
                  <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                    <span>{{client.updatedAt | date:'dd/MM/yyyy HH:mm'}}</span>
                    <button mat-icon-button [matMenuTriggerFor]="actionsMenu" (click)="setMenuClient(client)" matTooltip="Actions">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionsMenu="matMenu">
                      <button mat-menu-item (click)="editClient(menuClient)">
                        <mat-icon>edit</mat-icon>
                        <span>Modifier</span>
                      </button>
                      <button mat-menu-item (click)="toggleStatus(menuClient)">
                        <mat-icon>{{menuClient?.active ? 'block' : 'check_circle'}}</mat-icon>
                        <span>{{menuClient?.active ? 'Désactiver' : 'Activer'}}</span>
                      </button>
                      <button mat-menu-item (click)="deleteClient(menuClient)" class="danger">
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

          <div *ngIf="!isLoading && dataSource.data.length === 0" class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <h3>Aucun client trouvé</h3>
            <p>Commencez par ajouter un nouveau client</p>
            
          </div>

          <div *ngIf="isLoading" class="loading-overlay">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .clients-container {
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
      margin-bottom: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      max-width: 300px;
      min-width: 180px;
      height: 40px;
    }

    mat-chip-option {
      font-weight: 600;
    }

    .table-container {
      overflow-x: auto;
    }

    .clients-table {
      width: 100%;
      background: white;
    }

    .client-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .client-cell > div {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
    }

    .client-name {
      font-weight: 700;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .client-email {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    body.light-theme .client-name {
      color: #000000 !important;
    }

    body.light-theme .client-email {
      color: #475569 !important;
    }

    /* Ensure table text is dark in light theme */
    :host-context(body.light-theme) ::ng-deep .mat-mdc-table .mat-mdc-cell,
    :host-context(body.light-theme) ::ng-deep .mat-mdc-table .mat-mdc-header-cell {
      color: #0f172a !important;
    }

    /* Increase specificity for client name/email inside Material table */
    :host-context(body.light-theme) ::ng-deep .mat-mdc-table .client-name {
      color: #000000 !important;
    }

    :host-context(body.light-theme) ::ng-deep .mat-mdc-table .client-email {
      color: #334155 !important;
    }

    mat-chip.active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    mat-chip.inactive {
      background: #ffebee;
      color: #c62828;
    }

    .action-buttons {
      text-align: right;
      white-space: nowrap;
    }

    .danger {
      color: #c62828;
    }

    .text-right {
      text-align: right;
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
      color: #333;
      margin: 12px 0 8px 0;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 16px;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-state p {
      margin-top: 16px;
      color: #666;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      border-radius: 4px;
    }

    mat-card {
      position: relative;
    }
  `]
})
export class ClientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'fullName',
    'dateNaissance',
    'sexe',
    'nationalite',
    'telephone',
    'adresse',
    'age',
    'statut',
    'createdAt',
    'updatedAt'
  ];
  dataSource = new MatTableDataSource<Client>([]);
  allClients: Client[] = [];
  totalClients = 0;
  searchTerm = '';
  selectedStatus = 'all';
  isLoading = true;
  menuClient: Client | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.allClients = clients;
        this.applyFilters(true);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(resetPaginator = false): void {
    let filtered = [...this.allClients];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.clientCode?.toLowerCase().includes(term) ||
        c.fullName?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.nom?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        (c.telephone || '').toLowerCase().includes(term) ||
        c.nationalite?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(c => c.active);
    } else if (this.selectedStatus === 'inactive') {
      filtered = filtered.filter(c => !c.active);
    }

    this.totalClients = filtered.length;
    this.dataSource.data = filtered;

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  getInitials(client: any): string {
    const first = client.prenom?.charAt(0) || '';
    const last = client.nom?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  openClientForm(client?: any): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const payload: ClientCreateRequest = result.payload;

      if (result.mode === 'edit' && client) {
        this.clientService.updateClient(client.id, payload).subscribe({
          next: () => {
            this.toastr.success('Client modifié avec succès');
            this.loadClients();
          },
          error: (error) => {
            console.error('Erreur de mise à jour client', error);
            const errorMsg = error.error?.message || error.statusText || 'Erreur lors de la modification';
            this.toastr.error(errorMsg, 'Erreur');
          }
        });
      } else if (result.mode === 'create') {
        console.log('Envoi du payload:', JSON.stringify(payload));
        this.clientService.createClient(payload).subscribe({
          next: () => {
            this.toastr.success('Client créé avec succès');
            this.loadClients();
          },
          error: (error) => {
            console.error('=== ERREUR CRÉATION CLIENT ===');
            console.error('Status:', error.status);
            console.error('Status Text:', error.statusText);
            console.error('Error body (JSON):', JSON.stringify(error.error, null, 2));
            console.error('Error headers:', error.headers);
            console.error('URL:', error.url);
            console.error('Message:', error.message);
            console.error('Full error:', error);
            
            let errorMsg = 'Erreur lors de la création';
            if (error.error?.message) {
              errorMsg = error.error.message;
            } else if (error.error?.errors) {
              errorMsg = JSON.stringify(error.error.errors);
            } else if (error.statusText && error.statusText !== 'OK') {
              errorMsg = error.statusText;
            }
            
            this.toastr.error(errorMsg, `Erreur ${error.status}`);
          }
        });
      }
    });
  }

  viewClient(client: any): void {
    this.router.navigate(['/clients', client.id]);
  }

  editClient(client: any): void {
    this.openClientForm(client);
  }

  setMenuClient(client: Client): void {
    this.menuClient = client;
  }

  toggleStatus(client: any): void {
    const action$ = client.active
      ? this.clientService.deactivateClient(client.id)
      : this.clientService.activateClient(client.id);

    action$.subscribe({
      next: () => this.loadClients(),
      error: (error) => console.error('Error toggling status:', error)
    });
  }

  deleteClient(client: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer le client ${client.prenom} ${client.nom} ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.deleteClient(client.id).subscribe({
          next: () => {
            this.loadClients();
          },
          error: (error) => {
            console.error('Error deleting client:', error);
          }
        });
      }
    });
  }
}
