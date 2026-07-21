import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionService } from '@core/services/transaction.service';
import * as TransactionActions from '../actions/transaction.actions';

@Injectable()
export class TransactionEffects {
  private actions$ = inject(Actions);
  private transactionService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.loadTransactions),
      exhaustMap(({ filter, page, size }) =>
        this.transactionService.getTransactions(filter, page, size).pipe(
          map((response) =>
            TransactionActions.loadTransactionsSuccess({ response: response.data })
          ),
          catchError((error) =>
            of(
              TransactionActions.loadTransactionsFailure({
                error: error.error?.message || 'Failed to load transactions',
              })
            )
          )
        )
      )
    )
  );

  createTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.createTransaction),
      exhaustMap(({ request }) =>
        this.transactionService.createTransaction(request).pipe(
          map((response) => {
            this.snackBar.open('Transação criada com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            return TransactionActions.createTransactionSuccess({
              transaction: response.data,
            });
          }),
          catchError((error) =>
            of(
              TransactionActions.createTransactionFailure({
                error: error.error?.message || 'Failed to create transaction',
              })
            )
          )
        )
      )
    )
  );

  updateTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.updateTransaction),
      exhaustMap(({ id, request }) =>
        this.transactionService.updateTransaction(id, request).pipe(
          map((response) => {
            this.snackBar.open('Transação atualizada com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            return TransactionActions.updateTransactionSuccess({
              transaction: response.data,
            });
          }),
          catchError((error) =>
            of(
              TransactionActions.updateTransactionFailure({
                error: error.error?.message || 'Failed to update transaction',
              })
            )
          )
        )
      )
    )
  );

  deleteTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.deleteTransaction),
      exhaustMap(({ id }) =>
        this.transactionService.deleteTransaction(id).pipe(
          map(() => {
            this.snackBar.open('Transação excluída com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            return TransactionActions.deleteTransactionSuccess({ id });
          }),
          catchError((error) =>
            of(
              TransactionActions.deleteTransactionFailure({
                error: error.error?.message || 'Failed to delete transaction',
              })
            )
          )
        )
      )
    )
  );
}
