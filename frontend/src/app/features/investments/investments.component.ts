import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { InvestmentService } from '@core/services/investment.service';
import { AccountService } from '@core/services/account.service';
import { Account } from '@core/models/account.model';
import {
  Investment,
  InvestmentSummary,
  InvestmentType,
} from '@core/models/investment.model';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    BaseChartDirective,
  ],
  template: `
    <div class="investments-container">
      <header class="page-header">
        <div>
          <h1>Gestão de Investimentos</h1>
          <p class="subtitle">Acompanhe sua carteira de ativos, rentabilidade e proventos</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Novo Ativo
        </button>
      </header>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- Summary Cards -->
        <div class="summary-grid" *ngIf="summary">
          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>savings</mat-icon> Total Investido</div>
            <div class="kpi-value">{{ summary.totalInvested | currency:'BRL' }}</div>
          </mat-card>

          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>show_chart</mat-icon> Valor Atual da Carteira</div>
            <div class="kpi-value primary">{{ summary.currentValue | currency:'BRL' }}</div>
          </mat-card>

          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>trending_up</mat-icon> Lucro / Prejuízo</div>
            <div class="kpi-value" [class.pos]="summary.totalProfitLoss >= 0" [class.neg]="summary.totalProfitLoss < 0">
              {{ summary.totalProfitLoss | currency:'BRL' }}
              <span class="pct">({{ summary.totalProfitLossPercentage > 0 ? '+' : '' }}{{ summary.totalProfitLossPercentage | number:'1.2-2' }}%)</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>payments</mat-icon> Proventos Recebidos</div>
            <div class="kpi-value accent">{{ summary.totalDividends | currency:'BRL' }}</div>
          </mat-card>
        </div>

        <div class="main-grid">
          <!-- Investment Table Card -->
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title>Seus Ativos ({{ investments.length }})</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="investments" class="mat-elevation-z0" *ngIf="investments.length > 0; else emptyState">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Ativo / Ticker</th>
                  <td mat-cell *matCellDef="let element">
                    <strong>{{ element.name }}</strong>
                    <div class="ticker" *ngIf="element.ticker">{{ element.ticker }} • {{ getTypeLabel(element.type) }}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Qtd.</th>
                  <td mat-cell *matCellDef="let element">{{ element.quantity | number:'1.0-4' }}</td>
                </ng-container>

                <ng-container matColumnDef="avgPrice">
                  <th mat-header-cell *matHeaderCellDef>Preço Médio</th>
                  <td mat-cell *matCellDef="let element">{{ element.averagePrice | currency:'BRL' }}</td>
                </ng-container>

                <ng-container matColumnDef="currentValue">
                  <th mat-header-cell *matHeaderCellDef>Valor Atual</th>
                  <td mat-cell *matCellDef="let element">
                    <strong>{{ element.currentValue | currency:'BRL' }}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="profitLoss">
                  <th mat-header-cell *matHeaderCellDef>Lucro/Prejuízo</th>
                  <td mat-cell *matCellDef="let element" [class.pos]="element.profitLoss >= 0" [class.neg]="element.profitLoss < 0">
                    {{ element.profitLoss | currency:'BRL' }}
                    <small>({{ element.profitLossPercentage > 0 ? '+' : '' }}{{ element.profitLossPercentage | number:'1.1-1' }}%)</small>
                  </td>
                </ng-container>

                <ng-container matColumnDef="dividends">
                  <th mat-header-cell *matHeaderCellDef>Proventos</th>
                  <td mat-cell *matCellDef="let element">{{ element.dividendsReceived | currency:'BRL' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let element">
                    <button mat-icon-button color="primary" (click)="editInvestment(element)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteInvestment(element.id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>

              <ng-template #emptyState>
                <div class="empty-box">
                  <mat-icon>account_balance</mat-icon>
                  <p>Nenhum ativo cadastrado ainda.</p>
                  <button mat-stroked-button color="primary" (click)="openForm()">Cadastrar Primeiro Ativo</button>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <!-- Distribution Chart Card -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Alocação de Ativos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-wrapper">
                <canvas baseChart [data]="allocationChartData" [options]="doughnutChartOptions" type="doughnut"></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Add/Edit Inline Form Drawer -->
        <mat-card class="form-card" *ngIf="showForm">
          <mat-card-header>
            <mat-card-title>{{ editingId ? 'Editar Ativo' : 'Novo Ativo' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveInvestment()" class="investment-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nome do Ativo</mat-label>
                  <input matInput formControlName="name" placeholder="Ex: Petrobás PN" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="STOCK">Ações</mat-option>
                    <mat-option value="FII">FIIs (Fundos Imobiliários)</mat-option>
                    <mat-option value="TREASURY_BOND">Tesouro Direto</mat-option>
                    <mat-option value="FIXED_INCOME">Renda Fixa / CDB</mat-option>
                    <mat-option value="CRYPTO">Criptomoedas</mat-option>
                    <mat-option value="ETF">ETFs</mat-option>
                    <mat-option value="FUND">Fundos de Investimento</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ticker / Código</mat-label>
                  <input matInput formControlName="ticker" placeholder="Ex: PETR4" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Quantidade</mat-label>
                  <input matInput type="number" formControlName="quantity" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Preço Médio (R$)</mat-label>
                  <input matInput type="number" formControlName="averagePrice" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Preço Atual (R$)</mat-label>
                  <input matInput type="number" formControlName="currentPrice" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Proventos Recebidos (R$)</mat-label>
                  <input matInput type="number" formControlName="dividendsReceived" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Conta de Origem</mat-label>
                  <mat-select formControlName="accountId">
                    <mat-option *ngFor="let acc of accounts" [value]="acc.id">{{ acc.name }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="closeForm()">Cancelar</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                  {{ editingId ? 'Atualizar' : 'Salvar Ativo' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .investments-container { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin-top: 4px; font-size: 14px; }

    .loading-container { display: flex; justify-content: center; padding: 64px; }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 20px; border-radius: 12px; }
    .kpi-header { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .kpi-value.primary { color: #2563eb; }
    .kpi-value.accent { color: #7c3aed; }
    .kpi-value.pos { color: #059669; }
    .kpi-value.neg { color: #dc2626; }
    .pct { font-size: 14px; margin-left: 4px; font-weight: 500; }

    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
    .table-card { padding: 20px; border-radius: 12px; }
    .chart-card { padding: 20px; border-radius: 12px; }
    .chart-wrapper { height: 300px; }

    .ticker { font-size: 12px; color: #64748b; margin-top: 2px; }
    .pos { color: #059669; }
    .neg { color: #dc2626; }

    .empty-box { text-align: center; padding: 48px; color: #64748b; mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; } }

    .form-card { padding: 20px; border-radius: 12px; margin-top: 24px; }
    .investment-form { margin-top: 16px; }
    .form-row { display: flex; gap: 16px; margin-bottom: 8px; mat-form-field { flex: 1; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }

    @media (max-width: 959px) {
      .main-grid { grid-template-columns: 1fr; }
      .form-row { flex-direction: column; gap: 0; }
    }
  `],
})
export class InvestmentsComponent implements OnInit {
  private investmentService = inject(InvestmentService);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  loading = true;
  investments: Investment[] = [];
  summary: InvestmentSummary | null = null;
  accounts: Account[] = [];

