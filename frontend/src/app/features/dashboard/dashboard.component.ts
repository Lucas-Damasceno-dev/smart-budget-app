import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

import * as DashboardActions from '@store/actions/dashboard.actions';
import {
  selectDashboard,
  selectDashboardLoading,
} from '@store/selectors/dashboard.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    BaseChartDirective,
  ],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <div>
          <h1>
            <mat-icon class="header-icon">space_dashboard</mat-icon>
            Visão Geral das Finanças
          </h1>
          <p class="subtitle">Acompanhe seu fluxo de caixa, orçamento e patrimônio em tempo real</p>
        </div>
        <button mat-icon-button class="refresh-btn" matTooltip="Atualizar Dados" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </header>

      <ng-container *ngIf="loading$ | async; else dashboardContent">
        <div class="loading-container">
          <mat-spinner diameter="44"></mat-spinner>
          <span class="loading-text">Carregando métricas financeiras...</span>
        </div>
      </ng-container>

      <ng-template #dashboardContent>
        <ng-container *ngIf="dashboard$ | async as dashboard">
          <!-- Summary Stat Cards -->
          <div class="summary-grid">
            <mat-card class="stat-card balance-card">
              <div class="card-header-row">
                <span class="label">Saldo Total</span>
                <div class="icon-avatar balance-icon">
                  <mat-icon>account_balance_wallet</mat-icon>
                </div>
              </div>
              <div class="value-row">
                <span class="value">{{ dashboard.totalBalance | currency: 'BRL' }}</span>
              </div>
              <div class="stat-footer">
                <span class="trend-badge positive">
                  <mat-icon>arrow_upward</mat-icon> +12.4%
                </span>
                <span class="trend-label">vs mês anterior</span>
              </div>
            </mat-card>

            <mat-card class="stat-card income-card">
              <div class="card-header-row">
                <span class="label">Receitas do Mês</span>
                <div class="icon-avatar income-icon">
                  <mat-icon>trending_up</mat-icon>
                </div>
              </div>
              <div class="value-row">
                <span class="value amount-income">{{ dashboard.monthlyIncome | currency: 'BRL' }}</span>
              </div>
              <div class="stat-footer">
                <span class="trend-badge positive">
                  <mat-icon>arrow_upward</mat-icon> +5.2%
                </span>
                <span class="trend-label">vs mês anterior</span>
              </div>
            </mat-card>

            <mat-card class="stat-card expense-card">
              <div class="card-header-row">
                <span class="label">Despesas do Mês</span>
                <div class="icon-avatar expense-icon">
                  <mat-icon>trending_down</mat-icon>
                </div>
              </div>
              <div class="value-row">
                <span class="value amount-expense">{{ dashboard.monthlyExpenses | currency: 'BRL' }}</span>
              </div>
              <div class="stat-footer">
                <span class="trend-badge negative">
                  <mat-icon>arrow_downward</mat-icon> -3.8%
                </span>
                <span class="trend-label">vs mês anterior</span>
              </div>
            </mat-card>

            <mat-card class="stat-card networth-card">
              <div class="card-header-row">
                <span class="label">Patrimônio Líquido</span>
                <div class="icon-avatar networth-icon">
                  <mat-icon>savings</mat-icon>
                </div>
              </div>
              <div class="value-row">
                <span class="value">{{ dashboard.netWorth | currency: 'BRL' }}</span>
              </div>
              <div class="stat-footer">
                <span class="trend-badge neutral">
                  <mat-icon>verified</mat-icon> Saudável
                </span>
                <span class="trend-label">meta 85% atingida</span>
              </div>
            </mat-card>
          </div>

          <!-- Charts Row -->
          <div class="charts-grid">
            <mat-card class="chart-card">
              <div class="chart-header">
                <div>
                  <h3 class="chart-title">Fluxo de Caixa</h3>
                  <span class="chart-subtitle">Entradas vs Saídas nos últimos 30 dias</span>
                </div>
              </div>
              <div class="chart-wrapper">
                <canvas baseChart
                  [data]="cashflowChartData"
                  [options]="cashflowChartOptions"
                  type="line">
                </canvas>
              </div>
            </mat-card>

            <mat-card class="chart-card">
              <div class="chart-header">
                <div>
                  <h3 class="chart-title">Despesas por Categoria</h3>
                  <span class="chart-subtitle">Distribuição proporcional este mês</span>
                </div>
              </div>
              <div class="chart-wrapper doughnut-wrapper">
                <canvas baseChart
                  [data]="categoryChartData"
                  [options]="categoryChartOptions"
                  type="doughnut">
                </canvas>
              </div>
            </mat-card>
          </div>

          <!-- Bottom Grid: Accounts & Budget -->
          <div class="bottom-grid">
            <!-- Accounts Card -->
            <mat-card class="section-card">
              <div class="section-header">
                <h3>Minhas Contas</h3>
                <span class="badge-count">{{ (dashboard.accounts && dashboard.accounts.length) || 0 }} contas</span>
              </div>
              <div class="accounts-list">
                <div class="account-item" *ngFor="let account of dashboard.accounts">
                  <div class="account-left">
                    <div class="account-badge" [style.backgroundColor]="account.color || '#6366f1'">
                      <mat-icon>account_balance</mat-icon>
                    </div>
                    <div class="account-meta">
                      <span class="account-name">{{ account.name }}</span>
                      <span class="account-type">{{ account.type || 'Conta Bancária' }}</span>
                    </div>
                  </div>
                  <div class="account-right">
                    <span class="account-balance" [class.negative]="account.balance < 0">
                      {{ account.balance | currency: 'BRL' }}
                    </span>
                  </div>
                </div>
              </div>
            </mat-card>

            <!-- Budget Progress Card -->
            <mat-card class="section-card">
              <div class="section-header">
                <h3>Progresso do Orçamento</h3>
                <span class="budget-subtitle">Metas por Categoria</span>
              </div>
              <div class="budget-list">
                <div class="budget-item" *ngFor="let budget of dashboard.budgetProgress">
                  <div class="budget-top">
                    <span class="budget-cat-name">{{ budget.categoryName }}</span>
                    <span class="budget-amounts">
                      <strong>{{ budget.spent | currency: 'BRL' }}</strong> / {{ budget.limit | currency: 'BRL' }}
                    </span>
                  </div>
                  <div class="progress-track">
                    <div
                      class="progress-fill"
                      [style.width.%]="budget.percentage > 100 ? 100 : budget.percentage"
                      [ngClass]="{
                        'danger': budget.percentage > 100,
                        'warning': budget.percentage > 80 && budget.percentage <= 100,
                        'success': budget.percentage <= 80
                      }"
                    ></div>
                  </div>
                  <div class="budget-bottom">
                    <span class="status-tag" [ngClass]="{
                      'danger': budget.percentage > 100,
                      'warning': budget.percentage > 80 && budget.percentage <= 100,
                      'success': budget.percentage <= 80
                    }">
                      {{ budget.percentage > 100 ? 'Excedido' : budget.percentage > 80 ? 'Atenção' : 'Dentro do limite' }}
                    </span>
                    <span class="percentage-val">{{ budget.percentage | number: '1.0-0' }}%</span>
                  </div>
                </div>
              </div>
            </mat-card>
          </div>
        </ng-container>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-icon {
      color: #6366f1;
    }

    .refresh-btn {
      color: var(--text-muted);
      &:hover {
        color: var(--primary-color);
        transform: rotate(180deg);
        transition: transform 0.4s ease;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      gap: 16px;

      .loading-text {
        font-size: 14px;
        color: var(--text-muted);
        font-weight: 500;
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      padding: 22px;
      border-radius: var(--radius-md) !important;

      .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
      }

      .icon-avatar {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        &.balance-icon {
          background: rgba(99, 102, 241, 0.12);
          color: #6366f1;
        }

        &.income-icon {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        &.expense-icon {
          background: rgba(244, 63, 94, 0.12);
          color: #f43f5e;
        }

        &.networth-icon {
          background: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
        }
      }

      .value-row {
        margin-bottom: 14px;

        .value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
      }

      .stat-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;

        .trend-badge {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 11px;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }

          &.positive {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
          }

          &.negative {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
          }

          &.neutral {
            background: rgba(139, 92, 246, 0.12);
            color: #8b5cf6;
          }
        }

        .trend-label {
          color: var(--text-muted);
        }
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }

    .chart-card {
      padding: 24px;
      display: flex;
      flex-direction: column;

      .chart-header {
        margin-bottom: 20px;

        .chart-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;

        }

        .chart-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }
      }

      .chart-wrapper {
        position: relative;
        height: 320px;
        width: 100%;

        &.doughnut-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .section-card {
      padding: 24px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .badge-count, .budget-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }
      }
    }

    .accounts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .account-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-radius: var(--radius-sm);
      background: var(--bg-primary);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateX(4px);
      }

      .account-left {
        display: flex;
        align-items: center;
        gap: 14px;

        .account-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .account-meta {
          display: flex;
          flex-direction: column;

          .account-name {
            font-size: 14px;
            font-weight: 600;
          }

          .account-type {
            font-size: 12px;
            color: var(--text-muted);
          }
        }
      }

      .account-balance {
        font-size: 15px;
        font-weight: 700;

        &.negative {
          color: var(--expense-color);
        }
      }
    }

    .budget-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .budget-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .budget-top {
        display: flex;
        justify-content: space-between;
        font-size: 13px;

        .budget-cat-name {
          font-weight: 600;
        }

        .budget-amounts {
          color: var(--text-muted);

          strong {
            color: var(--text-main);
          }
        }
      }

      .progress-track {
        height: 8px;
        background: var(--border-subtle);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;

          &.success {
            background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
          }

          &.warning {
            background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
          }

          &.danger {
            background: linear-gradient(90deg, #f43f5e 0%, #fb7185 100%);
          }
        }
      }

      .budget-bottom {
        display: flex;
        justify-content: space-between;
        font-size: 11px;

        .status-tag {
          font-weight: 600;
          &.success { color: #10b981; }
          &.warning { color: #f59e0b; }
          &.danger { color: #f43f5e; }
        }

        .percentage-val {
          color: var(--text-muted);
          font-weight: 600;
        }
      }
    }

    @media (max-width: 959px) {
      .charts-grid, .bottom-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  dashboard$ = this.store.select(selectDashboard);
  loading$ = this.store.select(selectDashboardLoading);

  // Cashflow Chart Configuration
  cashflowChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Receitas',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        data: [],
        label: 'Despesas',
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#f43f5e',
      },
    ],
  };

  cashflowChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.4)' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
    },
  };

  // Category Doughnut Chart Configuration
  categoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#ec4899'],
        borderWidth: 0,
      },
    ],
  };

  categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { family: 'Plus Jakarta Sans', size: 12 },
        },
      },
    },
  };

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadDashboard());

    this.dashboard$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dashboard) => {
        if (dashboard) {
          this.updateCharts(dashboard);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.store.dispatch(DashboardActions.refreshDashboard());
  }

  private updateCharts(dashboard: any): void {
    if (dashboard.balanceHistory) {
      this.cashflowChartData = {
        labels: dashboard.balanceHistory.map((d: any) => d.date.slice(5)),
        datasets: [
          {
            data: dashboard.balanceHistory.map((d: any) => d.income),
            label: 'Receitas',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
          },
          {
            data: dashboard.balanceHistory.map((d: any) => d.expense),
            label: 'Despesas',
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#f43f5e',
          },
        ],
      };
    }

    if (dashboard.topExpenseCategories) {
      this.categoryChartData = {
        labels: dashboard.topExpenseCategories.map((c: any) => c.name),
        datasets: [
          {
            data: dashboard.topExpenseCategories.map((c: any) => c.amount),
            backgroundColor: dashboard.topExpenseCategories.map(
              (c: any, i: number) => c.color || ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'][i % 6]
            ),
            borderWidth: 0,
          },
        ],
      };
    }
  }
}
