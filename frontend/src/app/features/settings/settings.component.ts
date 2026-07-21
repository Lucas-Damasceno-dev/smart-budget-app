import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatSlideToggleModule, MatIconModule],
  template: `
    <div class="settings-container">
      <header class="page-header"><h1>Configurações</h1></header>
      <mat-card class="settings-card">
        <mat-list>
          <mat-list-item>
            <mat-icon matListItemIcon>dark_mode</mat-icon>
            <span matListItemTitle>Modo Escuro</span>
            <mat-slide-toggle matListItemMeta [checked]="themeService.isDarkTheme$ | async" (change)="themeService.toggleTheme()"></mat-slide-toggle>
          </mat-list-item>
        </mat-list>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container { max-width: 600px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .settings-card { border-radius: 12px; }
  `],
})
export class SettingsComponent {
  constructor(public themeService: ThemeService) {}
}
