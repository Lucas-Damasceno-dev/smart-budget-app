import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImportService } from '../../../core/services/import.service';
import { ImportLog } from '../../../core/models/import.model';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';

@Component({
  selector: 'app-import-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Importações</h1>
        <button mat-raised-button color="primary" (click)="openImportDialog()">
          <mat-icon>upload_file</mat-icon> Importar Extrato
        </button>
      </div>

      <ng-container *ngIf="loading; else content">
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </ng-container>

      <ng-template #content>
        <mat-card *ngIf="imports.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">upload_file</mat-icon>
            <h2>Nenhuma importação</h2>
            <p>Importe extratos bancários para adicionar transações automaticamente.</p>
            <button mat-raised-button color="primary" (click)="openImportDialog()">
              <mat-icon>upload_file</mat-icon> Importar Extrato
            </button>
          </mat-card-content>
        </mat-card>

        <div class="import-list" *ngIf="imports.length > 0">
          <mat-card *ngFor="let imp of imports" class="import-card">
            <mat-card-header>
              <mat-chip-set>
                <mat-chip [color]="getStatusColor(imp.status)" highlighted>
                  {{ getStatusLabel(imp.status) }}
                </mat-chip>
              </mat-chip-set>
              <mat-card-title>{{ imp.fileName }}</mat-card-title>
              <mat-card-subtitle>
                {{ imp.accountName }} • {{ imp.createdAt | date: 'dd/MM/yyyy HH:mm' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="import-stats">
                <div class="stat">
                  <span class="stat-value">{{ imp.totalRows }}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat">
                  <span class="stat-value success">{{ imp.importedCount }}</span>
                  <span class="stat-label">Importados</span>
                </div>
                <div class="stat">
                  <span class="stat-value warn">{{ imp.duplicateCount }}</span>
                  <span class="stat-label">Duplicatas</span>
                </div>
                <div class="stat" *ngIf="imp.errorCount > 0">
                  <span class="stat-value error">{{ imp.errorCount }}</span>
                  <span class="stat-label">Erros</span>
                </div>
              </div>
              <div class="file-info">
                <span class="file-type-badge">{{ imp.fileType }}</span>
              </div>
            </mat-card-content>
            <mat-card-actions align="end" *ngIf="imp.errorDetails">
              <mat-expansion-panel class="error-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon color="warn" class="error-icon">error_outline</mat-icon>
                    Detalhes do erro
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <p class="error-details">{{ imp.errorDetails }}</p>
              </mat-expansion-panel>
            </mat-card-actions>
          </mat-card>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 500; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .empty-state { text-align: center; padding: 64px 24px; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: rgba(0,0,0,0.2); margin-bottom: 16px; }
    .empty-state h2 { margin-bottom: 8px; }
    .empty-state p { color: rgba(0,0,0,0.6); margin-bottom: 24px; }
    .import-list { display: flex; flex-direction: column; gap: 16px; }
    .import-card { border-radius: 12px; }
    .import-stats { display: flex; gap: 24px; margin: 12px 0; }
    .stat { text-align: center; }
    .stat-value { display: block; font-size: 24px; font-weight: 700; }
    .stat-value.success { color: #059669; }
    .stat-value.warn { color: #d97706; }
    .stat-value.error { color: #dc2626; }
    .stat-label { display: block; font-size: 12px; color: rgba(0,0,0,0.5); }
    .file-info { margin-top: 8px; }
    .file-type-badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
    .error-panel { box-shadow: none !important; background: #fef2f2; border-radius: 8px; margin: 0 8px 8px; }
    .error-icon { margin-right: 8px; }
    .error-details { color: #dc2626; font-size: 13px; white-space: pre-wrap; }
    @media (max-width: 599px) {
      .page-container { padding: 16px; }
      .page-header { flex-direction: column; align-items: stretch; }
      .import-stats { gap: 12px; }
    }
  `],
})
export class ImportHistoryComponent implements OnInit {
  private importService = inject(ImportService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  imports: ImportLog[] = [];
  loading = true;

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.importService.getHistory().subscribe({
      next: (history) => {
        this.imports = history.imports ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar histórico de importações', 'Fechar', { duration: 5000 });
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'accent';
      case 'PREVIEWED': return 'primary';
      case 'ERROR': return 'warn';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PREVIEWED': return 'Pré-visualizado';
      case 'ERROR': return 'Erro';
      default: return status;
    }
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadHistory();
      }
    });
  }
}