  displayedColumns = ['name', 'quantity', 'avgPrice', 'currentValue', 'profitLoss', 'dividends', 'actions'];

  showForm = false;
  editingId: string | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    type: ['STOCK', Validators.required],
    ticker: [''],
    quantity: [1, [Validators.required, Validators.min(0.0001)]],
    averagePrice: [10, [Validators.required, Validators.min(0.01)]],
    currentPrice: [10],
    dividendsReceived: [0],
    accountId: ['', Validators.required],
  });

  allocationChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  ngOnInit(): void {
    this.loadData();
    this.accountService.getAccounts().subscribe((res) => (this.accounts = res.data));
  }

  loadData(): void {
    this.loading = true;
    this.investmentService.getInvestments().subscribe({
      next: (res) => {
        this.investments = res.data;
        this.loadSummary();
      },
      error: () => (this.loading = false),
    });
  }

  loadSummary(): void {
    this.investmentService.getSummary().subscribe({
      next: (res) => {
        this.summary = res.data;
        this.updateChart(res.data);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openForm(): void {
    this.editingId = null;
    this.form.reset({
      type: 'STOCK',
      quantity: 1,
      averagePrice: 10,
      currentPrice: 10,
      dividendsReceived: 0,
      accountId: this.accounts.length > 0 ? this.accounts[0].id : '',
    });
    this.showForm = true;
  }

  editInvestment(inv: Investment): void {
    this.editingId = inv.id;
    this.form.patchValue({
      name: inv.name,
      type: inv.type,
      ticker: inv.ticker,
      quantity: inv.quantity,
      averagePrice: inv.averagePrice,
      currentPrice: inv.currentPrice,
      dividendsReceived: inv.dividendsReceived,
      accountId: inv.account ? inv.account.id : '',
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveInvestment(): void {
    if (this.form.invalid) return;
    const req = this.form.value;
    if (this.editingId) {
      this.investmentService.updateInvestment(this.editingId, req).subscribe(() => {
        this.closeForm();
        this.loadData();
      });
    } else {
      this.investmentService.createInvestment(req).subscribe(() => {
        this.closeForm();
        this.loadData();
      });
    }
  }

  deleteInvestment(id: string): void {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      this.investmentService.deleteInvestment(id).subscribe(() => this.loadData());
    }
  }

  getTypeLabel(type: InvestmentType): string {
    const map: Record<InvestmentType, string> = {
      STOCK: 'Ações',
      FII: 'FIIs',
      TREASURY_BOND: 'Tesouro Direto',
      FIXED_INCOME: 'Renda Fixa',
      CRYPTO: 'Cripto',
      ETF: 'ETF',
      FUND: 'Fundo',
    };
    return map[type] || type;
  }

  private updateChart(summary: InvestmentSummary): void {
    if (!summary || !summary.distribution) return;
    this.allocationChartData = {
      labels: summary.distribution.map((d) => this.getTypeLabel(d.type as InvestmentType)),
      datasets: [
        {
          data: summary.distribution.map((d) => d.amount),
          backgroundColor: ['#2563eb', '#059669', '#7c3aed', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'],
        },
      ],
    };
  }
}
