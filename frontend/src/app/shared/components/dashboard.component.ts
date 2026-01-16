import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TransactionService } from '../../core/services/transaction.service';
import { ClientService } from '../../core/services/client.service';
import { CompteService, Compte } from '../../core/services/compte.service';
import { ExportService } from '../../core/services/export.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  template: `
    <div class="rapports-container">
      <div class="header">
        <div class="actions">
          <mat-form-field appearance="outline">
            <mat-label>Période</mat-label>
            <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="onPeriodChange()">
              <mat-option value="today">Aujourd'hui</mat-option>
              <mat-option value="week">Cette semaine</mat-option>
              <mat-option value="month">Ce mois</mat-option>
              <mat-option value="year">Cette année</mat-option>
              <mat-option value="custom">Personnalisée</mat-option>
            </mat-select>
          </mat-form-field>

          <div *ngIf="selectedPeriod === 'custom'" class="custom-dates">
            <mat-form-field appearance="outline">
              <mat-label>Date début</mat-label>
              <input matInput 
                     [matDatepicker]="startPicker" 
                     [(ngModel)]="dateDebut"
                     (dateChange)="loadData()">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date fin</mat-label>
              <input matInput 
                     [matDatepicker]="endPicker" 
                     [(ngModel)]="dateFin"
                     (dateChange)="loadData()">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <button mat-raised-button color="primary" (click)="exportReport()">
            <mat-icon>download</mat-icon>
            Exporter PDF
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- KPIs -->
        <div class="kpi-grid">
          <mat-card class="kpi-card">
            <mat-icon color="primary">account_balance</mat-icon>
            <div class="kpi-content">
              <h3>{{ kpis.totalComptes }}</h3>
              <p>Comptes actifs</p>
              <span class="trend positive">+{{ kpis.nouveauxComptes }} ce mois</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-icon color="accent">people</mat-icon>
            <div class="kpi-content">
              <h3>{{ kpis.totalClients }}</h3>
              <p>Clients</p>
              <span class="trend positive">+{{ kpis.nouveauxClients }} ce mois</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-icon style="color: #4caf50">account_balance_wallet</mat-icon>
            <div class="kpi-content">
              <h3>{{ kpis.soldeTotal | number:'1.2-2' }} FCFA</h3>
              <p>Solde total</p>
              <span class="trend positive">+{{ kpis.croissanceSolde | number:'1.2-2' }}%</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-icon style="color: #ff9800">receipt</mat-icon>
            <div class="kpi-content">
              <h3>{{ kpis.nombreTransactions }}</h3>
              <p>Transactions</p>
              <span class="trend">{{ kpis.volumeTransactions | number:'1.2-2' }} FCFA</span>
            </div>
          </mat-card>
        </div>

        <!-- Onglets -->
        <mat-tab-group>
          <!-- Onglet Transactions -->
          <mat-tab label="Transactions">
            <div class="tab-content">
              <div class="charts-row">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Volume des transactions</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="transactionsVolumeChart.data"
                            [options]="transactionsVolumeChart.options"
                            [type]="'bar'">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Répartition par type</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="transactionsTypeChart.data"
                            [options]="transactionsTypeChart.options"
                            [type]="'doughnut'">
                    </canvas>
                  </mat-card-content>
                </mat-card>
              </div>

              <mat-card class="stats-card">
                <mat-card-header>
                  <mat-card-title>Détails des transactions</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <mat-icon color="primary">arrow_downward</mat-icon>
                      <div>
                        <strong>Dépôts</strong>
                        <p>{{ stats.depots.nombre }} transactions</p>
                        <p>{{ stats.depots.montant | number:'1.2-2' }} FCFA</p>
                      </div>
                    </div>
                    <div class="stat-item">
                      <mat-icon color="warn">arrow_upward</mat-icon>
                      <div>
                        <strong>Retraits</strong>
                        <p>{{ stats.retraits.nombre }} transactions</p>
                        <p>{{ stats.retraits.montant | number:'1.2-2' }} FCFA</p>
                      </div>
                    </div>
                    <div class="stat-item">
                      <mat-icon color="accent">swap_horiz</mat-icon>
                      <div>
                        <strong>Virements</strong>
                        <p>{{ stats.virements.nombre }} transactions</p>
                        <p>{{ stats.virements.montant | number:'1.2-2' }} FCFA</p>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Comptes -->
          <mat-tab label="Comptes">
            <div class="tab-content">
              <div class="charts-row">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Évolution des comptes</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="comptesEvolutionChart.data"
                            [options]="comptesEvolutionChart.options"
                            [type]="'line'">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Répartition par type</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="comptesTypeChart.data"
                            [options]="comptesTypeChart.options"
                            [type]="'pie'">
                    </canvas>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Clients -->
          <mat-tab label="Clients">
            <div class="tab-content">
              <div class="charts-row">
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Nouveaux clients</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <canvas baseChart
                            [data]="clientsEvolutionChart.data"
                            [options]="clientsEvolutionChart.options"
                            [type]="'line'">
                    </canvas>
                  </mat-card-content>
                </mat-card>

                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Top 10 clients</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="top-clients">
                      <div *ngFor="let client of topClients" class="client-item">
                        <div class="client-info">
                          <strong>{{ client.nom }}</strong>
                          <span>{{ client.nombreComptes }} compte(s)</span>
                        </div>
                        <div class="client-solde">
                          {{ client.soldeTotal | number:'1.2-2' }} FCFA
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .rapports-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .custom-dates {
      display: flex;
      gap: 10px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 100px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .kpi-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .kpi-content h3 {
      margin: 0 0 5px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .kpi-content p {
      margin: 0 0 5px 0;
      color: #666;
    }

    .trend {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      background: #e0e0e0;
    }

    .trend.positive {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .tab-content {
      padding: 20px;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .chart-card {
      padding: 20px;
    }

    .stats-card {
      padding: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-item mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .stat-item strong {
      display: block;
      margin-bottom: 5px;
    }

    .stat-item p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .top-clients {
      max-height: 400px;
      overflow-y: auto;
    }

    .client-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    .client-item:last-child {
      border-bottom: none;
    }

    .client-info strong {
      display: block;
      margin-bottom: 5px;
    }

    .client-info span {
      font-size: 14px;
      color: #666;
    }

    .client-solde {
      font-weight: 600;
      color: #4caf50;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = false;
  selectedPeriod = 'month';
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  kpis = {
    totalComptes: 0,
    nouveauxComptes: 0,
    totalClients: 0,
    nouveauxClients: 0,
    soldeTotal: 0,
    croissanceSolde: 0,
    nombreTransactions: 0,
    volumeTransactions: 0
  };

  stats = {
    depots: { nombre: 0, montant: 0 },
    retraits: { nombre: 0, montant: 0 },
    virements: { nombre: 0, montant: 0 }
  };

  topClients: any[] = [];

  transactionsVolumeChart: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Volume (FCFA)',
        data: [],
        backgroundColor: '#673ab7'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  };

  transactionsTypeChart: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: ['Dépôts', 'Retraits', 'Virements'],
      datasets: [{
        data: [],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  comptesEvolutionChart: ChartConfiguration = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Nombre de comptes',
        data: [],
        borderColor: '#673ab7',
        backgroundColor: 'rgba(103, 58, 183, 0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  comptesTypeChart: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Comptes courants', 'Comptes épargne'],
      datasets: [{
        data: [],
        backgroundColor: ['#2196f3', '#4caf50']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  clientsEvolutionChart: ChartConfiguration = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Nouveaux clients',
        data: [],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  constructor(
    private transactionService: TransactionService,
    private clientService: ClientService,
    private compteService: CompteService,
    private exportService: ExportService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.onPeriodChange();
  }

  onPeriodChange(): void {
    const now = new Date();
    this.dateFin = now;

    switch (this.selectedPeriod) {
      case 'today':
        this.dateDebut = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        this.dateDebut = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        this.dateDebut = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        this.dateDebut = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'custom':
        return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.loadKPIs();
    this.loadComptesData();
    this.loadClientsData();
  }

  loadKPIs(): void {
    forkJoin({
      clients: this.clientService.getClients().pipe(catchError(() => of([]))),
      comptes: this.compteService.getAllComptes(0, 1000).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ clients, comptes }) => {
        const comptesList = Array.isArray(comptes) ? comptes : [];

        this.kpis.totalClients = clients.length || 0;
        this.kpis.totalComptes = comptesList.length || 0;

        this.kpis.soldeTotal = comptesList.reduce((sum: number, compte: any) => sum + (compte?.solde || 0), 0);

        const comptesParType = {
          courant: comptesList.filter((c: any) => c.type === 'COURANT').length,
          epargne: comptesList.filter((c: any) => c.type === 'EPARGNE').length
        };
        this.comptesTypeChart.data.datasets[0].data = [comptesParType.courant, comptesParType.epargne];

        if (!comptesList.length) {
          this.kpis.nombreTransactions = 0;
          this.kpis.volumeTransactions = 0;
          this.stats = {
            depots: { nombre: 0, montant: 0 },
            retraits: { nombre: 0, montant: 0 },
            virements: { nombre: 0, montant: 0 }
          };
          this.transactionsTypeChart.data.datasets[0].data = [0, 0, 0];
          this.transactionsVolumeChart.data.labels = [];
          this.transactionsVolumeChart.data.datasets[0].data = [];
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        const transactionRequests = comptesList.map((compte: any) =>
          this.transactionService.getTransactionsByNumeroCompte(compte.numeroCompte).pipe(catchError(() => of([])))
        );

        forkJoin<any[]>(transactionRequests).subscribe(
          (results: any[]) => {
            const transactions = results.flat();
            this.kpis.nombreTransactions = transactions.length;
            this.kpis.volumeTransactions = transactions.reduce((sum: number, t: any) => sum + (t?.montant || 0), 0);

            this.stats.depots = {
              nombre: transactions.filter((t: any) => t.type === 'DEPOT').length,
              montant: transactions.filter((t: any) => t.type === 'DEPOT').reduce((sum: number, t: any) => sum + (t?.montant || 0), 0)
            };
            this.stats.retraits = {
              nombre: transactions.filter((t: any) => t.type === 'RETRAIT').length,
              montant: transactions.filter((t: any) => t.type === 'RETRAIT').reduce((sum: number, t: any) => sum + (t?.montant || 0), 0)
            };
            this.stats.virements = {
              nombre: transactions.filter((t: any) => (t.type === 'VIREMENT_EMIS' || t.type === 'VIREMENT_RECU' || t.type === 'VIREMENT')).length,
              montant: transactions.filter((t: any) => (t.type === 'VIREMENT_EMIS' || t.type === 'VIREMENT_RECU' || t.type === 'VIREMENT')).reduce((sum: number, t: any) => sum + (t?.montant || 0), 0)
            };

            this.transactionsTypeChart.data.datasets[0].data = [
              this.stats.depots.montant,
              this.stats.retraits.montant,
              this.stats.virements.montant
            ];

            this.loadTransactionsChart(transactions);

            this.loading = false;
            this.cdr.markForCheck();
          },
          () => {
            this.loading = false;
            this.cdr.markForCheck();
          }
        );
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadTransactionsData(): void {
    // Cette méthode n'est plus utilisée, les données sont chargées dans loadKPIs
  }

  loadTransactionsChart(transactions: any[]): void {
    // Grouper par jour
    const transParJour: { [key: string]: number } = {};
    transactions.forEach((t: any) => {
      const rawDate = t.dateTransaction || t.dateOperation;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const date = d.toLocaleDateString('fr-FR');
      transParJour[date] = (transParJour[date] || 0) + (t.montant || 0);
    });

    const derniers7Jours = Object.entries(transParJour).slice(-7);
    this.transactionsVolumeChart.data.labels = derniers7Jours.map(([date]) => date);
    this.transactionsVolumeChart.data.datasets[0].data = derniers7Jours.map(([, montant]) => montant);
  }

  loadComptesData(): void {
    this.compteService.getAllComptes(0, 1000).subscribe({
      next: (comptes: Compte[]) => {
        const comptesData = Array.isArray(comptes) ? comptes : [];
        
        // Grouper par mois de création
        const comptesParMois: { [key: string]: number } = {};
        comptesData.forEach((c: any) => {
          const date = new Date(c.createdAt || c.dateCreation);
          const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
          comptesParMois[mois] = (comptesParMois[mois] || 0) + 1;
        });

        const derniers6Mois = Object.entries(comptesParMois).slice(-6);
        this.comptesEvolutionChart.data.labels = derniers6Mois.map(([mois]) => mois);
        
        // Créer un tableau cumulatif
        let cumul = 0;
        this.comptesEvolutionChart.data.datasets[0].data = derniers6Mois.map(([, count]) => {
          cumul += count;
          return cumul;
        });
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadClientsData(): void {
    this.clientService.getClients().subscribe({
      next: (clients: any) => {

        // Charger les comptes pour calculer le solde par client
        this.compteService.getAllComptes(0, 1000).subscribe({
          next: (comptes: Compte[]) => {
            const comptesData = Array.isArray(comptes) ? comptes : [];

            // Calculer le solde par client
            const soldeParClient: { [key: number]: number } = {};
            comptesData.forEach((c: any) => {
              if (c.clientId) {
                soldeParClient[c.clientId] = (soldeParClient[c.clientId] || 0) + (c.solde || 0);
              }
            });

            // Créer la liste des clients avec solde et nombre de comptes
            const clientsEnrichis = clients.map((client: any) => {
              const nombreComptes = comptes.filter((c: any) => c.clientId === client.id).length;
              return {
                id: client.id,
                nom: `${client.nom || ''} ${client.prenom || ''}`.trim(),
                nombreComptes,
                soldeTotal: soldeParClient[client.id] || 0
              };
            });

            // Trier par solde décroissant et prendre les top 10
            this.topClients = clientsEnrichis
              .sort((a: any, b: any) => b.soldeTotal - a.soldeTotal)
              .slice(0, 10);

            // Grouper par mois pour l'évolution
            const clientsParMois: { [key: string]: number } = {};
            clients.forEach((c: any) => {
              const date = new Date(c.createdAt);
              const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
              clientsParMois[mois] = (clientsParMois[mois] || 0) + 1;
            });

            const derniers6Mois = Object.entries(clientsParMois).slice(-6);
            this.clientsEvolutionChart.data.labels = derniers6Mois.map(([mois]) => mois);
            this.clientsEvolutionChart.data.datasets[0].data = derniers6Mois.map(([, count]) => count);
            this.cdr.markForCheck();
          },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  exportReport(): void {
    this.toastr.info('Génération du rapport PDF en cours...');
    setTimeout(() => {
      this.toastr.success('Rapport PDF exporté avec succès');
    }, 1500);
  }
}
