import { Component, OnInit, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
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
  ],
  template: `
    <mat-sidenav-container class="sidenav-container" [class.dark-theme]="isDarkTheme$ | async">
      <ng-container *ngIf="isLoggedIn$ | async; else loggedOut">
        <mat-sidenav
          #drawer
          class="sidenav"
          fixedInViewport
          [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="(isHandset$ | async) === false"
        >
          <div class="sidenav-header">
            <img src="assets/logo.svg" alt="FinanceFlow" class="logo" />
            <span class="app-name">FinanceFlow</span>
          </div>
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/transactions" routerLinkActive="active">
              <mat-icon matListItemIcon>receipt_long</mat-icon>
              <span matListItemTitle>Transações</span>
            </a>
            <a mat-list-item routerLink="/accounts" routerLinkActive="active">
              <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
              <span matListItemTitle>Contas</span>
            </a>
            <a mat-list-item routerLink="/reports" routerLinkActive="active">
              <mat-icon matListItemIcon>bar_chart</mat-icon>
              <span matListItemTitle>Relatórios</span>
            </a>
            <a mat-list-item routerLink="/settings" routerLinkActive="active">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Configurações</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" class="toolbar">
            <ng-container *ngIf="isHandset$ | async">
              <button mat-icon-button (click)="drawer.toggle()">
                <mat-icon>menu</mat-icon>
              </button>
            </ng-container>
            <span class="toolbar-spacer"></span>
            
            <button mat-icon-button (click)="toggleTheme()">
              <mat-icon>{{ (isDarkTheme$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            
            <button mat-icon-button [matBadge]="unreadCount" matBadgeColor="accent" matBadgeSize="small">
              <mat-icon>notifications</mat-icon>
            </button>
            
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu">
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
                <mat-icon>logout</mat-icon>
                <span>Sair</span>
              </button>
            </mat-menu>
          </mat-toolbar>
          
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </ng-container>
      <ng-template #loggedOut>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </ng-template>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      padding: 24px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }

    .app-name {
      font-size: 20px;
      font-weight: 600;
      color: white;
    }

    .sidenav mat-nav-list {
      padding-top: 16px;
    }

    .sidenav mat-nav-list a {
      color: rgba(255, 255, 255, 0.7);
      margin: 4px 8px;
      border-radius: 8px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      &.active {
        background: rgba(37, 99, 235, 0.3);
        color: white;
      }
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .main-content {
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }

    .dark-theme .main-content {
      background: #121212;
    }

    .user-menu-header {
      padding: 16px;
      display: flex;
      flex-direction: column;
      
      strong {
        font-size: 14px;
      }
      
      small {
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
      }
    }

    @media (max-width: 599px) {
      .main-content {
        padding: 16px;
      }
    }
  `],
})
export class AppComponent implements OnInit {
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

  ngOnInit(): void {
    afterNextRender(() => {
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
    });

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
}
