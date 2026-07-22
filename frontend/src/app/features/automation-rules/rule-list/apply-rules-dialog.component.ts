import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-apply-rules-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  template: `
    <h2 mat-dialog-title>Aplicar regras em transações existentes</h2>
    <mat-dialog-content>
      <p class="dialog-description">Selecione o período para aplicar as regras de automação nas transações já cadastradas.</p>
      <div class="date-fields">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Data inicial</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" />
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Data final</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" />
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!startDate || !endDate" (click)="apply()">
        Aplicar Regras
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-description { color: rgba(0,0,0,0.6); margin-bottom: 16px; }
    .date-fields { display: flex; flex-direction: column; gap: 12px; }
    .full-width { width: 100%; }
  `],
})
export class ApplyRulesDialogComponent {
  private dialogRef = inject(MatDialogRef<ApplyRulesDialogComponent>);

  startDate: Date | null = null;
  endDate: Date | null = null;

  apply() {
    if (!this.startDate || !this.endDate) return;
    this.dialogRef.close({
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0],
    });
  }
}