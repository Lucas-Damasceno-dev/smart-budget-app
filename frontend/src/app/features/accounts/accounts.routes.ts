import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./accounts.component').then((m) => m.AccountsComponent),
  },
];
