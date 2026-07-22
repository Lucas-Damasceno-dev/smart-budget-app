import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InstallmentService } from '../../../core/services/installment.service';
import { InstallmentGroup } from '../../../core/models/installment.model';

@Component({
  selector: 'app-installment-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/installments" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Voltar
      </button>

      <div *ngIf="loading" class="loading">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Carregando...</p>
      </div>

      <ng-container *ngIf="!loading && group">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ group.description }}</mat-card-title>
            <mat-card-subtitle>
              {{ group.accountName }} • {{ group.categoryName }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Valor total</span>
                <span class="value">{{ group.totalAmount | currency: 'BRL' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Valor da parcela</span>
                <span class="value">{{ group.installmentAmount | currency: 'BRL' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Data da compra</span>
                <span class="value">{{ group.purchaseDate | date: 'dd/MM/yyyy' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Progresso</span>
                <span class="value"
                  >{{ group.currentInstallment }}/{{
                    group.totalInstallments
                  }}</span
                >
              </div>
              <div class="summary-item" *ngIf="group.interestRate > 0">
                <span class="label">Taxa de juros</span>
                <span class="value">{{ group.interestRate }}% a.m.</span>
              </div>
              <div class="summary-item">
                <span class="label">Status</span>
                <mat-chip-set>
                  <mat-chip [color]="getStatusColor(group.status)" highlighted>
                    {{ getStatusLabel(group.status) }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="progress"
              class="progress-bar"
            ></mat-progress-bar>
            <p class="progress-text">
              {{ progress }}% concluído ({{ paidCount }}/{{
                group.totalInstallments
              }}
              pagas)
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Parcelas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table
              mat-table
              [dataSource]="group.installments"
              class="installment-table"
            >
              <ng-container matColumnDef="index">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.index }}/{{ group.totalInstallments }}
                </td>
              </ng-container>

              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Vencimento</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.dueDate | date: 'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.amount | currency: 'BRL' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip-set>
                    <mat-chip
                      [color]="getChildStatusColor(item.status)"
                      [highlighted]="item.paid"
                      size="small"
                    >
                      {{ getChildStatusLabel(item.status) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                [class.paid-row]="row.paid"
                [class.pending-row]="!row.paid && row.status === 'PENDING'"
                [class.cancelled-row]="row.status === 'CANCELLED'"
              ></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 900px;
        margin: 0 auto;
      }
      .back-btn {
        margin-bottom: 16px;
      }
      .loading {
        text-align: center;
        padding: 48px;
      }
      .loading p {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.6);
      }
      .summary-card {
        margin-bottom: 24px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin: 16px 0;
      }
      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .summary-item .label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .summary-item .value {
        font-size: 18px;
        font-weight: 500;
      }
      .progress-bar {
        margin-top: 16px;
      }
      .progress-text {
        text-align: center;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 8px;
      }
      .table-card {
        margin-bottom: 24px;
      }
      .installment-table {
        width: 100%;
      }
      .paid-row {
        background-color: rgba(76, 175, 80, 0.05);
      }
      .pending-row {
      }
      .cancelled-row {
        opacity: 0.5;
        text-decoration: line-through;
      }
    `,
  ],
})
export class InstallmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private installmentService = inject(InstallmentService);
  group?: InstallmentGroup;
  loading = true;
  displayedColumns = ['index', 'dueDate', 'amount', 'status'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.installmentService.get(id).subscribe({
      next: (res) => {
        this.group = res.data;
        this.loading = false;
      },
      error: (_err: any) => (this.loading = false),
    });
  }

  get progress(): number {
    if (!this.group || this.group.totalInstallments === 0) return 0;
    return Math.round(
      (this.group.currentInstallment / this.group.totalInstallments) * 100
    );
  }

  get paidCount(): number {
    return this.group?.installments?.filter((i: { paid: boolean }) => i.paid).length ?? 0;
  }

  getStatusColor(s: string) {
    return s === 'ACTIVE'
      ? 'primary'
      : s === 'COMPLETED'
        ? 'accent'
        : 'warn';
  }

  getStatusLabel(s: string) {
    return s === 'ACTIVE'
      ? 'Ativo'
      : s === 'COMPLETED'
        ? 'Concluído'
        : 'Cancelado';
  }

  getChildStatusColor(s: string) {
    return s === 'COMPLETED' ? 'accent' : s === 'PENDING' ? 'primary' : 'warn';
  }

  getChildStatusLabel(s: string) {
    return s === 'COMPLETED'
      ? 'Pago'
      : s === 'PENDING'
        ? 'Pendente'
        : 'Cancelado';
  }
}
