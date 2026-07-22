import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';

import * as AuthActions from '@store/actions/auth.actions';
import { selectAuthLoading, selectAuthError } from '@store/selectors/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-page-container">
      <div class="background-decor-1"></div>
      <div class="background-decor-2"></div>

      <mat-card class="auth-card">
        <div class="brand-header">
          <div class="logo-box">
            <img src="assets/logo.svg" alt="FinanceFlow Logo" />
          </div>
          <h1>Finance<span class="highlight">Flow</span></h1>
        </div>

        <div class="form-header">
          <h2>Bem-vindo de volta</h2>
          <p class="subtitle">Acesse sua conta para gerenciar seu patrimônio</p>
        </div>

        <ng-container *ngIf="error$ | async as error">
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>
        </ng-container>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="seu@email.com" />
            <mat-icon matSuffix>mail_outline</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" />
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-flat-button color="primary" class="submit-btn" type="submit" [disabled]="form.invalid || (loading$ | async)">
            <ng-container *ngIf="loading$ | async; else loginText">
              <mat-spinner diameter="22" class="btn-spinner"></mat-spinner>
            </ng-container>
            <ng-template #loginText>Entrar na Conta</ng-template>
          </button>
        </form>

        <div class="auth-footer">
          <p>Ainda não possui uma conta? <a routerLink="/auth/register">Criar conta gratuitamente</a></p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #090d16;
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 45%),
        radial-gradient(circle at 85% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 45%);
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    .background-decor-1 {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.08);
      filter: blur(80px);
      top: -100px;
      left: -100px;
    }

    .background-decor-2 {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.06);
      filter: blur(70px);
      bottom: -80px;
      right: -80px;
    }

    .auth-card {
      max-width: 440px;
      width: 100%;
      padding: 40px 36px !important;
      border-radius: 24px !important;
      background: rgba(17, 24, 39, 0.85) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5) !important;
      position: relative;
      z-index: 10;
    }

    .brand-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;

      .logo-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(99, 102, 241, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        img { width: 30px; height: 30px; }
      }

      h1 {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.02em;
        margin: 0;

        .highlight { color: #6366f1; }
      }
    }

    .form-header {
      text-align: center;
      margin-bottom: 28px;

      h2 {
        font-size: 22px;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 6px;
      }

      .subtitle {
        font-size: 13px;
        color: #94a3b8;
      }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fb7185;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 13px;

      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      width: 100%;
      height: 48px !important;
      font-size: 15px !important;
      margin-top: 12px;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4) !important;

      &:hover {
        box-shadow: 0 6px 22px rgba(99, 102, 241, 0.5) !important;
      }
    }

    .btn-spinner {
      margin: 0 auto;
    }

    .auth-footer {
      margin-top: 28px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;

      a {
        color: #818cf8;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.2s ease;

        &:hover {
          color: #a5abfd;
          text-decoration: underline;
        }
      }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  hidePassword = true;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(AuthActions.login({ request: this.form.value }));
    }
  }
}
