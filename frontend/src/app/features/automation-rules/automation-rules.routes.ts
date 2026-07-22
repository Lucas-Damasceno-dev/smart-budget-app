import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./rule-list/rule-list.component').then(m => m.RuleListComponent) },
  { path: 'new', loadComponent: () => import('./rule-form/rule-form.component').then(m => m.RuleFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./rule-form/rule-form.component').then(m => m.RuleFormComponent) },
] as Routes;