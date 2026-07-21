import { createAction, props } from '@ngrx/store';
import { Dashboard } from '@core/models/dashboard.model';

export const loadDashboard = createAction('[Dashboard] Load Dashboard');

export const loadDashboardSuccess = createAction(
  '[Dashboard] Load Dashboard Success',
  props<{ dashboard: Dashboard }>()
);

export const loadDashboardFailure = createAction(
  '[Dashboard] Load Dashboard Failure',
  props<{ error: string }>()
);

export const refreshDashboard = createAction('[Dashboard] Refresh Dashboard');
