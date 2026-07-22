import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { AutomationRuleService } from '../../../core/services/automation-rule.service';
import { AutomationRule } from '../../../core/models/automation-rule.model';
import { ApplyRulesDialogComponent } from './apply-rules-dialog.component';

@Component({
  selector: 'app-rule-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Regras de Automação</h1>
        <div class="header-actions">
          <button mat-stroked-button color="accent" (click)="openApplyDialog()">
            <mat-icon>play_arrow</mat-icon> Aplicar em existentes
          </button>
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon> Nova Regra
          </button>
        </div>
      </div>

      <div class="summary-cards" *ngIf="!loading">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-value">{{ rules.length }}</div>
            <div class="summary-label">Total de regras</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="summary-card accent">
          <mat-card-content>
            <div class="summary-value">{{ activeCount }}</div>
            <div class="summary-label">Regras ativas</div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-container *ngIf="loading; else content">
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </ng-container>

      <ng-template #content>
        <mat-card *ngIf="rules.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">auto_awesome</mat-icon>
            <h2>Nenhuma regra de automação</h2>
            <p>Crie regras para categorizar e organizar suas transações automaticamente.</p>
            <button mat-raised-button color="primary" routerLink="new">
              <mat-icon>add</mat-icon> Criar Regra
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="table-card" *ngIf="rules.length > 0">
          <table mat-table [dataSource]="rules" class="rules-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let rule">
                <div class="rule-name">{{ rule.name }}</div>
                <div class="rule-desc" *ngIf="rule.description">{{ rule.description }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="condition">
              <th mat-header-cell *matHeaderCellDef>Condição</th>
              <td mat-cell *matCellDef="let rule">
                <span class="condition-text">{{ formatCondition(rule) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Ação</th>
              <td mat-cell *matCellDef="let rule">
                <span class="action-text">{{ formatAction(rule) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Prioridade</th>
              <td mat-cell *matCellDef="let rule">
                <mat-chip>{{ rule.priority }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="enabled">
              <th mat-header-cell *matHeaderCellDef>Ativa</th>
              <td mat-cell *matCellDef="let rule">
                <mat-slide-toggle
                  [checked]="rule.enabled"
                  (change)="toggleRule(rule)"
                  color="primary"
                ></mat-slide-toggle>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let rule">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="[rule.id, 'edit']">
                    <mat-icon>edit</mat-icon> Editar
                  </a>
                  <button mat-menu-item (click)="deleteRule(rule)">
                    <mat-icon color="warn">delete</mat-icon> Excluir
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>
      </ng-template>

      <button mat-fab color="primary" class="fab-button" routerLink="new">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 24px; position: relative; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 500; }
    .header-actions { display: flex; gap: 8px; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .summary-card { text-align: center; padding: 16px; }
    .summary-card.accent { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .summary-value { font-size: 36px; font-weight: 700; }
    .summary-label { font-size: 14px; opacity: 0.8; margin-top: 4px; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .empty-state { text-align: center; padding: 64px 24px; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: rgba(0,0,0,0.2); margin-bottom: 16px; }
    .empty-state h2 { margin-bottom: 8px; }
    .empty-state p { color: rgba(0,0,0,0.6); margin-bottom: 24px; }
    .table-card { border-radius: 12px; overflow: hidden; }
    .rules-table { width: 100%; }
    .rule-name { font-weight: 500; }
    .rule-desc { font-size: 12px; color: rgba(0,0,0,0.5); margin-top: 2px; }
    .condition-text { font-family: 'Roboto Mono', monospace; font-size: 13px; background: rgba(0,0,0,0.04); padding: 4px 8px; border-radius: 4px; }
    .action-text { font-size: 13px; color: #2563eb; }
    .fab-button { position: fixed; bottom: 32px; right: 32px; }
    @media (max-width: 599px) {
      .page-container { padding: 16px; }
      .page-header { flex-direction: column; align-items: stretch; }
      .header-actions { flex-direction: column; }
      .fab-button { bottom: 16px; right: 16px; }
    }
  `],
})
export class RuleListComponent implements OnInit {
  private ruleService = inject(AutomationRuleService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  rules: AutomationRule[] = [];
  loading = true;
  displayedColumns = ['name', 'condition', 'action', 'priority', 'enabled', 'actions'];

  get activeCount(): number {
    return this.rules.filter(r => r.enabled).length;
  }

  ngOnInit() {
    this.loadRules();
  }

  private loadRules() {
    this.ruleService.list().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar regras', 'Fechar', { duration: 5000 });
      },
    });
  }

  formatCondition(rule: AutomationRule): string {
    const field = this.conditionFieldLabel(rule.conditionField);
    const op = this.conditionOperatorLabel(rule.conditionOperator);
    return `${field} ${op} '${rule.conditionValue}'`;
  }

  formatAction(rule: AutomationRule): string {
    const parts: string[] = [];
    if (rule.setCategoryName) parts.push(`categoria = ${rule.setCategoryName}`);
    if (rule.setAccountName) parts.push(`conta = ${rule.setAccountName}`);
    if (rule.setDescription) parts.push(`descrição = "${rule.setDescription}"`);
    if (rule.setTags) parts.push(`tags = ${rule.setTags}`);
    if (rule.setAsTransfer) parts.push('marcar como transferência');
    return parts.join(', ') || '—';
  }

  private conditionFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      DESCRIPTION: 'descrição',
      AMOUNT: 'valor',
      CATEGORY_NAME: 'categoria',
    };
    return labels[field] || field;
  }

  private conditionOperatorLabel(op: string): string {
    const labels: Record<string, string> = {
      CONTAINS: 'contém',
      EQUALS: '=',
      STARTS_WITH: 'começa com',
      ENDS_WITH: 'termina com',
      GREATER_THAN: '>',
      LESS_THAN: '<',
    };
    return labels[op] || op;
  }

  toggleRule(rule: AutomationRule) {
    this.ruleService.toggle(rule.id).subscribe({
      next: (updated) => {
        const idx = this.rules.findIndex(r => r.id === rule.id);
        if (idx >= 0) this.rules[idx] = updated;
        this.snackBar.open(
          updated.enabled ? 'Regra ativada' : 'Regra desativada',
          'Fechar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Erro ao alterar regra', 'Fechar', { duration: 5000 });
      },
    });
  }

  deleteRule(rule: AutomationRule) {
    if (!confirm(`Tem certeza que deseja excluir a regra "${rule.name}"?`)) return;
    this.ruleService.delete(rule.id).subscribe({
      next: () => {
        this.rules = this.rules.filter(r => r.id !== rule.id);
        this.snackBar.open('Regra excluída', 'Fechar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erro ao excluir regra', 'Fechar', { duration: 5000 });
      },
    });
  }

  openApplyDialog() {
    const dialogRef = this.dialog.open(ApplyRulesDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ruleService.applyToExisting(result.startDate, result.endDate).subscribe({
          next: (res) => {
            this.snackBar.open(
              `${res.modifiedCount} transações modificadas!`,
              'Fechar',
              { duration: 5000 }
            );
          },
          error: () => {
            this.snackBar.open('Erro ao aplicar regras', 'Fechar', { duration: 5000 });
          },
        });
      }
    });
  }
}