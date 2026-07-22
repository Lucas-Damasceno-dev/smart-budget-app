import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AutomationRuleService } from '../../../core/services/automation-rule.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { Account } from '../../../core/models/account.model';
import { Category } from '../../../core/models/category.model';
import { AutomationRuleRequest } from '../../../core/models/automation-rule.model';

@Component({
  selector: 'app-rule-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/automation-rules" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Voltar
      </button>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Editar Regra' : 'Nova Regra de Automação' }}</mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode ? 'Altere os campos da regra de automação' : 'Defina uma regra para automatizar a categorização de transações' }}
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="loading-container" *ngIf="loading">
            <mat-spinner diameter="32"></mat-spinner>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="rule-form" *ngIf="!loading">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Informações Básicas</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Nome da regra</mat-label>
                    <input matInput formControlName="name" placeholder="Ex: Identificar Netflix" />
                    <mat-error *ngIf="form.get('name')?.hasError('required')">Nome é obrigatório</mat-error>
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Descrição (opcional)</mat-label>
                    <textarea matInput formControlName="description" rows="2" placeholder="Descreva o propósito da regra"></textarea>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Condição</mat-card-title>
                <mat-card-subtitle>Quando esta condição for verdadeira, a ação será executada</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row three-columns">
                  <mat-form-field appearance="fill">
                    <mat-label>Campo</mat-label>
                    <mat-select formControlName="conditionField">
                      <mat-option value="DESCRIPTION">Descrição</mat-option>
                      <mat-option value="AMOUNT">Valor</mat-option>
                      <mat-option value="CATEGORY_NAME">Categoria</mat-option>
                    </mat-select>
                    <mat-error *ngIf="form.get('conditionField')?.hasError('required')">Campo obrigatório</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Operador</mat-label>
                    <mat-select formControlName="conditionOperator">
                      <mat-option value="CONTAINS">Contém</mat-option>
                      <mat-option value="EQUALS">Igual</mat-option>
                      <mat-option value="STARTS_WITH">Começa com</mat-option>
                      <mat-option value="ENDS_WITH">Termina com</mat-option>
                      <mat-option value="GREATER_THAN">Maior que</mat-option>
                      <mat-option value="LESS_THAN">Menor que</mat-option>
                    </mat-select>
                    <mat-error *ngIf="form.get('conditionOperator')?.hasError('required')">Operador obrigatório</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Valor</mat-label>
                    <input matInput formControlName="conditionValue" placeholder="Ex: netflix" />
                    <mat-error *ngIf="form.get('conditionValue')?.hasError('required')">Valor obrigatório</mat-error>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Ação</mat-card-title>
                <mat-card-subtitle>O que fazer quando a condição for atendida</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row two-columns">
                  <mat-form-field appearance="fill">
                    <mat-label>Definir categoria</mat-label>
                    <mat-select formControlName="setCategoryId">
                      <mat-option [value]="null">Não alterar</mat-option>
                      <mat-option *ngFor="let cat of expenseCategories" [value]="cat.id">
                        <span [style.color]="cat.color">{{ cat.icon ? cat.icon + ' ' : '' }}</span>
                        {{ cat.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Definir conta</mat-label>
                    <mat-select formControlName="setAccountId">
                      <mat-option [value]="null">Não alterar</mat-option>
                      <mat-option *ngFor="let acc of accounts" [value]="acc.id">
                        {{ acc.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Definir descrição</mat-label>
                    <input matInput formControlName="setDescription" placeholder="Nova descrição (deixe vazio para não alterar)" />
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Tags (separadas por vírgula)</mat-label>
                    <input matInput formControlName="setTags" placeholder="Ex: assinatura, streaming" />
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-slide-toggle formControlName="setAsTransfer" color="primary">
                    Marcar como transferência
                  </mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Configurações</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row two-columns">
                  <mat-form-field appearance="fill">
                    <mat-label>Prioridade</mat-label>
                    <input matInput type="number" formControlName="priority" min="0" max="999" />
                    <mat-hint>Menor número = maior prioridade</mat-hint>
                  </mat-form-field>
                  <div class="toggle-wrapper">
                    <mat-slide-toggle formControlName="enabled" color="primary">
                      Regra ativa
                    </mat-slide-toggle>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/automation-rules">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
                {{ submitting ? 'Salvando...' : (isEditMode ? 'Atualizar Regra' : 'Criar Regra') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; }
    .loading-container { display: flex; justify-content: center; padding: 32px; }
    .rule-form { margin-top: 16px; }
    .section-card { margin-bottom: 16px; }
    .form-row { margin-bottom: 16px; }
    .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .three-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    .toggle-wrapper { display: flex; align-items: center; padding-top: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
    @media (max-width: 599px) {
      .page-container { padding: 16px; }
      .two-columns, .three-columns { grid-template-columns: 1fr; }
    }
  `],
})
export class RuleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private ruleService = inject(AutomationRuleService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);

  accounts: Account[] = [];
  expenseCategories: Category[] = [];
  submitting = false;
  loading = false;
  isEditMode = false;
  ruleId: string | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    conditionField: ['DESCRIPTION', Validators.required],
    conditionOperator: ['CONTAINS', Validators.required],
    conditionValue: ['', Validators.required],
    setCategoryId: [null as string | null],
    setAccountId: [null as string | null],
    setDescription: [''],
    setTags: [''],
    setAsTransfer: [false],
    priority: [0],
    enabled: [true],
  });

  ngOnInit() {
    this.loadAccounts();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.ruleId = id;
      this.loadRule(id);
    }
  }

  private loadAccounts() {
    this.accountService.list().subscribe((res: any) => {
      this.accounts = res.data ?? [];
    });
  }

  private loadCategories() {
    this.categoryService.getByType('EXPENSE').subscribe((res: any) => {
      this.expenseCategories = res.data ?? [];
    });
  }

  private loadRule(id: string) {
    this.loading = true;
    this.ruleService.getById(id).subscribe({
      next: (rule) => {
        this.form.patchValue({
          name: rule.name,
          description: rule.description || '',
          conditionField: rule.conditionField,
          conditionOperator: rule.conditionOperator,
          conditionValue: rule.conditionValue,
          setCategoryId: rule.setCategoryId || null,
          setAccountId: rule.setAccountId || null,
          setDescription: rule.setDescription || '',
          setTags: rule.setTags || '',
          setAsTransfer: rule.setAsTransfer,
          priority: rule.priority,
          enabled: rule.enabled,
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar regra', 'Fechar', { duration: 5000 });
        this.router.navigate(['/automation-rules']);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const request: AutomationRuleRequest = {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
      conditionField: this.form.value.conditionField!,
      conditionOperator: this.form.value.conditionOperator!,
      conditionValue: this.form.value.conditionValue!,
      setCategoryId: this.form.value.setCategoryId || undefined,
      setAccountId: this.form.value.setAccountId || undefined,
      setDescription: this.form.value.setDescription || undefined,
      setTags: this.form.value.setTags || undefined,
      setAsTransfer: this.form.value.setAsTransfer ?? false,
      priority: this.form.value.priority ?? 0,
      enabled: this.form.value.enabled ?? true,
    };

    const obs = this.isEditMode && this.ruleId
      ? this.ruleService.update(this.ruleId, request)
      : this.ruleService.create(request);

    obs.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Regra atualizada com sucesso!' : 'Regra criada com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
        this.router.navigate(['/automation-rules']);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar regra', 'Fechar', { duration: 5000 });
        this.submitting = false;
      },
    });
  }
}