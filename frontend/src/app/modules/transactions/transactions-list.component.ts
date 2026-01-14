import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransactionService } from '../../core/services/transaction.service';
import { CompteService } from '../../core/services/compte.service';
import { ExportService } from '../../core/services/export.service';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../core/services/client.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Transaction {
  id: number;
  reference: string;
  type: 'DEPOT' | 'RETRAIT' | 'VIREMENT' | 'VIREMENT_EMIS' | 'VIREMENT_RECU';
  montant: number;
  dateTransaction: string;
  compteSource?: string;
  compteDestination?: string;
  description?: string;
  status: 'EN_ATTENTE' | 'VALIDEE' | 'ANNULEE';
  clientNom?: string;
  clientPrenom?: string;
  numeroCompte?: string;
}

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="transactions-container">
      <mat-card>
        <mat-card-content>
          <!-- Filtres -->
          <div class="filters-section">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (input)="applyFilters()"
                     placeholder="Référence, compte, client...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (selectionChange)="applyFilters()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="DEPOT">Dépôt</mat-option>
                <mat-option value="RETRAIT">Retrait</mat-option>
                <mat-option value="VIREMENT_EMIS">Virement</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="EN_ATTENTE">En attente</mat-option>
                <mat-option value="VALIDEE">Validée</mat-option>
                <mat-option value="ANNULEE">Annulée</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date début</mat-label>
              <input matInput 
                     [matDatepicker]="startPicker" 
                     [(ngModel)]="dateDebut"
                     (dateChange)="applyFilters()">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date fin</mat-label>
              <input matInput 
                     [matDatepicker]="endPicker" 
                     [(ngModel)]="dateFin"
                     (dateChange)="applyFilters()">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button color="warn" (click)="resetFilters()">
              <mat-icon>clear</mat-icon>
              Réinitialiser
            </button>

            <button mat-raised-button 
                    color="accent" 
                    [matMenuTriggerFor]="exportMenu">
              <mat-icon>download</mat-icon>
              Exporter
            </button>
            <mat-menu #exportMenu="matMenu">
              <button mat-menu-item (click)="exportToExcel()">
                <mat-icon>table_chart</mat-icon>
                Excel
              </button>
              <button mat-menu-item (click)="exportToCsv()">
                <mat-icon>description</mat-icon>
                CSV
              </button>
            </mat-menu>
          </div>

          <!-- Statistiques rapides -->
          <div class="stats-row">
            <div class="stat-card">
              <mat-icon color="primary">arrow_downward</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalDepots | number:'1.2-2' }} FCFA</div>
                <div class="stat-label">Total Dépôts</div>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon color="warn">arrow_upward</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalRetraits | number:'1.2-2' }} FCFA</div>
                <div class="stat-label">Total Retraits</div>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon color="accent">swap_horiz</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalVirements | number:'1.2-2' }} FCFA</div>
                <div class="stat-label">Total Virements</div>
              </div>
            </div>
            <div class="stat-card">
              <mat-icon>receipt</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.nombreTransactions }}</div>
                <div class="stat-label">Transactions</div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <!-- Table -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="displayedTransactions" class="transactions-table">
              
              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef>Référence</th>
                <td mat-cell *matCellDef="let transaction">
                  <strong>{{ transaction.reference }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let transaction">
                  <mat-chip [class.depot]="transaction.type === 'DEPOT'"
                           [class.retrait]="transaction.type === 'RETRAIT'"
                           [class.virement]="transaction.type === 'VIREMENT_EMIS' || transaction.type === 'VIREMENT_RECU'">
                    <mat-icon>
                      {{ transaction.type === 'DEPOT' ? 'arrow_downward' : 
                         transaction.type === 'RETRAIT' ? 'arrow_upward' : 'swap_horiz' }}
                    </mat-icon>
                    {{ (transaction.type === 'VIREMENT_EMIS' || transaction.type === 'VIREMENT_RECU') ? 'VIREMENT' : transaction.type }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="montant">
                <th mat-header-cell *matHeaderCellDef>Montant</th>
                <td mat-cell *matCellDef="let transaction">
                  <span [class.positive]="transaction.type === 'DEPOT'"
                        [class.negative]="transaction.type === 'RETRAIT'">
                    {{ transaction.type === 'DEPOT' ? '+' : '-' }}{{ transaction.montant | number:'1.2-2' }} FCFA
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="compteSource">
                <th mat-header-cell *matHeaderCellDef>Compte Source</th>
                <td mat-cell *matCellDef="let transaction">
                  <div *ngIf="transaction.type === 'VIREMENT_EMIS' || transaction.type === 'VIREMENT_RECU'">
                    {{ transaction.compteSource || transaction.numeroCompte || '-' }}
                  </div>
                  <div *ngIf="transaction.type !== 'VIREMENT_EMIS' && transaction.type !== 'VIREMENT_RECU'">
                    {{ transaction.numeroCompte || '-' }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="compteDestination">
                <th mat-header-cell *matHeaderCellDef>Compte Destination</th>
                <td mat-cell *matCellDef="let transaction">
                  {{ transaction.compteDestination || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="dateTransaction">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let transaction">
                  {{ transaction.dateTransaction | date:'dd/MM/yyyy HH:mm' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let transaction" style="display: flex; justify-content: space-between; align-items: center;">
                  <mat-chip [class.en-attente]="transaction.status === 'EN_ATTENTE'"
                           [class.validee]="transaction.status === 'VALIDEE'"
                           [class.annulee]="transaction.status === 'ANNULEE'">
                    {{ transaction.status === 'EN_ATTENTE' ? 'En attente' :
                       transaction.status === 'VALIDEE' ? 'Validée' : 'Annulée' }}
                  </mat-chip>
                  <button mat-icon-button 
                          [matMenuTriggerFor]="actionMenu"
                          matTooltip="Actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item 
                            *ngIf="transaction.status !== 'ANNULEE'"
                            (click)="cancelTransaction(transaction)">
                      <mat-icon>cancel</mat-icon>
                      Annuler
                    </button>
                    <button mat-menu-item 
                            *ngIf="transaction.status === 'EN_ATTENTE'"
                            (click)="validateTransaction(transaction)">
                      <mat-icon>check_circle</mat-icon>
                      Valider
                    </button>
                    <button mat-menu-item (click)="printReceipt(transaction)">
                      <mat-icon>print</mat-icon>
                      Imprimer reçu
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: 20px;
    }

    mat-card {
      margin-bottom: 20px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
    }

    .filters-section {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      align-items: center;
    }

    .filters-section mat-form-field {
      min-width: 100px;
      max-width: 180px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .stat-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 50px;
    }

    .table-container {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;
    }

    mat-chip {
      font-size: 12px;
      min-height: 28px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    mat-chip.depot {
      background-color: #4caf50;
      color: white;
    }

    mat-chip.retrait {
      background-color: #f44336;
      color: white;
    }

    mat-chip.virement {
      background-color: #2196f3;
      color: white;
    }

    mat-chip.en-attente {
      background-color: #ff9800;
      color: white;
    }

    mat-chip.validee {
      background-color: #4caf50;
      color: white;
    }

    mat-chip.annulee {
      background-color: #9e9e9e;
      color: white;
    }

    .positive {
      color: #4caf50;
      font-weight: 600;
    }

    .negative {
      color: #f44336;
      font-weight: 600;
    }

  `]
})
export class TransactionsListComponent implements OnInit {
  displayedColumns: string[] = [
    'reference',
    'type',
    'montant',
    'compteSource',
    'compteDestination',
    'dateTransaction',
    'status'
  ];

  transactions: Transaction[] = [];
  displayedTransactions: Transaction[] = [];
  loading = false;

  // Filtres
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  // Statistiques
  statistics = {
    totalDepots: 0,
    totalRetraits: 0,
    totalVirements: 0,
    nombreTransactions: 0
  };

  constructor(
    private transactionService: TransactionService,
    private compteService: CompteService,
    private exportService: ExportService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    
    // Charger tous les comptes d'abord
    this.compteService.getAllComptes(0, 1000).subscribe({
      next: (comptesResponse: any) => {
        const comptes = Array.isArray(comptesResponse) ? comptesResponse : [];

        if (!comptes.length) {
          this.transactions = [];
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }
        
        const transactionRequests = comptes.map((compte: any) =>
          this.transactionService.getTransactionsByNumeroCompte(compte.numeroCompte).pipe(catchError(() => of([])))
        );

        forkJoin<any[]>(transactionRequests).subscribe(
          (results: any[]) => {
            const transactionsRaw = results.flat();
            console.log('🔍 Transactions brutes chargées:', transactionsRaw.length);
            console.log('🔍 Exemple transaction:', transactionsRaw[0]);
            
            // Enrichir avec les infos des comptes et mapper les champs de l'API
            const enrichedTransactions = transactionsRaw.map((t: any) => {
              const compte = comptes.find((c: any) => c.numeroCompte === t.compteId);
              // Pour les virements, chercher les numéros de compte source et destination
              const compteSourceObj = comptes.find((c: any) => c.id === t.compteId || c.numeroCompte === t.compteId);
              const compteDestObj = comptes.find((c: any) => c.id === t.compteDestinationId || c.numeroCompte === t.compteDestinationId);
              return {
                id: t.id,
                reference: t.reference,
                type: t.type,
                montant: t.montant,
                dateTransaction: t.dateOperation || t.dateTransaction,
                compteSource: compteSourceObj?.numeroCompte || t.compteId,
                compteDestination: compteDestObj?.numeroCompte || t.compteDestinationId,
                description: t.description,
                status: t.statut || t.status, // Mapper statut → status
                numeroCompte: t.compteId,
                clientNom: compte?.client?.nom || '',
                clientPrenom: compte?.client?.prenom || ''
              };
            });
            console.log('🔍 Transactions enrichies:', enrichedTransactions.length);
            console.log('🔍 Exemple transaction mappée:', enrichedTransactions[0]);

            // Charger les clients si nécessaire
            const clientIds = [...new Set(comptes.map((c: any) => c.clientId).filter(Boolean))] as number[];
            if (clientIds.length > 0) {
              const clientRequests = clientIds.map((id: number) =>
                this.clientService.getClient(id).pipe(catchError(() => of(null)))
              );

              forkJoin<any[]>(clientRequests).subscribe(
                (clients: any[]) => {
                  const clientMap = new Map();
                  clients.forEach((client: any) => {
                    if (client) clientMap.set(client.id, client);
                  });

                  this.transactions = enrichedTransactions.map((t: any) => {
                    const compte = comptes.find((c: any) => c.numeroCompte === t.numeroCompte);
                    const client = compte ? clientMap.get(compte.clientId) : null;
                    return {
                      ...t,
                      clientNom: client?.nom || t.clientNom || '',
                      clientPrenom: client?.prenom || t.clientPrenom || ''
                    };
                  });

                  this.calculateStatistics();
                  this.applyFilters();
                  this.loading = false;
                  this.cdr.markForCheck();
                },
                () => {
                  this.transactions = enrichedTransactions;
                  this.calculateStatistics();
                  this.applyFilters();
                  this.loading = false;
                  this.cdr.markForCheck();
                }
              );
            } else {
              this.transactions = enrichedTransactions;
              this.calculateStatistics();
              this.applyFilters();
              this.loading = false;
              this.cdr.markForCheck();
            }
          },
          (err) => {
            console.error('Erreur lors du chargement des transactions:', err);
            this.toastr.error('Erreur lors du chargement des transactions');
            this.loading = false;
            this.cdr.markForCheck();
          }
        );
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
        this.toastr.error('Erreur lors du chargement des comptes');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.transactions];

    // Filtre recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.reference.toLowerCase().includes(term) ||
        t.compteSource?.toLowerCase().includes(term) ||
        t.compteDestination?.toLowerCase().includes(term) ||
        t.clientNom?.toLowerCase().includes(term) ||
        t.clientPrenom?.toLowerCase().includes(term) ||
        `${t.clientPrenom} ${t.clientNom}`.toLowerCase().includes(term)
      );
    }

    // Filtre type
    if (this.selectedType) {
      filtered = filtered.filter(t => t.type === this.selectedType);
    }

    // Filtre statut
    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }

    // Filtre dates
    if (this.dateDebut) {
      filtered = filtered.filter(t => 
        new Date(t.dateTransaction) >= this.dateDebut!
      );
    }
    if (this.dateFin) {
      const endDate = new Date(this.dateFin);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => 
        new Date(t.dateTransaction) <= endDate
      );
    }

    // Trier par date décroissante (plus récentes en premier)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateTransaction).getTime();
      const dateB = new Date(b.dateTransaction).getTime();
      return dateB - dateA;
    });

    // Afficher toutes les transactions filtrées
    this.displayedTransactions = filtered;
    
    // Recalculer les stats sur les transactions filtrées
    this.calculateStatistics(filtered);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.applyFilters();
  }

  calculateStatistics(transactions?: Transaction[]): void {
    const data = transactions || this.transactions;
    console.log('📊 Calcul statistiques sur:', data.length, 'transactions');
    console.log('📊 Exemple transaction complète:', JSON.stringify(data[0], null, 2));
    
    // Afficher tous les types uniques présents dans les données
    const uniqueTypes = [...new Set(data.map(t => t.type))];
    const uniqueStatuts = [...new Set(data.map(t => t.status))];
    console.log('📊 Types uniques:', uniqueTypes);
    console.log('📊 Statuts uniques:', uniqueStatuts);
    
    // Afficher tous les types/statuts pour chaque transaction
    const typeStatutCount: { [key: string]: number } = {};
    data.forEach(t => {
      const key = `${t.type}/${t.status}`;
      typeStatutCount[key] = (typeStatutCount[key] || 0) + 1;
    });
    console.log('📊 Comptage par type/statut:', typeStatutCount);
    
    const depots = data.filter(t => t.type === 'DEPOT' && t.status === 'VALIDEE');
    const retraits = data.filter(t => t.type === 'RETRAIT' && t.status === 'VALIDEE');
    // Les virements : compter UNIQUEMENT VIREMENT_EMIS pour éviter le double comptage
    // (VIREMENT_RECU représente la même transaction vue du côté récepteur)
    const virements = data.filter(t => t.type === 'VIREMENT_EMIS');
    
    // Afficher les virements avec tous les détails pour déboguer
    const tousLesVirements = data.filter(t => t.type === 'VIREMENT_EMIS');
    console.log('📊 TOUS les virements émis (peu importe le statut):', tousLesVirements.length, tousLesVirements.map(t => ({ type: t.type, status: t.status, montant: t.montant, reference: t.reference })));
    
    console.log('📊 Dépôts validés:', depots.length, depots.map(t => ({ type: t.type, status: t.status, montant: t.montant })));
    console.log('📊 Retraits validés:', retraits.length, retraits.map(t => ({ type: t.type, status: t.status, montant: t.montant })));
    console.log('📊 Virements (tous statuts):', virements.length, virements.map(t => ({ type: t.type, status: t.status, montant: t.montant })));
    
    this.statistics = {
      totalDepots: depots.reduce((sum, t) => sum + t.montant, 0),
      totalRetraits: retraits.reduce((sum, t) => sum + t.montant, 0),
      totalVirements: virements.reduce((sum, t) => sum + t.montant, 0),
      nombreTransactions: data.filter(t => t.status === 'VALIDEE').length
    };
    
    console.log('📊 Statistiques calculées:', JSON.stringify(this.statistics, null, 2));
  }

  viewDetails(transaction: Transaction): void {
    this.toastr.info(`Détails de la transaction ${transaction.reference}`);
  }

  validateTransaction(transaction: Transaction): void {
    if (confirm(`Valider la transaction ${transaction.reference} ?`)) {
      // Appel API pour validation
      this.toastr.success('Transaction validée avec succès');
      this.loadTransactions();
    }
  }

  cancelTransaction(transaction: Transaction): void {
    const raison = prompt(`Annuler la transaction ${transaction.reference}\n\nRaison (optionnelle):`);
    if (raison !== null) {
      this.transactionService.annulerTransaction(transaction.id, raison || undefined).subscribe({
        next: (response) => {
          this.toastr.success(response || 'Transaction annulée avec succès');
          this.loadTransactions();
        },
        error: (err) => {
          this.toastr.error(err?.error || 'Échec de l\'annulation de la transaction');
        }
      });
    }
  }

  printReceipt(transaction: Transaction): void {
    this.toastr.info('Impression du reçu...');
  }

  exportToExcel(): void {
    const dataToExport = this.displayedTransactions.map(t => ({
      'Référence': t.reference,
      'Client': `${t.clientPrenom} ${t.clientNom}`.trim(),
      'Type': t.type,
      'Montant': t.montant,
      'Compte Source': t.compteSource || '-',
      'Compte Destination': t.compteDestination || '-',
      'Date': new Date(t.dateTransaction).toLocaleDateString('fr-FR'),
      'Statut': t.status
    }));
    
    this.exportService.exportToExcel(dataToExport, 'transactions');
    this.toastr.success('Export Excel réussi');
  }

  exportToCsv(): void {
    const dataToExport = this.displayedTransactions.map(t => ({
      'Référence': t.reference,
      'Client': `${t.clientPrenom} ${t.clientNom}`.trim(),
      'Type': t.type,
      'Montant': t.montant,
      'Compte Source': t.compteSource || '-',
      'Compte Destination': t.compteDestination || '-',
      'Date': new Date(t.dateTransaction).toLocaleDateString('fr-FR'),
      'Statut': t.status
    }));
    
    this.exportService.exportToCSV(dataToExport, 'transactions');
    this.toastr.success('Export CSV réussi');
  }
}
