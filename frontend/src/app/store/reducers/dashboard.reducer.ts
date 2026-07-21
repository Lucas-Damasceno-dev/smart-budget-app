import { createReducer, on } from '@ngrx/store';
import { Dashboard } from '@core/models/dashboard.model';
import * as DashboardActions from '../actions/dashboard.actions';

export interface DashboardState {
  dashboard: Dashboard | null;
  loading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  dashboard: null,
  loading: false,
  error: null,
};

export const dashboardReducer = createReducer(
  initialState,
  on(DashboardActions.loadDashboard, DashboardActions.refreshDashboard, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.loadDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    dashboard,
    loading: false,
    error: null,
  })),
  on(DashboardActions.loadDashboardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
