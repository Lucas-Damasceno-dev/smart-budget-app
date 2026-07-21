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
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as TransactionActions from '@store/actions/transaction.actions';
import { selectTransactions, selectTransactionLoading, selectTransactionPagination } from '@store/selectors/transaction.selectors';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, FormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatMenuModule],
  template: `
    <div class="transactions-container">
      <header class="page-header">
        <h1>Transações</h1>
        <a mat-raised-button color="primary" routerLink="new"><mat-icon>add</mat-icon> Nova Transação</a>
      </header>
      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>Buscar</mat-label><input matInput [(ngModel)]="searchTerm" (keyup.enter)="search()" placeholder="Descrição..." /><mat-icon matSuffix>search</mat-icon></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Tipo</mat-label><mat-select [(ngModel)]="selectedType" (selectionChange)="search()"><mat-option value="">Todos</mat-option><mat-option value="INCOME">Receita</mat-option><mat-option value="EXPENSE">Despesa</mat-option><mat-option value="TRANSFER">Transferência</mat-option></mat-select></mat-form-field>
        </div>
      </mat-card>
      <mat-card class="table-card">
        <ng-container *ngIf="loading$ | async; else tableContent">
          <div class="loading-container"><mat-spinner diameter="40"></mat-spinner></div>
        </ng-container>
        <ng-template #tableContent>
          <table mat-table [dataSource]="(transactions$ | async) ?? []" class="transactions-table">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Data</th><td mat-cell *matCellDef="let t">{{ t.date | date: 'dd/MM/yyyy' }}</td></ng-container>
            <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Descrição</th><td mat-cell *matCellDef="let t"><div class="desc-cell"><span class="cat-icon" [style.backgroundColor]="t.category.color || '#2563eb'"><mat-icon>{{ t.category.icon || 'receipt' }}</mat-icon></span><div><span class="desc">{{ t.description }}</span><span class="cat-name">{{ t.category.name }}</span></div></div></td></ng-container>
            <ng-container matColumnDef="account"><th mat-header-cell *matHeaderCellDef>Conta</th><td mat-cell *matCellDef="let t">{{ t.account.name }}</td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Valor</th><td mat-cell *matCellDef="let t" [ngClass]="'amount-' + t.type.toLowerCase()">{{ t.type === 'EXPENSE' ? '-' : '' }}{{ t.amount | currency: 'BRL' }}</td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let t"><button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button><mat-menu #menu="matMenu"><a mat-menu-item [routerLink]="[t.id, 'edit']"><mat-icon>edit</mat-icon><span>Editar</span></a><button mat-menu-item (click)="deleteTransaction(t.id)"><mat-icon color="warn">delete</mat-icon><span>Excluir</span></button></mat-menu></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [length]="(pagination$ | async)?.totalElements || 0" [pageSize]="20" [pageSizeOptions]="[10, 20, 50]" (page)="onPageChange($event)"></mat-paginator>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .transactions-container { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .filters-card { margin-bottom: 16px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 200px; }
    .table-card { border-radius: 12px; overflow: hidden; }
    .loading-container { display: flex; justify-content: center; padding: 48px; }
    .transactions-table { width: 100%; }
    .desc-cell { display: flex; align-items: center; gap: 12px; }
    .cat-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .cat-icon mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
    .desc { display: block; font-weight: 500; }
    .cat-name { display: block; font-size: 12px; color: rgba(0, 0, 0, 0.6); }
    .amount-income { color: #059669; font-weight: 600; }
    .amount-expense { color: #dc2626; font-weight: 600; }
    .amount-transfer { color: #2563eb; font-weight: 600; }
    @media (max-width: 599px) { .filters { flex-direction: column; } .filters mat-form-field { width: 100%; } }
  `],
})
export class TransactionListComponent implements OnInit {
  private store = inject(Store);
  transactions$ = this.store.select(selectTransactions);
  loading$ = this.store.select(selectTransactionLoading);
  pagination$ = this.store.select(selectTransactionPagination);
  displayedColumns = ['date', 'description', 'account', 'amount', 'actions'];
  searchTerm = '';
  selectedType = '';

  ngOnInit(): void { this.loadTransactions(); }
  loadTransactions(page = 0): void { this.store.dispatch(TransactionActions.loadTransactions({ filter: { searchTerm: this.searchTerm || undefined, type: this.selectedType as any || undefined }, page })); }
  search(): void { this.loadTransactions(0); }
  onPageChange(event: PageEvent): void { this.loadTransactions(event.pageIndex); }
  deleteTransaction(id: string): void { if (confirm('Tem certeza que deseja excluir esta transação?')) { this.store.dispatch(TransactionActions.deleteTransaction({ id })); } }
}
