import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AccountService } from '@core/services/account.service';
import { Account } from '@core/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule],
  template: `
    <div class="accounts-container">
      <header class="page-header">
        <h1>Minhas Contas</h1>
        <button mat-raised-button color="primary"><mat-icon>add</mat-icon> Nova Conta</button>
      </header>
      <ng-container *ngIf="loading; else accountsList">
        <div class="loading"><mat-spinner></mat-spinner></div>
      </ng-container>
      <ng-template #accountsList>
        <div class="accounts-grid">
          <mat-card *ngFor="let account of accounts" class="account-card">
            <div class="card-header" [style.borderColor]="account.color || '#2563eb'">
              <div class="account-icon" [style.backgroundColor]="account.color || '#2563eb'">
                <mat-icon>{{ getIcon(account.type) }}</mat-icon>
              </div>
              <div class="account-info">
                <h3>{{ account.name }}</h3>
                <span class="account-type">{{ getTypeName(account.type) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="balance" [class.negative]="account.currentBalance < 0">
                {{ account.currentBalance | currency: 'BRL' }}
              </div>
              <ng-container *ngIf="account.goalBalance">
                <div class="goal">
                  <span>Meta: {{ account.goalBalance | currency: 'BRL' }}</span>
                  <div class="progress-bar">
                    <div class="progress" [style.width.%]="account.goalProgress || 0"></div>
                  </div>
                </div>
              </ng-container>
            </div>
          </mat-card>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .accounts-container { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .account-card { border-radius: 12px; overflow: hidden; }
    .card-header { display: flex; align-items: center; gap: 16px; padding: 16px; border-left: 4px solid; }
    .account-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .account-icon mat-icon { color: white; }
    .account-info h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .account-type { font-size: 12px; color: rgba(0, 0, 0, 0.6); }
    .card-body { padding: 16px; }
    .balance { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .balance.negative { color: #dc2626; }
    .goal { font-size: 12px; color: rgba(0, 0, 0, 0.6); }
    .progress-bar { height: 6px; background: #e5e7eb; border-radius: 3px; margin-top: 4px; }
    .progress { height: 100%; background: #059669; border-radius: 3px; }
  `],
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  accounts: Account[] = [];
  loading = true;

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (res) => { this.accounts = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = { CHECKING: 'account_balance', SAVINGS: 'savings', INVESTMENT: 'trending_up', CREDIT_CARD: 'credit_card', CASH: 'wallet', DIGITAL_WALLET: 'phone_android' };
    return icons[type] || 'account_balance_wallet';
  }

  getTypeName(type: string): string {
    const names: Record<string, string> = { CHECKING: 'Conta Corrente', SAVINGS: 'Poupança', INVESTMENT: 'Investimentos', CREDIT_CARD: 'Cartão de Crédito', CASH: 'Dinheiro', DIGITAL_WALLET: 'Carteira Digital' };
    return names[type] || type;
  }
}
