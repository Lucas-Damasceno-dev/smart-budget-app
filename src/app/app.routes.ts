import { Routes } from '@angular/router';
import { ShellComponent } from './components/layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'transactions/new',
        loadComponent: () => import('./pages/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
      },
      {
        path: 'transactions/:id',
        loadComponent: () => import('./pages/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
      },
      {
        path: 'goals',
        loadComponent: () => import('./pages/goals/goals.component').then(m => m.GoalsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
