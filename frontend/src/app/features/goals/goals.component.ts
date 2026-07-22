import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GoalService } from '@core/services/goal.service';
import { Goal, GoalStatus } from '@core/models/goal.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="goals-container">
      <header class="page-header">
        <div>
          <h1>Metas & Objetivos Financeiros</h1>
          <p class="subtitle">Defina alvos de economia, acompanhe seu progresso e conquiste seus sonhos</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Nova Meta
        </button>
      </header>

      <!-- Loading Spinner -->
      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>flag</mat-icon> Total em Metas</div>
            <div class="kpi-value">{{ totalTargetAmount | currency:'BRL' }}</div>
          </mat-card>

          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>savings</mat-icon> Total Guardado</div>
            <div class="kpi-value primary">{{ totalCurrentAmount | currency:'BRL' }}</div>
          </mat-card>

          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>task_alt</mat-icon> Metas Concluídas</div>
            <div class="kpi-value accent">{{ completedGoalsCount }} de {{ goals.length }}</div>
          </mat-card>

          <mat-card class="kpi-card">
            <div class="kpi-header"><mat-icon>donut_large</mat-icon> Progresso Médio</div>
            <div class="kpi-value pos">{{ overallProgress | number:'1.0-1' }}%</div>
          </mat-card>
        </div>

        <!-- Goals Grid -->
        <div class="goals-grid" *ngIf="goals.length > 0; else emptyState">
          <mat-card *ngFor="let g of goals" class="goal-card" [class.completed]="g.status === 'COMPLETED'">
            <div class="card-top">
              <div class="goal-icon" [style.backgroundColor]="g.color || '#2563eb'">
                <mat-icon>{{ g.icon || 'flag' }}</mat-icon>
              </div>
              <div class="goal-info">
                <h3>{{ g.name }}</h3>
                <span class="deadline">Prazo: {{ g.targetDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="goal-actions">
                <button mat-icon-button color="primary" (click)="editGoal(g)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteGoal(g.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <div class="card-progress">
              <div class="amount-row">
                <span class="cur">{{ g.currentAmount | currency:'BRL' }}</span>
                <span class="tar">meta {{ g.targetAmount | currency:'BRL' }}</span>
              </div>

              <div class="bar-box">
                <div class="custom-bar">
                  <div class="custom-fill" [style.width.%]="g.progressPercentage > 100 ? 100 : g.progressPercentage" [style.backgroundColor]="g.color || '#2563eb'"></div>
                </div>
                <span class="pct-badge">{{ g.progressPercentage | number:'1.0-1' }}%</span>
              </div>

              <div class="rem-row" *ngIf="g.status !== 'COMPLETED'">
                <span>Faltam <strong>{{ g.remainingAmount | currency:'BRL' }}</strong></span>
                <button mat-stroked-button color="primary" class="deposit-btn" (click)="openDeposit(g)">
                  <mat-icon>add_circle</mat-icon> Aportar
                </button>
              </div>

              <div class="completed-badge" *ngIf="g.status === 'COMPLETED'">
                <mat-icon>check_circle</mat-icon> Meta Concluída com Sucesso! 🎉
              </div>
            </div>
          </mat-card>
        </div>

        <ng-template #emptyState>
          <mat-card class="empty-card">
            <mat-icon>flag</mat-icon>
            <h3>Nenhuma meta financeira cadastrada</h3>
            <p>Crie sua primeira meta de economia (ex: Reserva de Emergência, Viagem, Compra de Imóvel).</p>
            <button mat-flat-button color="primary" (click)="openForm()">Cadastrar Primeira Meta</button>
          </mat-card>
        </ng-template>

        <!-- Deposit Prompt Modal / Inline Card -->
        <mat-card class="form-card deposit-card" *ngIf="selectedGoalForDeposit">
          <mat-card-header>
            <mat-card-title>Aportar na Meta: {{ selectedGoalForDeposit.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="deposit-form">
              <mat-form-field appearance="outline">
                <mat-label>Valor do Aporte (R$)</mat-label>
                <input matInput type="number" [(ngModel)]="depositAmount" placeholder="Ex: 500.00" />
              </mat-form-field>
              <div class="form-actions">
                <button mat-button (click)="selectedGoalForDeposit = null">Cancelar</button>
                <button mat-flat-button color="primary" (click)="submitDeposit()" [disabled]="!depositAmount || depositAmount <= 0">
                  Confirmar Aporte
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Create/Edit Form Drawer -->
        <mat-card class="form-card" *ngIf="showForm">
          <mat-card-header>
            <mat-card-title>{{ editingId ? 'Editar Meta' : 'Nova Meta Financeira' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveGoal()" class="goal-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nome da Meta</mat-label>
                  <input matInput formControlName="name" placeholder="Ex: Reserva de Emergência" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Valor Alvo (R$)</mat-label>
                  <input matInput type="number" formControlName="targetAmount" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Valor Inicial Já Guardado (R$)</mat-label>
                  <input matInput type="number" formControlName="currentAmount" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Data Limite / Prazo</mat-label>
                  <input matInput type="date" formControlName="targetDate" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Cor de Identificação</mat-label>
                  <input matInput type="color" formControlName="color" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ícone</mat-label>
                  <mat-select formControlName="icon">
                    <mat-option value="shield">Escudo (Reserva)</mat-option>
                    <mat-option value="flight">Avião (Viagem)</mat-option>
                    <mat-option value="laptop">Notebook (Tecnologia)</mat-option>
                    <mat-option value="directions_car">Carro (Veículo)</mat-option>
                    <mat-option value="home">Casa (Imóvel)</mat-option>
                    <mat-option value="school">Estudos (Educação)</mat-option>
                    <mat-option value="flag">Bandeira (Outros)</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="closeForm()">Cancelar</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                  {{ editingId ? 'Atualizar Meta' : 'Salvar Meta' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .goals-container { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin-top: 4px; font-size: 14px; }

    .loading { display: flex; justify-content: center; padding: 48px; }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 20px; border-radius: 12px; }
    .kpi-header { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .kpi-value.primary { color: #2563eb; }
    .kpi-value.accent { color: #7c3aed; }
    .kpi-value.pos { color: #059669; }

    .goals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
    .goal-card { padding: 20px; border-radius: 16px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .goal-card:hover { transform: translateY(-2px); }
    .goal-card.completed { background: #f0fdf4; border: 1px solid #bbf7d0; }

    .card-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .goal-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
    .goal-info { flex: 1; }
    .goal-info h3 { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
    .deadline { font-size: 12px; color: #64748b; }
    .goal-actions { display: flex; gap: 4px; }

    .amount-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .amount-row .cur { font-size: 22px; font-weight: 700; color: #0f172a; }
    .amount-row .tar { font-size: 13px; color: #64748b; }

    .bar-box { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .custom-bar { flex: 1; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .custom-fill { height: 100%; border-radius: 5px; transition: width 0.4s ease; }
    .pct-badge { font-size: 13px; font-weight: 700; color: #0f172a; min-width: 44px; text-align: right; }

    .rem-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #64748b; }
    .deposit-btn { height: 36px; line-height: 36px; border-radius: 20px; }

    .completed-badge { color: #166534; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px; }

    .empty-card { text-align: center; padding: 64px; border-radius: 16px; color: #64748b; mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; } }

    .form-card { padding: 24px; border-radius: 16px; margin-top: 32px; }
    .goal-form { margin-top: 16px; }
    .form-row { display: flex; gap: 16px; margin-bottom: 8px; mat-form-field { flex: 1; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .deposit-card { max-width: 500px; }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `],
})
export class GoalsComponent implements OnInit {
  private goalService = inject(GoalService);
  private fb = inject(FormBuilder);

  goals: Goal[] = [];
  loading = true;
  showForm = false;
  editingId: string | null = null;
  selectedGoalForDeposit: Goal | null = null;
  depositAmount: number | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    targetAmount: [1000, [Validators.required, Validators.min(1)]],
    currentAmount: [0],
    targetDate: ['', Validators.required],
    color: ['#2563eb'],
    icon: ['flag'],
  });

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.loading = true;
    this.goalService.getGoals().subscribe({
      next: (res) => {
        this.goals = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get totalTargetAmount(): number {
    return this.goals.reduce((acc, g) => acc + g.targetAmount, 0);
  }

  get totalCurrentAmount(): number {
    return this.goals.reduce((acc, g) => acc + g.currentAmount, 0);
  }

  get completedGoalsCount(): number {
    return this.goals.filter((g) => g.status === 'COMPLETED').length;
  }

  get overallProgress(): number {
    if (this.totalTargetAmount === 0) return 0;
    return (this.totalCurrentAmount / this.totalTargetAmount) * 100;
  }

  openForm(): void {
    this.editingId = null;
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    this.form.reset({
      targetAmount: 1000,
      currentAmount: 0,
      targetDate: this.formatDate(nextYear),
      color: '#2563eb',
      icon: 'flag',
    });
    this.showForm = true;
  }

  editGoal(g: Goal): void {
    this.editingId = g.id;
    this.form.patchValue({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate,
      color: g.color || '#2563eb',
      icon: g.icon || 'flag',
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveGoal(): void {
    if (this.form.invalid) return;
    const req = this.form.value;
    if (this.editingId) {
      this.goalService.updateGoal(this.editingId, req).subscribe(() => {
        this.closeForm();
        this.loadGoals();
      });
    } else {
      this.goalService.createGoal(req).subscribe(() => {
        this.closeForm();
        this.loadGoals();
      });
    }
  }

  openDeposit(g: Goal): void {
    this.selectedGoalForDeposit = g;
    this.depositAmount = null;
  }

  submitDeposit(): void {
    if (!this.selectedGoalForDeposit || !this.depositAmount || this.depositAmount <= 0) return;
    this.goalService.depositToGoal(this.selectedGoalForDeposit.id, { amount: this.depositAmount }).subscribe(() => {
      this.selectedGoalForDeposit = null;
      this.loadGoals();
    });
  }

  deleteGoal(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      this.goalService.deleteGoal(id).subscribe(() => this.loadGoals());
    }
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
