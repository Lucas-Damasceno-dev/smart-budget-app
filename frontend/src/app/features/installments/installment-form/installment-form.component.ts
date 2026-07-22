import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InstallmentService } from '../../../core/services/installment.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { Account } from '../../../core/models/account.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-installment-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/installments" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Voltar
      </button>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Novo Parcelamento</mat-card-title>
          <mat-card-subtitle
            >Divida uma compra em várias parcelas</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="installment-form"
          >
            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Descrição</mat-label>
                <input
                  matInput
                  formControlName="description"
                  placeholder="Ex: iPhone 15 Pro Max"
                />
                <mat-error
                  *ngIf="form.get('description')?.hasError('required')"
                  >Descrição é obrigatória</mat-error
                >
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="fill">
                <mat-label>Valor total</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="totalAmount"
                  placeholder="4999,00"
                />
                <span matTextPrefix>R$&nbsp;</span>
                <mat-error
                  *ngIf="form.get('totalAmount')?.hasError('required')"
                  >Valor é obrigatório</mat-error
                >
                <mat-error *ngIf="form.get('totalAmount')?.hasError('min')"
                  >Valor deve ser positivo</mat-error
                >
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Número de parcelas</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="totalInstallments"
                  placeholder="12"
                  min="2"
                  max="60"
                />
                <mat-error
                  *ngIf="
                    form.get('totalInstallments')?.hasError('required')
                  "
                  >Número é obrigatório</mat-error
                >
                <mat-error
                  *ngIf="form.get('totalInstallments')?.hasError('min')"
                  >Mínimo 2 parcelas</mat-error
                >
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Conta</mat-label>
                <mat-select formControlName="accountId">
                  <mat-option *ngFor="let acc of accounts" [value]="acc.id">
                    {{ acc.name }} ({{ acc.type }})
                  </mat-option>
                </mat-select>
                <mat-error
                  *ngIf="form.get('accountId')?.hasError('required')"
                  >Conta é obrigatória</mat-error
                >
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="fill">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId">
                  <mat-option
                    *ngFor="let cat of expenseCategories"
                    [value]="cat.id"
                  >
                    {{ cat.name }}
                  </mat-option>
                </mat-select>
                <mat-error
                  *ngIf="form.get('categoryId')?.hasError('required')"
                  >Categoria é obrigatória</mat-error
                >
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Data da compra</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="purchaseDate"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error
                  *ngIf="form.get('purchaseDate')?.hasError('required')"
                  >Data é obrigatória</mat-error
                >
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Taxa de juros (% a.m.)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="interestRate"
                  placeholder="0 = sem juros"
                />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Observações</mat-label>
                <textarea
                  matInput
                  formControlName="notes"
                  rows="3"
                ></textarea>
              </mat-form-field>
            </div>

            <div
              class="summary-box"
              *ngIf="form.value.totalAmount && form.value.totalInstallments"
            >
              <p><strong>Resumo:</strong></p>
              <p>
                {{ form.value.totalInstallments }}x de
                {{ installmentAmount | currency: 'BRL' }}
              </p>
              <p *ngIf="(form.value.interestRate ?? 0) > 0">
                Juros: {{ form.value.interestRate }}% a.m. (Tabela Price)
              </p>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/installments">
                Cancelar
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || submitting"
              >
                {{ submitting ? 'Criando...' : 'Criar Parcelamento' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 700px;
        margin: 0 auto;
      }
      .back-btn {
        margin-bottom: 16px;
      }
      .installment-form {
        margin-top: 16px;
      }
      .form-row {
        margin-bottom: 16px;
      }
      .two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .full-width {
        width: 100%;
      }
      .summary-box {
        background: rgba(0, 0, 0, 0.03);
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .summary-box p {
        margin: 4px 0;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
      }
    `,
  ],
})
export class InstallmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private installmentService = inject(InstallmentService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);

  accounts: Account[] = [];
  expenseCategories: Category[] = [];
  submitting = false;

  form = this.fb.group({
    description: ['', Validators.required],
    totalAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    totalInstallments: [
      null as number | null,
      [Validators.required, Validators.min(2), Validators.max(60)],
    ],
    accountId: ['', Validators.required],
    categoryId: ['', Validators.required],
    purchaseDate: [null as Date | null, Validators.required],
    interestRate: [0],
    notes: [''],
  });

  get installmentAmount(): number {
    const total = this.form.value.totalAmount ?? 0;
    const n = this.form.value.totalInstallments ?? 1;
    return total / n;
  }

  ngOnInit() {
    this.accountService.list().subscribe((res: any) => {
      this.accounts = res.data ?? [];
    });
    this.categoryService.getByType('EXPENSE').subscribe((res: any) => {
      this.expenseCategories = res.data ?? [];
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const request = {
      ...this.form.value,
      purchaseDate: this.form.value.purchaseDate?.toISOString().split('T')[0],
      interestRate: this.form.value.interestRate ?? 0,
    };

    this.installmentService.create(request as any).subscribe({
      next: () => {
        this.snackBar.open('Parcelamento criado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.router.navigate(['/installments']);
      },
      error: (_err: any) => {
        this.snackBar.open('Erro ao criar parcelamento', 'Fechar', {
          duration: 5000,
        });
        this.submitting = false;
      },
    });
  }
}
