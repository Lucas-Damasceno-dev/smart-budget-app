import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    BaseChartDirective,
  ],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Dashboard</h1>
        <button mat-icon-button (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </header>

      <ng-container *ngIf="loading$ | async; else dashboardContent">
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      </ng-container>
      <ng-template #dashboardContent>
        <ng-container *ngIf="dashboard$ | async as dashboard">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <mat-card class="summary-card balance-card">
            <mat-icon>account_balance_wallet</mat-icon>
            <div class="card-content">
              <span class="label">Saldo Total</span>
              <span class="value">{{ dashboard.totalBalance | currency: 'BRL' }}</span>
            </div>
          </mat-card>

          <mat-card class="summary-card income-card">
            <mat-icon>trending_up</mat-icon>
            <div class="card-content">
              <span class="label">Receitas do Mês</span>
              <span class="value amount-income">{{ dashboard.monthlyIncome | currency: 'BRL' }}</span>
            </div>
          </mat-card>

          <mat-card class="summary-card expense-card">
            <mat-icon>trending_down</mat-icon>
            <div class="card-content">
              <span class="label">Despesas do Mês</span>
              <span class="value amount-expense">{{ dashboard.monthlyExpenses | currency: 'BRL' }}</span>
            </div>
          </mat-card>

          <mat-card class="summary-card net-worth-card">
            <mat-icon>savings</mat-icon>
            <div class="card-content">
              <span class="label">Patrimônio Líquido</span>
              <span class="value">{{ dashboard.netWorth | currency: 'BRL' }}</span>
            </div>
          </mat-card>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Fluxo de Caixa - Últimos 30 dias</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="cashflowChartData"
                [options]="cashflowChartOptions"
                type="line">
              </canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Despesas por Categoria</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="categoryChartData"
                [options]="categoryChartOptions"
                type="doughnut">
              </canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Accounts and Budget -->
        <div class="bottom-grid">
          <mat-card class="accounts-card">
            <mat-card-header>
              <mat-card-title>Minhas Contas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="accounts-list">
                <div class="account-item" *ngFor="let account of dashboard.accounts">
                  <div class="account-info">
                    <span class="account-color" [style.backgroundColor]="account.color || '#2563eb'"></span>
                    <span class="account-name">{{ account.name }}</span>
                  </div>
                  <span class="account-balance" [class.negative]="account.balance < 0">
                    {{ account.balance | currency: 'BRL' }}
                  </span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="budget-card">
            <mat-card-header>
              <mat-card-title>Progresso do Orçamento</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="budget-list">
                <div class="budget-item" *ngFor="let budget of dashboard.budgetProgress">
                  <div class="budget-header">
                    <span class="budget-name">{{ budget.categoryName }}</span>
                    <span class="budget-values">
                      {{ budget.spent | currency: 'BRL' }} / {{ budget.limit | currency: 'BRL' }}
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.width.%]="budget.percentage > 100 ? 100 : budget.percentage"
                      [style.backgroundColor]="budget.percentage > 100 ? '#dc2626' : budget.percentage > 80 ? '#f59e0b' : '#059669'"
                    ></div>
                  </div>
                  <span class="percentage" [class.danger]="budget.percentage > 100">
                    {{ budget.percentage | number: '1.0-0' }}%
                  </span>
                </div>
              </div>
            </mat-card-content>
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      padding: 24px;
      border-radius: 12px;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        margin-right: 16px;
        opacity: 0.8;
      }

      .card-content {
        display: flex;
        flex-direction: column;
      }

      .label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }

      .value {
        font-size: 24px;
        font-weight: 600;
      }
    }

    .balance-card mat-icon { color: #2563eb; }
    .income-card mat-icon { color: #059669; }
    .expense-card mat-icon { color: #dc2626; }
    .net-worth-card mat-icon { color: #8b5cf6; }

    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .chart-card {
      padding: 16px;
      border-radius: 12px;

      mat-card-content {
        height: 300px;
      }
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .accounts-card, .budget-card {
      padding: 16px;
      border-radius: 12px;
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
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .account-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .account-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .account-name {
      font-weight: 500;
    }

    .account-balance {
      font-weight: 600;

      &.negative {
        color: #dc2626;
      }
    }

    .budget-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .budget-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
    }

    .budget-name {
      font-weight: 500;
    }

    .budget-values {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .percentage {
      font-size: 12px;
      font-weight: 500;
      align-self: flex-end;

      &.danger {
        color: #dc2626;
      }
    }

    @media (max-width: 959px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      .bottom-grid {
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

  // Chart configurations
  cashflowChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Receitas',
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
      },
      {
        data: [],
        label: 'Despesas',
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
      },
    ],
  };

  cashflowChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  categoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };

  categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
    // Update cashflow chart
    if (dashboard.balanceHistory) {
      this.cashflowChartData = {
        labels: dashboard.balanceHistory.map((d: any) => d.date.slice(5)),
        datasets: [
          {
            data: dashboard.balanceHistory.map((d: any) => d.income),
            label: 'Receitas',
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            fill: true,
          },
          {
            data: dashboard.balanceHistory.map((d: any) => d.expense),
            label: 'Despesas',
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            fill: true,
          },
        ],
      };
    }

    // Update category chart
    if (dashboard.topExpenseCategories) {
      this.categoryChartData = {
        labels: dashboard.topExpenseCategories.map((c: any) => c.name),
        datasets: [
          {
            data: dashboard.topExpenseCategories.map((c: any) => c.amount),
            backgroundColor: dashboard.topExpenseCategories.map(
              (c: any) => c.color || '#2563eb'
            ),
          },
        ],
      };
    }
  }
}
