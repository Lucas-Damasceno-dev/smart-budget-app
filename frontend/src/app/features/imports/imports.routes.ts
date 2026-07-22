import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./import-history/import-history.component').then(m => m.ImportHistoryComponent) },
] as Routes;