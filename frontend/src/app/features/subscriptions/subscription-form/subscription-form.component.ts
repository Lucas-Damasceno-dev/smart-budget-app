import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { Account } from '../../../core/models/account.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-subscription-form',
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
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/subscriptions" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Voltar
      </button>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{
            isEditing ? 'Editar' : 'Nova'
          }}
            Assinatura</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="sub-form"
          >
            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Nome</mat-label>
                <input
                  matInput
                  formControlName="name"
                  placeholder="Ex: Netflix"
                />
                <mat-error>Nome é obrigatório</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="fill">
                <mat-label>Valor</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="amount"
                  placeholder="55,90"
                />
                <span matTextPrefix>R$&nbsp;</span>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Ciclo de cobrança</mat-label>
                <mat-select formControlName="billingCycle">
                  <mat-option value="MONTHLY">Mensal</mat-option>
                  <mat-option value="QUARTERLY">Trimestral</mat-option>
                  <mat-option value="SEMI_ANNUAL">Semestral</mat-option>
                  <mat-option value="YEARLY">Anual</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="fill">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId">
                  <mat-option [value]="null">Nenhuma</mat-option>
                  <mat-option
                    *ngFor="let cat of expenseCategories"
                    [value]="cat.id"
                  >
                    {{ cat.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Conta padrão</mat-label>
                <mat-select formControlName="accountId">
                  <mat-option [value]="null">Nenhuma</mat-option>
                  <mat-option
                    *ngFor="let acc of accounts"
                    [value]="acc.id"
                  >
                    {{ acc.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Próximo vencimento</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="nextBillingDate"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="fill">
                <mat-label>Cor</mat-label>
                <input
                  matInput
                  formControlName="color"
                  placeholder="#e50914"
                />
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>URL</mat-label>
                <input
                  matInput
                  formControlName="url"
                  placeholder="https://netflix.com"
                />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Descrição</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  rows="2"
                ></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-slide-toggle formControlName="autoCreateTransaction">
                Criar transação automaticamente no vencimento
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/subscriptions">
                Cancelar
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || submitting"
              >
                {{
                  submitting
                    ? 'Salvando...'
                    : isEditing
                      ? 'Atualizar'
                      : 'Criar'
                }}
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
      .sub-form {
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
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
      }
    `,
  ],
})
export class SubscriptionFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private subService = inject(SubscriptionService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);

  accounts: Account[] = [];
  expenseCategories: Category[] = [];
  submitting = false;
  isEditing = false;
  editId?: string;

  form = this.fb.group({
    name: ['', Validators.required],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    billingCycle: ['MONTHLY', Validators.required],
    categoryId: [null as string | null],
    accountId: [null as string | null],
    nextBillingDate: [null as Date | null, Validators.required],
    color: [''],
    url: [''],
    description: [''],
    autoCreateTransaction: [true],
  });

  ngOnInit() {
    this.accountService.list().subscribe((res: any) => {
      this.accounts = res.data ?? [];
    });
    this.categoryService.getByType('EXPENSE').subscribe((res: any) => {
      this.expenseCategories = res.data ?? [];
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.editId = id;
      this.subService.get(id).subscribe((res: any) => {
        if (res.data) {
          this.form.patchValue({
            ...res.data,
            nextBillingDate: res.data.nextBillingDate
              ? new Date(res.data.nextBillingDate)
              : null,
          });
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const request = {
      ...this.form.value,
      nextBillingDate: this.form.value.nextBillingDate
        ?.toISOString()
        .split('T')[0],
    };

    const obs =
      this.isEditing && this.editId
        ? this.subService.update(this.editId, request as any)
        : this.subService.create(request as any);

    obs.subscribe({
      next: () => {
        this.snackBar.open(
          `Assinatura ${this.isEditing ? 'atualizada' : 'criada'} com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
        this.router.navigate(['/subscriptions']);
      },
      error: (_err: any) => {
        this.snackBar.open('Erro ao salvar assinatura', 'Fechar', {
          duration: 5000,
        });
        this.submitting = false;
      },
    });
  }
}
