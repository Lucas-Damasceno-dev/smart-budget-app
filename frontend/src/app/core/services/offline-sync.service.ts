import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { map, takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import * as DashboardActions from '@store/actions/dashboard.actions';
import * as TransactionActions from '@store/actions/transaction.actions';

@Injectable({
  providedIn: 'root',
})
export class OfflineSyncService implements OnDestroy {
  private snackBar = inject(MatSnackBar);
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$ = this.onlineSubject.asObservable();

  private pendingActions: Array<{ type: string; payload: any }> = [];

  constructor() {
    this.initNetworkListeners();
  }

  private initNetworkListeners(): void {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$)
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe((isOnline) => {
        this.onlineSubject.next(isOnline);
        
        if (isOnline) {
          this.onBackOnline();
        } else {
          this.onOffline();
        }
      });
  }

  private onBackOnline(): void {
    this.snackBar.open('Conexão restaurada. Sincronizando...', 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });

    // Refresh data from server
    this.store.dispatch(DashboardActions.refreshDashboard());
    this.store.dispatch(TransactionActions.loadTransactions({ page: 0 }));

    // Process pending actions
    this.processPendingActions();
  }

  private onOffline(): void {
    this.snackBar.open('Você está offline. Dados em cache serão usados.', 'OK', {
      duration: 5000,
      panelClass: ['snackbar-warning'],
    });
  }

  queueAction(type: string, payload: any): void {
    this.pendingActions.push({ type, payload });
    localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
  }

  private processPendingActions(): void {
    const stored = localStorage.getItem('pendingActions');
    if (stored) {
      try {
        this.pendingActions = JSON.parse(stored);
      } catch {
        this.pendingActions = [];
        localStorage.removeItem('pendingActions');
      }
    }

    // Process each pending action
    while (this.pendingActions.length > 0) {
      const action = this.pendingActions.shift();
      if (action) {
        // Dispatch action based on type
        switch (action.type) {
          case 'CREATE_TRANSACTION':
            this.store.dispatch(TransactionActions.createTransaction({ request: action.payload }));
            break;
          case 'UPDATE_TRANSACTION':
            this.store.dispatch(TransactionActions.updateTransaction({ 
              id: action.payload.id, 
              request: action.payload.request 
            }));
            break;
          case 'DELETE_TRANSACTION':
            this.store.dispatch(TransactionActions.deleteTransaction({ id: action.payload }));
            break;
        }
      }
    }

    localStorage.removeItem('pendingActions');
  }

  isOnline(): boolean {
    return this.onlineSubject.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
