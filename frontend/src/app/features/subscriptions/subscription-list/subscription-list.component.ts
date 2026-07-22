import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Assinaturas</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon> Nova Assinatura
          </button>
        </div>
      </div>

      <div class="summary-cards" *ngIf="summary">
        <mat-card class="summary-card">
          <mat-card-content>
            <span class="summary-label">Assinaturas ativas</span>
            <span class="summary-value">{{ summary.activeCount }}</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="summary-card">
          <mat-card-content>
            <span class="summary-label">Custo mensal</span>
            <span class="summary-value">{{
              summary.totalMonthlyCost | currency: 'BRL'
            }}</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="summary-card">
          <mat-card-content>
            <span class="summary-label">Custo anual</span>
            <span class="summary-value">{{
              summary.totalAnnualCost | currency: 'BRL'
            }}</span>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <table
            mat-table
            [dataSource]="subscriptions"
            matSort
            class="sub-table"
          >
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
              <td mat-cell *matCellDef="let sub">
                <div class="sub-name">
                  <span
                    class="color-dot"
                    [style.background]="sub.color || '#999'"
                  ></span>
                  {{ sub.name }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Valor</th>
              <td mat-cell *matCellDef="let sub">
                {{ sub.amount | currency: 'BRL' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="billingCycle">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Ciclo</th>
              <td mat-cell *matCellDef="let sub">
                {{ getCycleLabel(sub.billingCycle) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="monthlyEquivalent">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                Equiv. Mensal
              </th>
              <td mat-cell *matCellDef="let sub">
                {{ sub.monthlyEquivalent | currency: 'BRL' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="nextBillingDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                Próximo
              </th>
              <td mat-cell *matCellDef="let sub">
                {{ sub.nextBillingDate | date: 'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let sub">
                <mat-chip-set>
                  <mat-chip
                    [color]="getStatusColor(sub.status)"
                    size="small"
                    [highlighted]="sub.status === 'ACTIVE'"
                  >
                    {{ getStatusLabel(sub.status) }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let sub">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button
                    mat-menu-item
                    *ngIf="sub.status === 'ACTIVE'"
                    (click)="pauseSubscription(sub.id)"
                  >
                    <mat-icon>pause_circle</mat-icon> Pausar
                  </button>
                  <button
                    mat-menu-item
                    *ngIf="sub.status === 'PAUSED'"
                    (click)="resumeSubscription(sub.id)"
                  >
                    <mat-icon>play_circle</mat-icon> Retomar
                  </button>
                  <button mat-menu-item [routerLink]="[sub.id, 'edit']">
                    <mat-icon>edit</mat-icon> Editar
                  </button>
                  <button
                    mat-menu-item
                    (click)="deleteSubscription(sub.id)"
                  >
                    <mat-icon>delete</mat-icon> Cancelar
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
            ></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
      }
      .header-actions {
        display: flex;
        gap: 8px;
      }
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      .summary-card mat-card-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .summary-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .summary-value {
        font-size: 24px;
        font-weight: 500;
      }
      .table-card {
        overflow-x: auto;
      }
      .sub-table {
        width: 100%;
      }
      .sub-name {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }
    `,
  ],
})
export class SubscriptionListComponent implements OnInit {
  private subService = inject(SubscriptionService);
  subscriptions: Subscription[] = [];
  summary: any;
  displayedColumns = [
    'name',
    'amount',
    'billingCycle',
    'monthlyEquivalent',
    'nextBillingDate',
    'status',
    'actions',
  ];

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.subService.list().subscribe((res: any) => {
      this.subscriptions = res.data ?? [];
    });
    this.subService.getSummary().subscribe((res: any) => {
      this.summary = res.data;
    });
  }

  getCycleLabel(c: string) {
    const map: Record<string, string> = {
      MONTHLY: 'Mensal',
      QUARTERLY: 'Trimestral',
      SEMI_ANNUAL: 'Semestral',
      YEARLY: 'Anual',
    };
    return map[c] || c;
  }

  getStatusColor(s: string) {
    return s === 'ACTIVE' ? 'primary' : s === 'PAUSED' ? 'accent' : 'warn';
  }

  getStatusLabel(s: string) {
    return s === 'ACTIVE'
      ? 'Ativa'
      : s === 'PAUSED'
        ? 'Pausada'
        : s === 'CANCELLED'
          ? 'Cancelada'
          : 'Expirada';
  }

  pauseSubscription(id: string) {
    this.subService.pause(id).subscribe({ next: () => this.loadData() });
  }

  resumeSubscription(id: string) {
    this.subService.resume(id).subscribe({ next: () => this.loadData() });
  }

  deleteSubscription(id: string) {
    if (confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      this.subService.cancel(id).subscribe({ next: () => this.loadData() });
    }
  }
}
