import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InstallmentService } from '../../../core/services/installment.service';
import { InstallmentGroup } from '../../../core/models/installment.model';

@Component({
  selector: 'app-installment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Parcelamentos</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> Novo Parcelamento
        </button>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-card-content>
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p class="loading-text">Carregando parcelamentos...</p>
        </mat-card-content>
      </mat-card>

      <ng-container *ngIf="!loading">
        <mat-card *ngIf="groups.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">fact_check</mat-icon>
            <h2>Nenhum parcelamento</h2>
            <p>
              Crie um parcelamento para dividir suas compras em várias parcelas.
            </p>
            <button mat-raised-button color="primary" routerLink="new">
              Novo Parcelamento
            </button>
          </mat-card-content>
        </mat-card>

        <div class="installment-grid" *ngIf="groups.length > 0">
          <mat-card *ngFor="let group of groups" class="installment-card">
            <mat-card-header>
              <mat-card-title>{{ group.description }}</mat-card-title>
              <mat-card-subtitle>
                {{ group.accountName }} • {{ group.categoryName }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="installment-info">
                <div class="info-row">
                  <span class="label">Valor total:</span>
                  <span class="value">{{ group.totalAmount | currency: 'BRL' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Parcela:</span>
                  <span class="value">{{ group.installmentAmount | currency: 'BRL' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Progresso:</span>
                  <span class="value"
                    >{{ group.currentInstallment }}/{{
                      group.totalInstallments
                    }}</span
                  >
                </div>
                <div class="info-row">
                  <span class="label">Status:</span>
                  <mat-chip-set>
                    <mat-chip [color]="getStatusColor(group.status)" highlighted>
                      {{ getStatusLabel(group.status) }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="getProgress(group)"
                [color]="getProgressColor(group)"
              >
              </mat-progress-bar>
              <p class="progress-label">{{ getProgress(group) }}% concluído</p>
            </mat-card-content>
            <mat-card-actions align="end">
              <button
                mat-button
                color="warn"
                (click)="cancelGroup(group.id)"
                [disabled]="
                  group.status === 'CANCELLED' || group.status === 'COMPLETED'
                "
              >
                <mat-icon>cancel</mat-icon> Cancelar
              </button>
              <button mat-button color="primary" [routerLink]="[group.id]">
                <mat-icon>visibility</mat-icon> Detalhes
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </ng-container>
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
      .loading-card {
        text-align: center;
        padding: 48px;
      }
      .loading-text {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.6);
      }
      .empty-state {
        text-align: center;
        padding: 64px 24px;
      }
      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: rgba(0, 0, 0, 0.2);
        margin-bottom: 16px;
      }
      .empty-state h2 {
        margin-bottom: 8px;
      }
      .empty-state p {
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 24px;
      }
      .installment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 16px;
      }
      .installment-card {
        transition: box-shadow 0.2s;
      }
      .installment-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .installment-info {
        margin: 16px 0;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
      }
      .label {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
      .value {
        font-weight: 500;
        font-size: 14px;
      }
      .progress-label {
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 8px;
      }
      mat-progress-bar {
        margin-top: 12px;
      }
    `,
  ],
})
export class InstallmentListComponent implements OnInit {
  private installmentService = inject(InstallmentService);
  groups: InstallmentGroup[] = [];
  loading = true;

  ngOnInit() {
    this.loadInstallments();
  }

  private loadInstallments() {
    this.installmentService.list().subscribe({
      next: (res) => {
        this.groups = res.data ?? [];
        this.loading = false;
      },
      error: (_err: any) => (this.loading = false),
    });
  }

  getProgress(group: InstallmentGroup): number {
    if (group.totalInstallments === 0) return 0;
    return Math.round(
      (group.currentInstallment / group.totalInstallments) * 100
    );
  }

  getProgressColor(group: InstallmentGroup): string {
    const pct = this.getProgress(group);
    return pct >= 100 ? 'primary' : 'accent';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'COMPLETED':
        return 'accent';
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  cancelGroup(id: string) {
    if (
      confirm(
        'Tem certeza que deseja cancelar este parcelamento? As parcelas futuras serão canceladas.'
      )
    ) {
      this.installmentService
        .cancel(id)
        .subscribe({ next: () => this.loadInstallments() });
    }
  }
}
