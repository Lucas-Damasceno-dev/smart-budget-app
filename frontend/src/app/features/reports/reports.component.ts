import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { ReportService } from '@core/services/report.service';
import { ReportResponse } from '@core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  template: `
    <div class="reports-container">
      <header class="page-header">
        <div>
          <h1>Relatórios Financeiros</h1>
          <p class="subtitle">Análise avançada de receitas, despesas e curva Pareto 80/20</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" (click)="exportCsv()">
            <mat-icon>download</mat-icon> Exportar CSV
          </button>
          <button mat-stroked-button (click)="printPdf()">
            <mat-icon>print</mat-icon> Imprimir / PDF
          </button>
        </div>
      </header>

      <!-- Filter Controls -->
      <mat-card class="filter-card">
        <div class="filter-row">
          <div class="quick-filters">
            <mat-chip-listbox [(ngModel)]="activeFilter" (change)="onFilterChipChange($event.value)">
              <mat-chip-option value="month" [selected]="activeFilter === 'month'">Este Mês</mat-chip-option>
              <mat-chip-option value="last30" [selected]="activeFilter === 'last30'">Últimos 30 Dias</mat-chip-option>
              <mat-chip-option value="year" [selected]="activeFilter === 'year'">Este Ano</mat-chip-option>
              <mat-chip-option value="custom" [selected]="activeFilter === 'custom'">Personalizado</mat-chip-option>
            </mat-chip-listbox>
          </div>

          <div class="date-inputs" *ngIf="activeFilter === 'custom'">
            <mat-form-field appearance="outline" density="compact">
              <mat-label>Data Inicial</mat-label>
              <input matInput type="date" [(ngModel)]="startDate" (change)="loadReport()" />
            </mat-form-field>

            <mat-form-field appearance="outline" density="compact">
              <mat-label>Data Final</mat-label>
              <input matInput type="date" [(ngModel)]="endDate" (change)="loadReport()" />
            </mat-form-field>
          </div>
        </div>
      </mat-card>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="report-content" *ngIf="!loading && report">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <mat-card class="kpi-card income">
            <div class="kpi-header">
              <mat-icon>arrow_upward</mat-icon>
              <span>Receitas Totais</span>
            </div>
            <div class="kpi-value">{{ report.summary.totalIncome | currency: 'BRL' }}</div>
          </mat-card>

          <mat-card class="kpi-card expense">
            <div class="kpi-header">
              <mat-icon>arrow_downward</mat-icon>
              <span>Despesas Totais</span>
            </div>
            <div class="kpi-value">{{ report.summary.totalExpenses | currency: 'BRL' }}</div>
            <div class="kpi-sub" *ngIf="report.comparison">
              <span [class.neg]="report.comparison.changePercentage > 0" [class.pos]="report.comparison.changePercentage <= 0">
                {{ report.comparison.changePercentage > 0 ? '+' : '' }}{{ report.comparison.changePercentage | number:'1.1-1' }}% vs período anterior
              </span>
            </div>
          </mat-card>

          <mat-card class="kpi-card net">
            <div class="kpi-header">
              <mat-icon>account_balance</mat-icon>
              <span>Saldo Líquido</span>
            </div>
            <div class="kpi-value" [class.neg]="report.summary.netBalance < 0">
              {{ report.summary.netBalance | currency: 'BRL' }}
            </div>
          </mat-card>

          <mat-card class="kpi-card avg">
            <div class="kpi-header">
              <mat-icon>functions</mat-icon>
              <span>Média por Transação</span>
            </div>
            <div class="kpi-value">{{ report.summary.averageTransactionAmount | currency: 'BRL' }}</div>
            <div class="kpi-sub">{{ report.summary.transactionCount }} transações</div>
          </mat-card>
        </div>

        <!-- Pareto Analysis Card -->
        <mat-card class="pareto-card">
          <mat-card-header>
            <mat-icon color="primary">pie_chart_outline</mat-icon>
            <mat-card-title>Análise de Pareto (Regra 80/20 de Gastos)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="pareto-desc">
              Os primeiros 20% das categorias de maior gasto concentram
              <strong>{{ report.paretoAnalysis.top20PercentOfTotal | number:'1.0-1' }}%</strong>
              do total despendido no período ({{ report.paretoAnalysis.top20PercentTotal | currency:'BRL' }}).
            </p>

            <div class="pareto-grid">
              <div class="chart-box">
                <canvas baseChart [data]="paretoChartData" [options]="paretoChartOptions" type="bar"></canvas>
              </div>

              <div class="table-box">
                <table mat-table [dataSource]="report.paretoAnalysis.items" class="mat-elevation-z0">
                  <ng-container matColumnDef="category">
                    <th mat-header-cell *matHeaderCellDef>Categoria</th>
                    <td mat-cell *matCellDef="let element">{{ element.categoryName }}</td>
                  </ng-container>

                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Valor</th>
                    <td mat-cell *matCellDef="let element">{{ element.amount | currency:'BRL' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="cumulative">
                    <th mat-header-cell *matHeaderCellDef>Acumulado %</th>
                    <td mat-cell *matCellDef="let element">
                      <span [class.highlight]="element.cumulativePercentage <= 80">
                        {{ element.cumulativePercentage | number:'1.0-1' }}%
                      </span>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['category', 'amount', 'cumulative']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['category', 'amount', 'cumulative']"></tr>
                </table>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Charts Grid: Cashflow & Monthly Trends -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Fluxo de Caixa Diário Acumulado</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="dailyChartData" [options]="lineChartOptions" type="line"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Distribuição por Categoria</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="categoryChartData" [options]="doughnutChartOptions" type="doughnut"></canvas>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin-top: 4px; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }

    .filter-card { padding: 16px 24px; margin-bottom: 24px; border-radius: 12px; }
    .filter-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .date-inputs { display: flex; gap: 12px; }

    .loading-container { display: flex; justify-content: center; padding: 64px; }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 20px; border-radius: 12px; }
    .kpi-header { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .kpi-value.neg { color: #dc2626; }
    .kpi-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .kpi-sub .neg { color: #dc2626; font-weight: 600; }
    .kpi-sub .pos { color: #059669; font-weight: 600; }

    .kpi-card.income .kpi-header mat-icon { color: #059669; }
    .kpi-card.expense .kpi-header mat-icon { color: #dc2626; }

    .pareto-card { padding: 20px; border-radius: 12px; margin-bottom: 24px; }
    .pareto-desc { color: #475569; font-size: 14px; margin-bottom: 20px; }
    .pareto-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 24px; }
    .chart-box { height: 320px; }
    .table-box { max-height: 320px; overflow-y: auto; }

    .highlight { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-weight: 600; }

    .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    .chart-card { padding: 20px; border-radius: 12px; mat-card-content { height: 300px; } }

    @media (max-width: 959px) {
      .pareto-grid { grid-template-columns: 1fr; }
      .charts-row { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 16px; }
    }
  `],
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  loading = true;
  activeFilter = 'month';
  startDate = '';
  endDate = '';
  report: ReportResponse | null = null;

  paretoChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  paretoChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  dailyChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  categoryChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  ngOnInit(): void {
    this.setDateRangePreset('month');
    this.loadReport();
  }

  onFilterChipChange(val: string): void {
    if (!val) return;
    this.activeFilter = val;
    if (val !== 'custom') {
      this.setDateRangePreset(val);
      this.loadReport();
    }
  }

  setDateRangePreset(preset: string): void {
    const today = new Date();
    if (preset === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
    } else if (preset === 'last30') {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
    } else if (preset === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
    }
  }

  loadReport(): void {
    if (!this.startDate || !this.endDate) return;
    this.loading = true;
    this.reportService.getReport(this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.report = res.data;
        this.updateCharts(res.data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  exportCsv(): void {
    if (!this.startDate || !this.endDate) return;
    this.reportService.exportCsv(this.startDate, this.endDate).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-financeflow-${this.startDate}-${this.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  printPdf(): void {
    window.print();
  }

  private updateCharts(data: ReportResponse): void {
    // Pareto Chart
    if (data.paretoAnalysis && data.paretoAnalysis.items) {
      this.paretoChartData = {
        labels: data.paretoAnalysis.items.map((i) => i.categoryName),
        datasets: [
          {
            data: data.paretoAnalysis.items.map((i) => i.amount),
            label: 'Gastos (R$)',
            backgroundColor: '#2563eb',
          },
        ],
      };
    }

    // Daily Cashflow
    if (data.dailyCashflow) {
      this.dailyChartData = {
        labels: data.dailyCashflow.map((d) => d.date.slice(5)),
        datasets: [
          {
            data: data.dailyCashflow.map((d) => d.cumulativeBalance),
            label: 'Saldo Acumulado',
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
          },
        ],
      };
    }

    // Category Breakdown
    if (data.categoryBreakdown) {
      const expenses = data.categoryBreakdown.filter((c) => c.type === 'EXPENSE');
      this.categoryChartData = {
        labels: expenses.map((c) => c.categoryName),
        datasets: [
          {
            data: expenses.map((c) => c.amount),
            backgroundColor: expenses.map((c) => c.color || '#2563eb'),
          },
        ],
      };
    }
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
