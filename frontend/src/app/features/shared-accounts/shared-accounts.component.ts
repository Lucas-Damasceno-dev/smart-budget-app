import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedAccountService } from '../../core/services/shared-account.service';
import { AccountService } from '../../core/services/account.service';
import { AccountShare, ExpenseSplit } from '../../core/models/shared-account.model';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-shared-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Compartilhamento & Divisão de Despesas</h1>
        <p class="subtitle">Gerencie contas compartilhadas com família ou parceiros e divida despesas</p>
      </div>

      <mat-tab-group>
        <!-- Tab 1: Shared Accounts -->
        <mat-tab label="Contas Compartilhadas">
          <div class="tab-content">
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>Compartilhar uma Conta</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="shareForm" (ngSubmit)="onShareAccount()" class="inline-form">
                  <mat-form-field appearance="fill">
                    <mat-label>Conta</mat-label>
                    <mat-select formControlName="accountId">
                      <mat-option *ngFor="let acc of accounts" [value]="acc.id">
                        {{ acc.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="fill">
                    <mat-label>E-mail do membro</mat-label>
                    <input matInput formControlName="sharedWithEmail" placeholder="membro@exemplo.com" />
                  </mat-form-field>

                  <mat-form-field appearance="fill">
                    <mat-label>Permissão</mat-label>
                    <mat-select formControlName="permissionLevel">
                      <mat-option value="READ">Somente Leitura</mat-option>
                      <mat-option value="WRITE">Leitura e Escrita</mat-option>
                      <mat-option value="ADMIN">Administrador</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <button mat-raised-button color="primary" type="submit" [disabled]="shareForm.invalid || submittingShare">
                    <mat-icon>share</mat-icon> Compartilhar
                  </button>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Contas Compartilhadas Ativas</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="shares" class="full-width-table" *ngIf="shares.length > 0; else noShares">
                  <ng-container matColumnDef="account">
                    <th mat-header-cell *matHeaderCellDef>Conta</th>
                    <td mat-cell *matCellDef="let s">{{ s.accountName }}</td>
                  </ng-container>

                  <ng-container matColumnDef="owner">
                    <th mat-header-cell *matHeaderCellDef>Proprietário</th>
                    <td mat-cell *matCellDef="let s">{{ s.ownerEmail }}</td>
                  </ng-container>

                  <ng-container matColumnDef="sharedWith">
                    <th mat-header-cell *matHeaderCellDef>Compartilhado com</th>
                    <td mat-cell *matCellDef="let s">{{ s.sharedWithEmail }}</td>
                  </ng-container>

                  <ng-container matColumnDef="permission">
                    <th mat-header-cell *matHeaderCellDef>Permissão</th>
                    <td mat-cell *matCellDef="let s">
                      <mat-chip>{{ s.permissionLevel }}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let s">
                      <button mat-icon-button color="warn" (click)="revokeShare(s.id)" matTooltip="Revogar">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="shareColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: shareColumns;"></tr>
                </table>
                <ng-template #noShares>
                  <p class="empty-text">Nenhuma conta compartilhada no momento.</p>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab 2: Expense Splits -->
        <mat-tab label="Divisão de Despesas">
          <div class="tab-content">
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>Dividir Nova Despesa</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="splitForm" (ngSubmit)="onCreateSplit()" class="inline-form">
                  <mat-form-field appearance="fill">
                    <mat-label>Descrição</mat-label>
                    <input matInput formControlName="description" placeholder="Ex: Jantar de Sábado" />
                  </mat-form-field>

                  <mat-form-field appearance="fill">
                    <mat-label>Valor Total</mat-label>
                    <input matInput type="number" formControlName="totalAmount" placeholder="100.00" />
                  </mat-form-field>

                  <mat-form-field appearance="fill">
                    <mat-label>Parte do Devedor</mat-label>
                    <input matInput type="number" formControlName="splitAmount" placeholder="50.00" />
                  </mat-form-field>

                  <mat-form-field appearance="fill">
                    <mat-label>E-mail do Devedor</mat-label>
                    <input matInput formControlName="debtorEmail" placeholder="amigo@exemplo.com" />
                  </mat-form-field>

                  <button mat-raised-button color="accent" type="submit" [disabled]="splitForm.invalid || submittingSplit">
                    <mat-icon>call_split</mat-icon> Criar Divisão
                  </button>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Histórico de Divisões</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="splits" class="full-width-table" *ngIf="splits.length > 0; else noSplits">
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Descrição</th>
                    <td mat-cell *matCellDef="let sp">{{ sp.description }}</td>
                  </ng-container>

                  <ng-container matColumnDef="total">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let sp">{{ sp.totalAmount | currency:'BRL' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="split">
                    <th mat-header-cell *matHeaderCellDef>Divisão</th>
                    <td mat-cell *matCellDef="let sp">{{ sp.splitAmount | currency:'BRL' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="payer">
                    <th mat-header-cell *matHeaderCellDef>Pago por</th>
                    <td mat-cell *matCellDef="let sp">{{ sp.payerEmail }}</td>
                  </ng-container>

                  <ng-container matColumnDef="debtor">
                    <th mat-header-cell *matHeaderCellDef>Devedor</th>
                    <td mat-cell *matCellDef="let sp">{{ sp.debtorEmail }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let sp">
                      <mat-chip [class.settled]="sp.status === 'SETTLED'">{{ sp.status }}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let sp">
                      <button *ngIf="sp.status === 'PENDING'" mat-stroked-button color="primary" (click)="settleSplit(sp.id)">
                        Quitar
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="splitColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: splitColumns;"></tr>
                </table>
                <ng-template #noSplits>
                  <p class="empty-text">Nenhuma divisão registrada.</p>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header h1 { margin: 0; font-size: 28px; }
    .subtitle { color: rgba(0,0,0,0.6); margin-top: 4px; margin-bottom: 24px; }
    .tab-content { padding-top: 24px; display: flex; flex-direction: column; gap: 24px; }
    .inline-form { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
    .full-width-table { width: 100%; }
    .empty-text { padding: 24px; text-align: center; color: rgba(0,0,0,0.5); }
    .settled { background-color: #d1fae5 !important; color: #065f46 !important; }
  `],
})
export class SharedAccountsComponent implements OnInit {
  private sharedService = inject(SharedAccountService);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  accounts: Account[] = [];
  shares: AccountShare[] = [];
  splits: ExpenseSplit[] = [];
  submittingShare = false;
  submittingSplit = false;

  shareColumns = ['account', 'owner', 'sharedWith', 'permission', 'actions'];
  splitColumns = ['description', 'total', 'split', 'payer', 'debtor', 'status', 'actions'];

  shareForm = this.fb.group({
    accountId: ['', Validators.required],
    sharedWithEmail: ['', [Validators.required, Validators.email]],
    permissionLevel: ['READ', Validators.required],
  });

  splitForm = this.fb.group({
    description: ['', Validators.required],
    totalAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    splitAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    debtorEmail: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this.loadAccounts();
    this.loadShares();
    this.loadSplits();
  }

  loadAccounts() {
    this.accountService.list().subscribe((res: any) => {
      this.accounts = res.data ?? [];
    });
  }

  loadShares() {
    this.sharedService.getMyShares().subscribe((res: any) => {
      this.shares = res.data ?? [];
    });
  }

  loadSplits() {
    this.sharedService.getMySplits().subscribe((res: any) => {
      this.splits = res.data ?? [];
    });
  }

  onShareAccount() {
    if (this.shareForm.invalid) return;
    this.submittingShare = true;
    this.sharedService.shareAccount(this.shareForm.value as any).subscribe({
      next: () => {
        this.snackBar.open('Conta compartilhada com sucesso!', 'Fechar', { duration: 3000 });
        this.shareForm.reset({ permissionLevel: 'READ' });
        this.submittingShare = false;
        this.loadShares();
      },
      error: () => {
        this.snackBar.open('Erro ao compartilhar conta', 'Fechar', { duration: 5000 });
        this.submittingShare = false;
      },
    });
  }

  revokeShare(id: string) {
    this.sharedService.revokeShare(id).subscribe({
      next: () => {
        this.snackBar.open('Compartilhamento revogado', 'Fechar', { duration: 3000 });
        this.loadShares();
      },
      error: () => {
        this.snackBar.open('Erro ao revogar', 'Fechar', { duration: 5000 });
      },
    });
  }

  onCreateSplit() {
    if (this.splitForm.invalid) return;
    this.submittingSplit = true;
    this.sharedService.createSplit(this.splitForm.value as any).subscribe({
      next: () => {
        this.snackBar.open('Divisão registrada com sucesso!', 'Fechar', { duration: 3000 });
        this.splitForm.reset();
        this.submittingSplit = false;
        this.loadSplits();
      },
      error: () => {
        this.snackBar.open('Erro ao registrar divisão', 'Fechar', { duration: 5000 });
        this.submittingSplit = false;
      },
    });
  }

  settleSplit(id: string) {
    this.sharedService.settleSplit(id).subscribe({
      next: () => {
        this.snackBar.open('Divisão quitada!', 'Fechar', { duration: 3000 });
        this.loadSplits();
      },
      error: () => {
        this.snackBar.open('Erro ao quitar divisão', 'Fechar', { duration: 5000 });
      },
    });
  }
}
