import { createReducer, on } from '@ngrx/store';
import { Transaction, TransactionFilter } from '@core/models/transaction.model';
import * as TransactionActions from '../actions/transaction.actions';

export interface TransactionState {
  transactions: Transaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  filter: TransactionFilter;
  loading: boolean;
  error: string | null;
}

export const initialState: TransactionState = {
  transactions: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  filter: {},
  loading: false,
  error: null,
};

export const transactionReducer = createReducer(
  initialState,
  on(TransactionActions.loadTransactions, (state, { filter, page }) => ({
    ...state,
    filter: filter || state.filter,
    currentPage: page || 0,
    loading: true,
    error: null,
  })),
  on(TransactionActions.loadTransactionsSuccess, (state, { response }) => ({
    ...state,
    transactions: response.content,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    currentPage: response.page,
    loading: false,
    error: null,
  })),
  on(TransactionActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TransactionActions.createTransaction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TransactionActions.createTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: [transaction, ...state.transactions],
    totalElements: state.totalElements + 1,
    loading: false,
    error: null,
  })),
  on(TransactionActions.createTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TransactionActions.updateTransaction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TransactionActions.updateTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: state.transactions.map((t) =>
      t.id === transaction.id ? transaction : t
    ),
    loading: false,
    error: null,
  })),
  on(TransactionActions.updateTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TransactionActions.deleteTransaction, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TransactionActions.deleteTransactionSuccess, (state, { id }) => ({
    ...state,
    transactions: state.transactions.filter((t) => t.id !== id),
    totalElements: state.totalElements - 1,
    loading: false,
    error: null,
  })),
  on(TransactionActions.deleteTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TransactionActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
