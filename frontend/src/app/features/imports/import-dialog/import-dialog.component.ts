import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImportService } from '../../../core/services/import.service';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import { ImportPreview, ImportRow, ImportLog } from '../../../core/models/import.model';

type Step = 'upload' | 'preview' | 'result';

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>Importar Extrato</h2>
    <mat-dialog-content>
      <!-- Step 1: Upload -->
      <ng-container *ngIf="step === 'upload'">
        <div class="step-content">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Selecione a conta</mat-label>
            <mat-select [(ngModel)]="selectedAccountId">
              <mat-option *ngFor="let acc of accounts" [value]="acc.id">
                {{ acc.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div
            class="drop-zone"
            [class.dragging]="isDragging"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <ng-container *ngIf="!selectedFile; else fileSelected">
              <mat-icon class="drop-icon">cloud_upload</mat-icon>
              <p class="drop-text">Arraste o arquivo aqui ou clique para selecionar</p>
              <p class="drop-hint">Formatos suportados: OFX, CSV, QIF</p>
              <button mat-stroked-button (click)="fileInput.click()">Selecionar Arquivo</button>
            </ng-container>
            <ng-template #fileSelected>
              <mat-icon class="file-icon">description</mat-icon>
              <p class="file-name">{{ selectedFile?.name }}</p>
              <p class="file-size">{{ ((selectedFile?.size || 0) / 1024).toFixed(1) }} KB</p>
              <button mat-button color="warn" (click)="clearFile()">
                <mat-icon>close</mat-icon> Remover
              </button>
            </ng-template>
            <input
              #fileInput
              type="file"
              accept=".ofx,.csv,.qif,.ofx,.qfx"
              (change)="onFileSelected($event)"
              style="display: none"
            />
          </div>
        </div>
      </ng-container>

      <!-- Step 2: Preview -->
      <ng-container *ngIf="step === 'preview'">
        <div class="step-content" *ngIf="preview">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Arquivo</span>
                  <span class="summary-value">{{ preview.fileName }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Conta</span>
                  <span class="summary-value">{{ preview.accountName }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total de linhas</span>
                  <span class="summary-value">{{ preview.totalRows }}</span>
                </div>
                <div class="summary-item" [class.has-duplicates]="preview.duplicateCount > 0">
                  <span class="summary-label">Duplicatas</span>
                  <span class="summary-value">{{ preview.duplicateCount }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="preview-options">
            <mat-checkbox [(ngModel)]="skipDuplicates" color="primary">
              Pular linhas duplicadas
            </mat-checkbox>
          </div>

          <div class="table-wrapper">
            <table mat-table [dataSource]="preview.rows" class="preview-table">
              <ng-container matColumnDef="rowIndex">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let row">{{ row.rowIndex }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let row">{{ row.date | date: 'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let row">{{ row.description }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let row" [class.negative]="row.amount < 0">
                  {{ row.amount | currency: 'BRL' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="duplicate">
                <th mat-header-cell *matHeaderCellDef>Duplicata</th>
                <td mat-cell *matCellDef="let row">
                  <mat-icon *ngIf="row.duplicate" color="warn" matTooltip="Possível duplicata">warning</mat-icon>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="previewColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: previewColumns;" [class.duplicate-row]="row.duplicate"></tr>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- Step 3: Result -->
      <ng-container *ngIf="step === 'result'">
        <div class="step-content" *ngIf="result">
          <mat-card class="result-card" [class.success]="result.errorCount === 0" [class.has-errors]="result.errorCount > 0">
            <mat-card-content class="result-content">
              <mat-icon class="result-icon">
                {{ result.errorCount === 0 ? 'check_circle' : 'warning' }}
              </mat-icon>
              <h2>Importação {{ result.errorCount === 0 ? 'concluída' : 'com erros' }}</h2>
              <div class="result-stats">
                <div class="stat">
                  <span class="stat-value">{{ result.importedCount }}</span>
                  <span class="stat-label">Importados</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ result.duplicateCount }}</span>
                  <span class="stat-label">Duplicatas ignoradas</span>
                </div>
                <div class="stat" *ngIf="result.errorCount > 0">
                  <span class="stat-value error">{{ result.errorCount }}</span>
                  <span class="stat-label">Erros</span>
                </div>
              </div>
              <p class="result-total">Total de linhas: {{ result.totalRows }}</p>
              <p class="result-detail" *ngIf="result.errorDetails">{{ result.errorDetails }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <ng-container [ngSwitch]="step">
        <ng-container *ngSwitchCase="'upload'">
          <button mat-button mat-dialog-close>Cancelar</button>
          <button
            mat-raised-button
            color="primary"
            [disabled]="!selectedFile || !selectedAccountId || previewLoading"
            (click)="previewFile()"
          >
            <mat-spinner *ngIf="previewLoading" diameter="20"></mat-spinner>
            <span *ngIf="!previewLoading">Pré-visualizar</span>
          </button>
        </ng-container>
        <ng-container *ngSwitchCase="'preview'">
          <button mat-button (click)="step = 'upload'">Voltar</button>
          <button
            mat-raised-button
            color="primary"
            [disabled]="confirmLoading"
            (click)="confirmImport()"
          >
            <mat-spinner *ngIf="confirmLoading" diameter="20"></mat-spinner>
            <span *ngIf="!confirmLoading">Confirmar Importação</span>
          </button>
        </ng-container>
        <ng-container *ngSwitchCase="'result'">
          <button mat-raised-button color="primary" (click)="close()">Fechar</button>
        </ng-container>
      </ng-container>
    </mat-dialog-actions>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .drop-zone { border: 2px dashed #ccc; border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafafa; }
    .drop-zone.dragging { border-color: #2563eb; background: #eff6ff; }
    .drop-icon { font-size: 48px; width: 48px; height: 48px; color: #2563eb; margin-bottom: 12px; }
    .drop-text { font-size: 16px; color: rgba(0,0,0,0.7); margin-bottom: 4px; }
    .drop-hint { font-size: 13px; color: rgba(0,0,0,0.4); margin-bottom: 16px; }
    .file-icon { font-size: 40px; width: 40px; height: 40px; color: #2563eb; margin-bottom: 8px; }
    .file-name { font-weight: 500; font-size: 15px; }
    .file-size { font-size: 13px; color: rgba(0,0,0,0.5); margin-bottom: 8px; }
    .summary-card { margin-bottom: 16px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .summary-item { text-align: center; }
    .summary-label { display: block; font-size: 12px; color: rgba(0,0,0,0.5); }
    .summary-value { display: block; font-size: 18px; font-weight: 600; }
    .has-duplicates .summary-value { color: #dc2626; }
    .preview-options { margin-bottom: 12px; }
    .table-wrapper { max-height: 300px; overflow: auto; border: 1px solid #e0e0e0; border-radius: 8px; }
    .preview-table { width: 100%; }
    .preview-table .mat-mdc-row.duplicate-row { background: #fef2f2; }
    .negative { color: #dc2626; }
    .result-card { text-align: center; padding: 24px; }
    .result-card.success { border-left: 4px solid #059669; }
    .result-card.has-errors { border-left: 4px solid #dc2626; }
    .result-content { display: flex; flex-direction: column; align-items: center; }
    .result-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 12px; }
    .success .result-icon { color: #059669; }
    .has-errors .result-icon { color: #dc2626; }
    .result-stats { display: flex; gap: 24px; margin: 16px 0; }
    .stat { text-align: center; }
    .stat-value { display: block; font-size: 28px; font-weight: 700; color: #059669; }
    .stat-value.error { color: #dc2626; }
    .stat-label { display: block; font-size: 12px; color: rgba(0,0,0,0.5); }
    .result-total { color: rgba(0,0,0,0.5); font-size: 14px; }
    .result-detail { color: #dc2626; font-size: 13px; margin-top: 8px; }
  `],
})
export class ImportDialogComponent {
  private dialogRef = inject(MatDialogRef<ImportDialogComponent>);
  private importService = inject(ImportService);
  private accountService = inject(AccountService);
  private snackBar = inject(MatSnackBar);

  step: Step = 'upload';
  accounts: Account[] = [];
  selectedAccountId = '';
  selectedFile: File | null = null;
  isDragging = false;
  previewLoading = false;
  confirmLoading = false;
  skipDuplicates = true;

  preview: ImportPreview | null = null;
  result: ImportLog | null = null;

  previewColumns = ['rowIndex', 'date', 'description', 'amount', 'duplicate'];

  constructor() {
    this.accountService.list().subscribe((res: any) => {
      this.accounts = res.data ?? [];
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  clearFile() {
    this.selectedFile = null;
  }

  previewFile() {
    if (!this.selectedFile || !this.selectedAccountId) return;
    this.previewLoading = true;
    this.importService.preview(this.selectedFile, this.selectedAccountId).subscribe({
      next: (preview) => {
        this.preview = preview;
        this.step = 'preview';
        this.previewLoading = false;
      },
      error: (err) => {
        this.previewLoading = false;
        this.snackBar.open(
          err.error?.message || 'Erro ao processar arquivo',
          'Fechar',
          { duration: 5000 }
        );
      },
    });
  }

  confirmImport() {
    if (!this.preview) return;
    this.confirmLoading = true;
    this.importService.confirm({
      importLogId: this.preview.importLogId,
      skipDuplicates: this.skipDuplicates,
    }).subscribe({
      next: (result) => {
        this.result = result;
        this.step = 'result';
        this.confirmLoading = false;
      },
      error: (err) => {
        this.confirmLoading = false;
        this.snackBar.open(
          err.error?.message || 'Erro ao confirmar importação',
          'Fechar',
          { duration: 5000 }
        );
      },
    });
  }

  close() {
    this.dialogRef.close(this.result);
  }
}