import { createAction, props } from '@ngrx/store';
import { Transaction, TransactionRequest, TransactionFilter } from '@core/models/transaction.model';
import { PageResponse } from '@core/models/api.model';

export const loadTransactions = createAction(
  '[Transaction] Load Transactions',
  props<{ filter?: TransactionFilter; page?: number; size?: number }>()
);

export const loadTransactionsSuccess = createAction(
  '[Transaction] Load Transactions Success',
  props<{ response: PageResponse<Transaction> }>()
);

export const loadTransactionsFailure = createAction(
  '[Transaction] Load Transactions Failure',
  props<{ error: string }>()
);

export const createTransaction = createAction(
  '[Transaction] Create Transaction',
  props<{ request: TransactionRequest }>()
);

export const createTransactionSuccess = createAction(
  '[Transaction] Create Transaction Success',
  props<{ transaction: Transaction }>()
);

export const createTransactionFailure = createAction(
  '[Transaction] Create Transaction Failure',
  props<{ error: string }>()
);

export const updateTransaction = createAction(
  '[Transaction] Update Transaction',
  props<{ id: string; request: TransactionRequest }>()
);

export const updateTransactionSuccess = createAction(
  '[Transaction] Update Transaction Success',
  props<{ transaction: Transaction }>()
);

export const updateTransactionFailure = createAction(
  '[Transaction] Update Transaction Failure',
  props<{ error: string }>()
);

export const deleteTransaction = createAction(
  '[Transaction] Delete Transaction',
  props<{ id: string }>()
);

export const deleteTransactionSuccess = createAction(
  '[Transaction] Delete Transaction Success',
  props<{ id: string }>()
);

export const deleteTransactionFailure = createAction(
  '[Transaction] Delete Transaction Failure',
  props<{ error: string }>()
);

export const clearError = createAction('[Transaction] Clear Error');
