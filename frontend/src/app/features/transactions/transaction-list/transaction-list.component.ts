import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as TransactionActions from '@store/actions/transaction.actions';
import { selectTransactions, selectTransactionLoading, selectTransactionPagination } from '@store/selectors/transaction.selectors';
import { ImportDialogComponent } from '../../imports/import-dialog/import-dialog.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
  ],
  template: `
    <div class="transactions-container">
      <header class="page-header">
        <div>
          <h1>
            <mat-icon class="header-icon">receipt_long</mat-icon>
            Transações
          </h1>
          <p class="subtitle">Histórico de movimentações, receitas e despesas registradas</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="accent" class="import-btn" (click)="openImportDialog()">
            <mat-icon>upload_file</mat-icon> Importar Extrato
          </button>
          <a mat-flat-button color="primary" routerLink="new" class="add-btn">
            <mat-icon>add</mat-icon> Nova Transação
          </a>
        </div>
      </header>

      <!-- Filter Controls Card -->
      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar Transação</mat-label>
            <input matInput [(ngModel)]="searchTerm" (keyup.enter)="search()" placeholder="Buscar por descrição ou categoria..." />
            <mat-icon matSuffix (click)="search()" class="clickable-icon">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="type-field">
            <mat-label>Tipo de Transação</mat-label>
            <mat-select [(ngModel)]="selectedType" (selectionChange)="search()">
              <mat-option value="">Todas</mat-option>
              <mat-option value="INCOME">Receitas</mat-option>
              <mat-option value="EXPENSE">Despesas</mat-option>
              <mat-option value="TRANSFER">Transferências</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Table Container -->
      <mat-card class="table-card">
        <ng-container *ngIf="loading$ | async; else tableContent">
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Carregando transações...</span>
          </div>
        </ng-container>

        <ng-template #tableContent>
          <div class="table-responsive">
            <table mat-table [dataSource]="(transactions$ | async) ?? []" class="transactions-table">
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let t" class="date-cell">
                  {{ t.date | date: 'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let t">
                  <div class="desc-cell">
                    <div class="cat-icon" [style.backgroundColor]="(t.category?.color || '#6366f1') + '1A'" [style.color]="t.category?.color || '#6366f1'">
                      <mat-icon>{{ t.category?.icon || 'receipt' }}</mat-icon>
                    </div>
                    <div class="desc-meta">
                      <span class="desc-text">{{ t.description }}</span>
                      <span class="cat-name">{{ t.category?.name || 'Sem Categoria' }}</span>
                      <span class="installment-badge" *ngIf="t.installmentTotal">
                        Parcela {{ t.installmentIndex }}/{{ t.installmentTotal }}
                      </span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Account Column -->
              <ng-container matColumnDef="account">
                <th mat-header-cell *matHeaderCellDef>Conta</th>
                <td mat-cell *matCellDef="let t" class="account-cell">
                  <span class="account-pill">{{ t.account?.name || 'Conta Padrão' }}</span>
                </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let t" [ngClass]="'amount-' + t.type.toLowerCase()">
                  <span class="amount-badge" [ngClass]="t.type.toLowerCase()">
                    {{ t.type === 'EXPENSE' ? '-' : (t.type === 'INCOME' ? '+' : '') }}{{ t.amount | currency: 'BRL' }}
                  </span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let t" class="actions-cell">
                  <button mat-icon-button [matMenuTriggerFor]="menu" class="action-trigger">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu" class="custom-table-menu">
                    <a mat-menu-item [routerLink]="[t.id, 'edit']">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </a>
                    <button mat-menu-item (click)="deleteTransaction(t.id)">
                      <mat-icon color="warn">delete</mat-icon>
                      <span>Excluir</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="(pagination$ | async)?.totalElements || 0"
            [pageSize]="20"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            class="custom-paginator">
          </mat-paginator>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .transactions-container {
      max-width: 1300px;
      margin: 0 auto;
    }

    .header-icon {
      color: #6366f1;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filters-card {
      margin-bottom: 20px;
      padding: 16px 20px !important;

      .filters {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;

        .search-field {
          flex: 1;
          min-width: 260px;
        }

        .type-field {
          width: 220px;
        }

        .clickable-icon {
          cursor: pointer;
          color: var(--text-muted);
          &:hover { color: var(--primary-color); }
        }
      }
    }

    .table-card {
      border-radius: var(--radius-md) !important;
      overflow: hidden;
      padding: 0 !important;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 12px;
      color: var(--text-muted);
      font-size: 14px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;
    }

    .date-cell {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
      white-space: nowrap;
    }

    .desc-cell {
      display: flex;
      align-items: center;
      gap: 14px;

      .cat-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      .desc-meta {
        display: flex;
        flex-direction: column;

        .desc-text {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-main);
        }

        .cat-name {
          font-size: 12px;
          color: var(--text-muted);
        }

        .installment-badge {
          display: inline-block;
          margin-top: 2px;
          font-size: 10px;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          width: fit-content;
        }
      }
    }

    .account-cell {
      .account-pill {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        background: var(--bg-primary);
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid var(--border-subtle);
      }
    }

    .amount-badge {
      font-weight: 700;
      font-size: 15px;

      &.income {
        color: var(--income-color);
      }

      &.expense {
        color: var(--expense-color);
      }

      &.transfer {
        color: var(--transfer-color);
      }
    }

    .action-trigger {
      color: var(--text-muted);
      &:hover { color: var(--text-main); }
    }

    @media (max-width: 599px) {
      .filters {
        flex-direction: column;
        .search-field, .type-field { width: 100% !important; }
      }
    }
  `],
})
export class TransactionListComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  transactions$ = this.store.select(selectTransactions);
  loading$ = this.store.select(selectTransactionLoading);
  pagination$ = this.store.select(selectTransactionPagination);
  displayedColumns = ['date', 'description', 'account', 'amount', 'actions'];
  searchTerm = '';
  selectedType = '';

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(page = 0): void {
    this.store.dispatch(
      TransactionActions.loadTransactions({
        filter: {
          searchTerm: this.searchTerm || undefined,
          type: (this.selectedType as any) || undefined,
        },
        page,
      })
    );
  }

  search(): void {
    this.loadTransactions(0);
  }

  onPageChange(event: PageEvent): void {
    this.loadTransactions(event.pageIndex);
  }

  deleteTransaction(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      this.store.dispatch(TransactionActions.deleteTransaction({ id }));
    }
  }

  openImportDialog(): void {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTransactions();
      }
    });
  }
}
