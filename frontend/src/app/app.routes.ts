import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/transactions/transactions.routes').then(
        (m) => m.TRANSACTION_ROUTES
      ),
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then(
        (m) => m.ACCOUNT_ROUTES
      ),
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reports/reports.component').then(
        (m) => m.ReportsComponent
      ),
  },
  {
    path: 'investments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/investments/investments.component').then(
        (m) => m.InvestmentsComponent
      ),
  },
  {
    path: 'goals',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/goals/goals.component').then(
        (m) => m.GoalsComponent
      ),
  },
  {
    path: 'installments',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/installments/installments.routes').then(
        (m) => m.INSTALLMENT_ROUTES
      ),
  },
  {
    path: 'subscriptions',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/subscriptions/subscriptions.routes').then(
        (m) => m.SUBSCRIPTION_ROUTES
      ),
  },
  {
    path: 'invoices',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/invoices/invoices.routes').then(
        (m) => m.INVOICE_ROUTES
      ),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/settings/settings.routes').then(
        (m) => m.SETTINGS_ROUTES
      ),
  },
  {
    path: 'automation-rules',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/automation-rules/automation-rules.routes'),
  },
  {
    path: 'imports',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/imports/imports.routes'),
  },
  {
    path: 'shared-accounts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shared-accounts/shared-accounts.component').then(
        (m) => m.SharedAccountsComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
