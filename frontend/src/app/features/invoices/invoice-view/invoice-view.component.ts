import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  InvoiceService,
  InvoiceData,
} from '../../../core/services/invoice.service';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDatepickerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Fatura do Cartão</h1>
      </div>

      <div class="card-selector" *ngIf="creditCards.length > 0">
        <mat-form-field appearance="fill">
          <mat-label>Selecione o cartão</mat-label>
          <mat-select
            [value]="selectedCardId"
            (selectionChange)="selectCard($event.value)"
          >
            <mat-option
              *ngFor="let card of creditCards"
              [value]="card.id"
            >
              {{ card.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Carregando fatura...</p>
      </div>

      <ng-container *ngIf="!loading && invoice">
        <mat-card class="invoice-summary">
          <mat-card-content>
            <div class="invoice-period">
              <span
                >Período:
                {{ invoice.cycleStart | date: 'dd/MM/yyyy' }}
                -
                {{ invoice.cycleEnd | date: 'dd/MM/yyyy' }}</span
              >
              <span class="due-date"
                >Vencimento:
                <strong>{{
                  invoice.dueDate | date: 'dd/MM/yyyy'
                }}</strong></span
              >
            </div>
            <div class="invoice-values">
              <div class="value-item">
                <span class="label">Total da fatura</span>
                <span class="value total">{{
                  invoice.totalAmount | currency: 'BRL'
                }}</span>
              </div>
              <div class="value-item" *ngIf="invoice.totalPaid > 0">
                <span class="label">Pago</span>
                <span class="value paid"
                  >-{{ invoice.totalPaid | currency: 'BRL' }}</span
                >
              </div>
              <div class="value-item">
                <span class="label">Saldo restante</span>
                <span class="value remaining">{{
                  invoice.remainingBalance | currency: 'BRL'
                }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div
          class="pay-section"
          *ngIf="invoice.remainingBalance > 0 && sourceAccounts.length > 0"
        >
          <mat-card>
            <mat-card-content>
              <div class="pay-row">
                <mat-form-field appearance="fill">
                  <mat-label>Pagar da conta</mat-label>
                  <mat-select #payAccount>
                    <mat-option
                      *ngFor="let acc of sourceAccounts"
                      [value]="acc.id"
                    >
                      {{ acc.name }} ({{
                        acc.currentBalance | currency: 'BRL'
                      }})
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="payInvoice(payAccount.value)"
                  [disabled]="!payAccount.value"
                >
                  <mat-icon>payment</mat-icon> Pagar Fatura
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="items-card">
          <mat-card-header>
            <mat-card-title
              >Lançamentos ({{ invoice.items.length }})</mat-card-title
            >
          </mat-card-header>
          <mat-card-content>
            <table
              mat-table
              [dataSource]="invoice.items"
              class="items-table"
            >
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.date | date: 'dd/MM' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let item">
                  <div class="item-name">{{ item.description }}</div>
                  <div class="item-category">{{ item.categoryName }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.amount | currency: 'BRL' }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['date', 'description', 'amount']"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: ['date', 'description', 'amount']"
              ></tr>

              <tr class="mat-row" *matNoDataRow>
                <td
                  class="mat-cell"
                  colspan="3"
                  style="text-align:center;padding:24px;"
                >
                  Nenhum lançamento neste período
                </td>
              </tr>
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
      .page-header {
        margin-bottom: 24px;
      }
      .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
      }
      .card-selector {
        margin-bottom: 24px;
      }
      .loading {
        text-align: center;
        padding: 48px;
      }
      .loading p {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.6);
      }
      .invoice-summary {
        margin-bottom: 24px;
      }
      .invoice-period {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
      .due-date strong {
        color: rgba(0, 0, 0, 0.87);
      }
      .invoice-values {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      .value-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .value-item .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba(0, 0, 0, 0.6);
      }
      .value-item .value {
        font-size: 22px;
        font-weight: 500;
      }
      .value.total {
        color: #f44336;
      }
      .value.paid {
        color: #4caf50;
      }
      .value.remaining {
        color: #2196f3;
      }
      .pay-section {
        margin-bottom: 24px;
      }
      .pay-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .pay-row mat-form-field {
        flex: 1;
      }
      .items-card {
        overflow-x: auto;
      }
      .items-table {
        width: 100%;
      }
      .item-name {
        font-weight: 500;
      }
      .item-category {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }
    `,
  ],
})
export class InvoiceViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private invoiceService = inject(InvoiceService);
  private accountService = inject(AccountService);

  creditCards: Account[] = [];
  sourceAccounts: Account[] = [];
  selectedCardId?: string;
  invoice?: InvoiceData;
  loading = false;

  ngOnInit() {
    this.accountService.list().subscribe((res: any) => {
      const accounts: Account[] = res.data ?? [];
      this.creditCards = accounts.filter((a: Account) => a.type === 'CREDIT_CARD');
      this.sourceAccounts = accounts.filter(
        (a: Account) => a.type === 'CHECKING' || a.type === 'SAVINGS'
      );

      const cardId = this.route.snapshot.paramMap.get('id');
      if (cardId && this.creditCards.find((c) => c.id === cardId)) {
        this.selectedCardId = cardId;
      } else if (this.creditCards.length > 0) {
        this.selectedCardId = this.creditCards[0].id;
      }

      if (this.selectedCardId) {
        this.loadInvoice();
      }
    });
  }

  selectCard(id: string) {
    this.selectedCardId = id;
    this.loadInvoice();
  }

  private loadInvoice() {
    if (!this.selectedCardId) return;
    this.loading = true;
    this.invoiceService.getInvoice(this.selectedCardId).subscribe({
      next: (res) => {
        this.invoice = res.data;
        this.loading = false;
      },
      error: (_err: any) => (this.loading = false),
    });
  }

  payInvoice(sourceAccountId: string) {
    if (!this.selectedCardId || !sourceAccountId) return;
    this.invoiceService
      .payInvoice(this.selectedCardId, sourceAccountId)
      .subscribe({
        next: () => {
          this.snackBar.open('Fatura paga com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.loadInvoice();
        },
        error: (_err: any) => {
          this.snackBar.open('Erro ao pagar fatura', 'Fechar', {
            duration: 5000,
          });
        },
      });
  }
}
