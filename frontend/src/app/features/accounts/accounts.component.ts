import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountService } from '@core/services/account.service';
import { Account, AccountType } from '@core/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="accounts-container">
      <header class="page-header">
        <div>
          <h1>
            <mat-icon class="header-icon">account_balance_wallet</mat-icon>
            Minhas Contas & Carteiras
          </h1>
          <p class="subtitle">Gerencie suas contas bancárias, cartões de crédito e investimentos</p>
        </div>
        <button mat-flat-button color="primary" class="add-account-btn" (click)="openForm()">
          <mat-icon>add</mat-icon> Nova Conta
        </button>
      </header>

      <!-- Loading Spinner -->
      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="44"></mat-spinner>
        <span>Carregando suas contas...</span>
      </div>

      <!-- Accounts Card Grid -->
      <div class="accounts-grid" *ngIf="!loading">
        <mat-card *ngFor="let account of accounts" class="account-card">
          <div class="card-top" [style.borderTopColor]="account.color || '#6366f1'">
            <div class="header-main">
              <div class="account-icon" [style.backgroundColor]="(account.color || '#6366f1') + '20'" [style.color]="account.color || '#6366f1'">
                <mat-icon>{{ getIcon(account.type) }}</mat-icon>
              </div>
              <div class="account-meta">
                <h3>{{ account.name }}</h3>
                <span class="account-type">{{ getTypeName(account.type) }}</span>
              </div>
            </div>
            <div class="header-actions">
              <button mat-icon-button (click)="editAccount(account)" class="action-btn" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteAccount(account.id)" class="action-btn" matTooltip="Excluir">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <div class="card-body">
            <span class="balance-label">Saldo Atual</span>
            <div class="balance-value" [class.negative]="account.currentBalance < 0">
              {{ account.currentBalance | currency: 'BRL' }}
            </div>
            <div class="bank-pill" *ngIf="account.bankName">
              <mat-icon>account_balance</mat-icon>
              <span>{{ account.bankName }}</span>
            </div>

            <ng-container *ngIf="account.goalBalance">
              <div class="goal-section">
                <div class="goal-labels">
                  <span>Meta de Saldo</span>
                  <strong>{{ account.goalBalance | currency: 'BRL' }}</strong>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="account.goalProgress || 0"></div>
                </div>
              </div>
            </ng-container>
          </div>
        </mat-card>
      </div>

      <!-- Add/Edit Account Form Modal/Card -->
      <mat-card class="form-card" *ngIf="showForm">
        <div class="form-card-header">
          <h2>{{ editingId ? 'Editar Conta' : 'Nova Conta Bancária' }}</h2>
          <button mat-icon-button (click)="closeForm()"><mat-icon>close</mat-icon></button>
        </div>

        <form [formGroup]="form" (ngSubmit)="saveAccount()" class="account-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nome da Conta</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Conta Principal Nubank" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Conta</mat-label>
              <mat-select formControlName="type">
                <mat-option value="CHECKING">Conta Corrente</mat-option>
                <mat-option value="SAVINGS">Poupança</mat-option>
                <mat-option value="INVESTMENT">Investimentos</mat-option>
                <mat-option value="CREDIT_CARD">Cartão de Crédito</mat-option>
                <mat-option value="CASH">Dinheiro em Espécie</mat-option>
                <mat-option value="DIGITAL_WALLET">Carteira Digital</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Saldo Inicial (R$)</mat-label>
              <input matInput type="number" formControlName="initialBalance" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nome da Instituição / Banco</mat-label>
              <input matInput formControlName="bankName" placeholder="Ex: Itaú, Nubank, XP" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cor de Identificação</mat-label>
              <input matInput type="color" formControlName="color" />
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Meta de Saldo (R$ - Opcional)</mat-label>
              <input matInput type="number" formControlName="goalBalance" placeholder="0.00" />
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="closeForm()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
              {{ editingId ? 'Atualizar Conta' : 'Salvar Conta' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .accounts-container {
      max-width: 1300px;
      margin: 0 auto;
    }

    .header-icon {
      color: #6366f1;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      gap: 16px;
      color: var(--text-muted);
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .account-card {
      border-radius: var(--radius-md) !important;
      overflow: hidden;

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-top: 5px solid #6366f1;
        background: var(--bg-primary);

        .header-main {
          display: flex;
          align-items: center;
          gap: 14px;

          .account-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            mat-icon {
              font-size: 22px;
              width: 22px;
              height: 22px;
            }
          }

          .account-meta {
            h3 {
              font-size: 16px;
              font-weight: 700;
              color: var(--text-main);
              margin: 0;
            }

            .account-type {
              font-size: 12px;
              color: var(--text-muted);
            }
          }
        }

        .header-actions {
          display: flex;
          gap: 4px;
          .action-btn {
            color: var(--text-muted);
            &:hover { color: var(--text-main); }
          }
        }
      }

      .card-body {
        padding: 20px;
        display: flex;
        flex-direction: column;

        .balance-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;

        }

        .balance-value {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 12px;

          &.negative {
            color: var(--expense-color);
          }
        }

        .bank-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-primary);
          padding: 4px 10px;
          border-radius: 8px;
          width: fit-content;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }

        .goal-section {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);

          .goal-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 6px;
            color: var(--text-muted);

            strong {
              color: var(--text-main);
            }
          }

          .progress-bar {
            height: 6px;
            background: var(--border-subtle);
            border-radius: 3px;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
              border-radius: 3px;
            }
          }
        }
      }
    }

    .form-card {
      padding: 28px !important;
      border-radius: var(--radius-lg) !important;
      margin-top: 32px;

      .form-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
          font-size: 20px;
          font-weight: 700;
        }
      }

      .account-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .form-row {
        display: flex;
        gap: 16px;

        mat-form-field { flex: 1; }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }
    }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `],
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  accounts: Account[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    type: ['CHECKING', Validators.required],
    initialBalance: [0, Validators.required],
    bankName: [''],
    color: ['#6366f1'],
    goalBalance: [null],
  });

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (res) => {
        this.accounts = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openForm(): void {
    this.editingId = null;
    this.form.reset({
      type: 'CHECKING',
      initialBalance: 0,
      color: '#6366f1',
    });
    this.showForm = true;
  }

  editAccount(account: Account): void {
    this.editingId = account.id;
    this.form.patchValue({
      name: account.name,
      type: account.type,
      initialBalance: account.initialBalance,
      bankName: account.bankName,
      color: account.color || '#6366f1',
      goalBalance: account.goalBalance,
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveAccount(): void {
    if (this.form.invalid) return;
    const req = this.form.value;
    if (this.editingId) {
      this.accountService.updateAccount(this.editingId, req).subscribe(() => {
        this.closeForm();
        this.loadAccounts();
      });
    } else {
      this.accountService.createAccount(req).subscribe(() => {
        this.closeForm();
        this.loadAccounts();
      });
    }
  }

  deleteAccount(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      this.accountService.deleteAccount(id).subscribe(() => this.loadAccounts());
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      CHECKING: 'account_balance',
      SAVINGS: 'savings',
      INVESTMENT: 'trending_up',
      CREDIT_CARD: 'credit_card',
      CASH: 'wallet',
      DIGITAL_WALLET: 'phone_android',
    };
    return icons[type] || 'account_balance_wallet';
  }

  getTypeName(type: string): string {
    const names: Record<string, string> = {
      CHECKING: 'Conta Corrente',
      SAVINGS: 'Poupança',
      INVESTMENT: 'Investimentos',
      CREDIT_CARD: 'Cartão de Crédito',
      CASH: 'Dinheiro em Espécie',
      DIGITAL_WALLET: 'Carteira Digital',
    };
    return names[type] || type;
  }
}
