import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { Observable, map, shareReplay } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { NotificationService } from './core/services/notification.service';
import { selectCurrentUser, selectIsLoggedIn } from './store/selectors/auth.selectors';
import * as AuthActions from './store/actions/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <ng-container *ngIf="isLoggedIn$ | async; else loggedOut">
      <mat-sidenav-container class="sidenav-container" [class.dark-theme]="isDarkTheme$ | async">
        <mat-sidenav
          #drawer
          class="sidenav"
          fixedInViewport
          [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="(isHandset$ | async) === false"
        >
          <!-- Brand Logo Header -->
          <div class="sidenav-brand">
            <div class="logo-wrapper">
              <img src="assets/logo.svg" alt="FinanceFlow Logo" class="brand-logo" />
            </div>
            <div class="brand-text">
              <span class="brand-name">Finance<span class="highlight">Flow</span></span>
              <span class="brand-badge">PRO</span>
            </div>
          </div>

          <!-- Grouped Navigation Menu -->
          <div class="nav-scroll-container">
            <div class="nav-group">
              <div class="group-label">VISÃO GERAL</div>
              <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
                <mat-icon class="nav-icon">dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
              <a class="nav-item" routerLink="/transactions" routerLinkActive="active">
                <mat-icon class="nav-icon">receipt_long</mat-icon>
                <span>Transações</span>
              </a>
              <a class="nav-item" routerLink="/accounts" routerLinkActive="active">
                <mat-icon class="nav-icon">account_balance_wallet</mat-icon>
                <span>Contas</span>
              </a>
              <a class="nav-item" routerLink="/reports" routerLinkActive="active">
                <mat-icon class="nav-icon">bar_chart</mat-icon>
                <span>Relatórios</span>
              </a>
            </div>

            <div class="nav-group">
              <div class="group-label">GESTÃO & METAS</div>
              <a class="nav-item" routerLink="/investments" routerLinkActive="active">
                <mat-icon class="nav-icon">show_chart</mat-icon>
                <span>Investimentos</span>
              </a>
              <a class="nav-item" routerLink="/goals" routerLinkActive="active">
                <mat-icon class="nav-icon">flag</mat-icon>
                <span>Metas</span>
              </a>
              <a class="nav-item" routerLink="/installments" routerLinkActive="active">
                <mat-icon class="nav-icon">fact_check</mat-icon>
                <span>Parcelamentos</span>
              </a>
              <a class="nav-item" routerLink="/subscriptions" routerLinkActive="active">
                <mat-icon class="nav-icon">subscriptions</mat-icon>
                <span>Assinaturas</span>
              </a>
              <a class="nav-item" routerLink="/invoices" routerLinkActive="active">
                <mat-icon class="nav-icon">credit_card</mat-icon>
                <span>Faturas</span>
              </a>
            </div>

            <div class="nav-group">
              <div class="group-label">AUTOMAÇÃO & SISTEMA</div>
              <a class="nav-item" routerLink="/imports" routerLinkActive="active">
                <mat-icon class="nav-icon">upload_file</mat-icon>
                <span>Importar Extratos</span>
              </a>
              <a class="nav-item" routerLink="/automation-rules" routerLinkActive="active">
                <mat-icon class="nav-icon">auto_awesome</mat-icon>
                <span>Automações</span>
              </a>
              <a class="nav-item" routerLink="/shared-accounts" routerLinkActive="active">
                <mat-icon class="nav-icon">people</mat-icon>
                <span>Compartilhamento</span>
              </a>
              <a class="nav-item" routerLink="/settings" routerLinkActive="active">
                <mat-icon class="nav-icon">settings</mat-icon>
                <span>Configurações</span>
              </a>
            </div>
          </div>

          <!-- User Profile Footer Card -->
          <div class="sidenav-user-footer" *ngIf="currentUser$ | async as user">
            <div class="user-avatar-circle">
              {{ getUserInitials(user.fullName) }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ user.fullName }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
            <button mat-icon-button class="logout-btn" matTooltip="Sair da Conta" (click)="logout()">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-sidenav>

        <!-- Main Workspace Area -->
        <mat-sidenav-content class="main-layout">
          <!-- Glassmorphic Top Toolbar -->
          <mat-toolbar class="glass-toolbar">
            <button mat-icon-button *ngIf="isHandset$ | async" (click)="drawer.toggle()">
              <mat-icon>menu</mat-icon>
            </button>

            <!-- Quick Action Button -->
            <a mat-flat-button color="primary" routerLink="/transactions/new" class="quick-add-btn hide-xs">
              <mat-icon>add</mat-icon> Nova Transação
            </a>

            <span class="toolbar-spacer"></span>

            <!-- Actions Header Right -->
            <div class="header-actions">
              <!-- Theme Toggle Button -->
              <button mat-icon-button (click)="toggleTheme()" class="action-btn theme-toggle-btn" [matTooltip]="(isDarkTheme$ | async) ? 'Modo Claro' : 'Modo Escuro'">
                <mat-icon class="theme-icon">{{ (isDarkTheme$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>

              <!-- Notification Icon -->
              <button mat-icon-button class="action-btn" [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn" matBadgeSize="small" matTooltip="Notificações">
                <mat-icon>notifications_none</mat-icon>
              </button>

              <!-- Profile Quick Menu Trigger -->
              <button mat-icon-button [matMenuTriggerFor]="userMenu" class="avatar-trigger">
                <mat-icon>account_circle</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu" class="custom-user-menu">
                <ng-container *ngIf="currentUser$ | async as user">
                  <div class="user-menu-header">
                    <strong>{{ user.fullName }}</strong>
                    <small>{{ user.email }}</small>
                  </div>
                  <mat-divider></mat-divider>
                </ng-container>
                <button mat-menu-item routerLink="/settings">
                  <mat-icon>settings</mat-icon>
                  <span>Configurações</span>
                </button>
                <button mat-menu-item (click)="logout()">
                  <mat-icon color="warn">logout</mat-icon>
                  <span>Sair</span>
                </button>
              </mat-menu>
            </div>
          </mat-toolbar>

          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <ng-template #loggedOut>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background: var(--bg-primary);
    }

    .sidenav {
      width: 270px;
      background: #0f172a;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
    }

    .sidenav-brand {
      display: flex;
      align-items: center;
      padding: 24px 20px;
      gap: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);

      .logo-wrapper {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

        .brand-logo {
          width: 30px;
          height: 30px;
        }
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        
        .brand-name {
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;

          .highlight {
            color: #6366f1;
          }
        }

        .brand-badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #34d399;
          background: rgba(52, 211, 153, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
          align-self: flex-start;
          margin-top: 2px;
        }
      }
    }

    .nav-scroll-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
    }

    .nav-group {
      margin-bottom: 20px;

      .group-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #64748b;
        padding: 8px 12px;
      }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      margin: 3px 0;
      border-radius: 10px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      .nav-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
        transition: color 0.2s ease;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #f1f5f9;

        .nav-icon {
          color: #a5abfd;
        }
      }

      &.active {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%);
        color: #ffffff;
        font-weight: 600;

        .nav-icon {
          color: #6366f1;
        }

        &::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 6px;
          bottom: 6px;
          width: 4px;
          border-radius: 0 4px 4px 0;
          background: #6366f1;
          box-shadow: 0 0 10px #6366f1;
        }
      }
    }

    .sidenav-user-footer {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.06);

      .user-avatar-circle {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        color: white;
        font-weight: 700;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      }

      .user-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .logout-btn {
        color: #64748b;
        &:hover {
          color: #f43f5e;
        }
      }
    }

    .main-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .glass-toolbar {
      background: var(--bg-glass) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      .action-btn {
        color: var(--text-muted);
        transition: color 0.2s ease, transform 0.2s ease;

        &:hover {
          color: var(--text-main);
        }
      }

      .theme-toggle-btn:hover .theme-icon {
        transform: rotate(45deg);
      }
    }

    .quick-add-btn {
      height: 38px !important;
      font-size: 13px !important;
    }

    .main-content {
      flex: 1;
      padding: 32px 28px;
      background: var(--bg-primary);
    }

    .user-menu-header {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;

      strong {
        font-size: 14px;
        color: var(--text-main);
      }

      small {
        color: var(--text-muted);
        font-size: 12px;
      }
    }

    @media (max-width: 599px) {
      .main-content {
        padding: 16px;
      }
      .glass-toolbar {
        padding: 0 12px;
        height: 60px;
      }
    }
  `],
})
export class AppComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private store = inject(Store);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  isDarkTheme$ = this.themeService.isDarkTheme$;
  currentUser$ = this.store.select(selectCurrentUser);
  unreadCount = 0;

  constructor() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        this.store.dispatch(AuthActions.loadUserSuccess({ user }));
      } catch (e) {
        this.authService.logout();
      }
    }

    this.notificationService.unreadCount$.subscribe(
      (count) => (this.unreadCount = count)
    );
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(name?: string): string {
    if (!name) return 'FF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
