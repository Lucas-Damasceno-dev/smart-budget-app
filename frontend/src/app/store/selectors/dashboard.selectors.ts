import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from '../reducers/dashboard.reducer';

export const selectDashboardState =
  createFeatureSelector<DashboardState>('dashboard');

export const selectDashboard = createSelector(
  selectDashboardState,
  (state) => state.dashboard
);

export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state) => state.loading
);

export const selectDashboardError = createSelector(
  selectDashboardState,
  (state) => state.error
);

export const selectTotalBalance = createSelector(
  selectDashboard,
  (dashboard) => dashboard?.totalBalance ?? 0
);

export const selectMonthlyBalance = createSelector(
  selectDashboard,
  (dashboard) => ({
    income: dashboard?.monthlyIncome ?? 0,
    expenses: dashboard?.monthlyExpenses ?? 0,
    balance: dashboard?.monthlyBalance ?? 0,
  })
);

export const selectTopExpenseCategories = createSelector(
  selectDashboard,
  (dashboard) => dashboard?.topExpenseCategories ?? []
);

export const selectBudgetProgress = createSelector(
  selectDashboard,
  (dashboard) => dashboard?.budgetProgress ?? []
);
