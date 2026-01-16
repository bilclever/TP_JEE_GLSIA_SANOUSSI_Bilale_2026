import { Component, OnInit } from '@angular/core';
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
import { CompteService } from '../../core/services/compte.service';
import { ExportService } from '../../core/services/export.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rapports',
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
        <h1>
          <mat-icon>dashboard</mat-icon>
          Tableau de bord
        </h1>
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
export class RapportsComponent implements OnInit {
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

  // Charts configurations
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
    private toastr: ToastrService
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
        return; // Attendre la sélection manuelle
    }

    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Simuler le chargement des données
    setTimeout(() => {
      this.loadKPIs();
      this.loadTransactionsData();
      this.loadComptesData();
      this.loadClientsData();
      this.loading = false;
    }, 1000);
  }

  loadKPIs(): void {
    this.kpis = {
      totalComptes: 152,
      nouveauxComptes: 12,
      totalClients: 98,
      nouveauxClients: 8,
      soldeTotal: 45678900,
      croissanceSolde: 12.5,
      nombreTransactions: 1245,
      volumeTransactions: 12456789
    };
  }

  loadTransactionsData(): void {
    this.stats = {
      depots: { nombre: 425, montant: 8456789 },
      retraits: { nombre: 512, montant: 6234567 },
      virements: { nombre: 308, montant: 4567890 }
    };

    // Chart volume
    this.transactionsVolumeChart.data.labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    this.transactionsVolumeChart.data.datasets[0].data = [
      1234567, 2345678, 1876543, 2987654, 3456789, 1234567, 876543
    ];

    // Chart type
    this.transactionsTypeChart.data.datasets[0].data = [
      this.stats.depots.montant,
      this.stats.retraits.montant,
      this.stats.virements.montant
    ];
  }

  loadComptesData(): void {
    this.comptesEvolutionChart.data.labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    this.comptesEvolutionChart.data.datasets[0].data = [120, 125, 132, 138, 145, 152];

    this.comptesTypeChart.data.datasets[0].data = [95, 57];
  }

  loadClientsData(): void {
    this.clientsEvolutionChart.data.labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    this.clientsEvolutionChart.data.datasets[0].data = [5, 8, 6, 9, 7, 8];

    this.topClients = [
      { nom: 'Jean Dupont', nombreComptes: 3, soldeTotal: 2345678 },
      { nom: 'Marie Martin', nombreComptes: 2, soldeTotal: 1987654 },
      { nom: 'Pierre Durand', nombreComptes: 2, soldeTotal: 1654321 },
      { nom: 'Sophie Bernard', nombreComptes: 1, soldeTotal: 1432109 },
      { nom: 'Luc Moreau', nombreComptes: 2, soldeTotal: 1298765 }
    ];
  }

  exportReport(): void {
    this.toastr.info('Génération du rapport PDF en cours...');
    setTimeout(() => {
      this.toastr.success('Rapport PDF exporté avec succès');
    }, 1500);
  }
}
