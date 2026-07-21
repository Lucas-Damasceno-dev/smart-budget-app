import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="reports-container">
      <header class="page-header"><h1>Relatórios</h1></header>
      <mat-card class="coming-soon">
        <h2>Em Desenvolvimento</h2>
        <p>Os relatórios avançados estarão disponíveis em breve.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .coming-soon { text-align: center; padding: 48px; border-radius: 12px; }
    .coming-soon h2 { margin-bottom: 8px; }
    .coming-soon p { color: rgba(0, 0, 0, 0.6); }
  `],
})
export class ReportsComponent {}
