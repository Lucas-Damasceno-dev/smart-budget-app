import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionState } from '../reducers/transaction.reducer';

export const selectTransactionState =
  createFeatureSelector<TransactionState>('transactions');

export const selectTransactions = createSelector(
  selectTransactionState,
  (state) => state.transactions
);

export const selectTransactionLoading = createSelector(
  selectTransactionState,
  (state) => state.loading
);

export const selectTransactionError = createSelector(
  selectTransactionState,
  (state) => state.error
);

export const selectTransactionPagination = createSelector(
  selectTransactionState,
  (state) => ({
    totalElements: state.totalElements,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
  })
);

export const selectTransactionFilter = createSelector(
  selectTransactionState,
  (state) => state.filter
);
