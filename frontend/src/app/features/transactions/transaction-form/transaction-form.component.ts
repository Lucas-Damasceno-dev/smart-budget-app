import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { AccountService } from '@core/services/account.service';
import { TransactionService } from '@core/services/transaction.service';
import { Account } from '@core/models/account.model';
import { Category } from '@core/models/category.model';
import * as TransactionActions from '@store/actions/transaction.actions';
import { selectTransactionLoading } from '@store/selectors/transaction.selectors';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSlideToggleModule],
  template: `
    <div class="form-container">
      <header class="page-header"><h1>{{ isEdit ? 'Editar' : 'Nova' }} Transação</h1></header>
      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="type-selector">
            <button type="button" class="type-btn income" [class.active]="form.get('type')?.value === 'INCOME'" (click)="setType('INCOME')"><mat-icon>trending_up</mat-icon> Receita</button>
            <button type="button" class="type-btn expense" [class.active]="form.get('type')?.value === 'EXPENSE'" (click)="setType('EXPENSE')"><mat-icon>trending_down</mat-icon> Despesa</button>
            <button type="button" class="type-btn transfer" [class.active]="form.get('type')?.value === 'TRANSFER'" (click)="setType('TRANSFER')"><mat-icon>swap_horiz</mat-icon> Transferência</button>
          </div>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Valor</mat-label><input matInput formControlName="amount" type="number" step="0.01" /><span matPrefix>R$&nbsp;</span></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Descrição</mat-label><input matInput formControlName="description" /></mat-form-field>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Data</mat-label><input matInput [matDatepicker]="picker" formControlName="date" /><mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle><mat-datepicker #picker></mat-datepicker></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Conta</mat-label><mat-select formControlName="accountId"><mat-option *ngFor="let account of accounts" [value]="account.id">{{ account.name }}</mat-option></mat-select></mat-form-field>
          </div>
          <ng-container *ngIf="form.get('type')?.value === 'TRANSFER'">
            <mat-form-field appearance="outline" class="full-width"><mat-label>Conta Destino</mat-label><mat-select formControlName="destinationAccountId"><mat-option *ngFor="let account of accounts" [value]="account.id">{{ account.name }}</mat-option></mat-select></mat-form-field>
          </ng-container>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Categoria</mat-label><mat-select formControlName="categoryId"><mat-option *ngFor="let category of filteredCategories" [value]="category.id">{{ category.name }}</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Observações</mat-label><textarea matInput formControlName="notes" rows="3"></textarea></mat-form-field>
          <div class="actions"><a mat-button routerLink="/transactions">Cancelar</a><button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || (loading$ | async)">
            <ng-container *ngIf="loading$ | async; else actionText"><mat-spinner diameter="20"></mat-spinner></ng-container>
            <ng-template #actionText>{{ isEdit ? 'Salvar' : 'Criar' }}</ng-template>
          </button></div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 600px; margin: 0 auto; }
    .form-card { padding: 32px; border-radius: 12px; }
    .type-selector { display: flex; gap: 12px; margin-bottom: 24px; }
    .type-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .type-btn:hover { background: #f9fafb; }
    .type-btn.active.income { border-color: #059669; background: #ecfdf5; color: #059669; }
    .type-btn.active.expense { border-color: #dc2626; background: #fef2f2; color: #dc2626; }
    .type-btn.active.transfer { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px; }
    @media (max-width: 599px) { .type-selector { flex-direction: column; } .row { flex-direction: column; } }
  `],
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private http = inject(HttpClient);

  form: FormGroup = this.fb.group({ type: ['EXPENSE', Validators.required], amount: [null, [Validators.required, Validators.min(0.01)]], description: ['', Validators.required], date: [new Date(), Validators.required], accountId: ['', Validators.required], destinationAccountId: [''], categoryId: ['', Validators.required], notes: [''] });
  loading$ = this.store.select(selectTransactionLoading);
  isEdit = false;
  transactionId: string | null = null;
  accounts: Account[] = [];
  categories: Category[] = [];

  get filteredCategories(): Category[] { return this.categories.filter((c) => c.type === this.form.get('type')?.value); }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.transactionId;
    this.accountService.getAccounts().subscribe((r) => (this.accounts = r.data));
    this.http.get<any>(`${environment.apiUrl}/categories`).subscribe((r) => (this.categories = r.data));
    if (this.isEdit && this.transactionId) {
      this.transactionService.getTransaction(this.transactionId).subscribe((r) => {
        const t = r.data;
        this.form.patchValue({ type: t.type, amount: t.amount, description: t.description, date: new Date(t.date), accountId: t.account.id, destinationAccountId: t.destinationAccount?.id, categoryId: t.category.id, notes: t.notes });
      });
    }
  }

  setType(type: string): void { this.form.patchValue({ type, categoryId: '' }); }

  onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const req = { ...v, date: v.date.toISOString().split('T')[0] };
    if (this.isEdit && this.transactionId) { this.store.dispatch(TransactionActions.updateTransaction({ id: this.transactionId, request: req })); }
    else { this.store.dispatch(TransactionActions.createTransaction({ request: req })); }
    this.router.navigate(['/transactions']);
  }
}
