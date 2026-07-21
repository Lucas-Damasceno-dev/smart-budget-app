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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="logo-container"><h1>FinanceFlow</h1></div>
        </mat-card-header>
        <mat-card-content>
          <h2>Criar sua conta</h2>
          <p class="subtitle">Comece a organizar suas finanças hoje</p>
          <ng-container *ngIf="error$ | async as error">
            <div class="error-message">{{ error }}</div>
          </ng-container>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline"><mat-label>Nome</mat-label><input matInput formControlName="firstName" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Sobrenome</mat-label><input matInput formControlName="lastName" /></mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width"><mat-label>Email</mat-label><input matInput formControlName="email" type="email" /><mat-icon matSuffix>email</mat-icon></mat-form-field>
            <mat-form-field appearance="outline" class="full-width"><mat-label>Senha</mat-label><input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" /><button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword"><mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon></button></mat-form-field>
            <button mat-raised-button color="primary" class="submit-btn" type="submit" [disabled]="form.invalid || (loading$ | async)">
              <ng-container *ngIf="loading$ | async; else createText"><mat-spinner diameter="20"></mat-spinner></ng-container>
              <ng-template #createText> Criar conta </ng-template>
            </button>
          </form>
          <div class="auth-footer"><p>Já tem uma conta? <a routerLink="/auth/login">Entrar</a></p></div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 24px; }
    .auth-card { max-width: 480px; width: 100%; padding: 32px; border-radius: 16px; }
    .logo-container { display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 24px; }
    .logo-container h1 { font-size: 28px; font-weight: 700; color: #2563eb; margin: 0; }
    h2 { text-align: center; margin-bottom: 8px; font-size: 24px; font-weight: 600; }
    .subtitle { text-align: center; color: #6b7280; margin-bottom: 32px; }
    .name-row { display: flex; gap: 16px; }
    .name-row mat-form-field { flex: 1; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .submit-btn { width: 100%; height: 48px; font-size: 16px; margin-top: 8px; }
    .error-message { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center; }
    .auth-footer { margin-top: 24px; text-align: center; }
    .auth-footer a { color: #2563eb; font-weight: 500; text-decoration: none; }
    @media (max-width: 599px) { .name-row { flex-direction: column; gap: 0; } }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  form: FormGroup = this.fb.group({ firstName: ['', Validators.required], lastName: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]] });
  hidePassword = true;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  onSubmit(): void { if (this.form.valid) { this.store.dispatch(AuthActions.register({ request: this.form.value })); } }
}
