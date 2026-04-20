import { Injectable, signal, computed } from '@angular/core';
import { Transaction, Balance } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  // State signals
  private _transactions = signal<Transaction[]>([]);
  private _balance = signal<Balance>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly transactions = this._transactions.asReadonly();
  readonly balance = this._balance.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly projectedBalance = computed(() => {
    const txs = this._transactions();
    return txs.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  });

  readonly incomeTransactions = computed(() => 
    this._transactions().filter(t => t.type === 'income')
  );

  readonly expenseTransactions = computed(() => 
    this._transactions().filter(t => t.type === 'expense')
  );

  readonly expensesByCategory = computed(() => {
    const expenses = this._transactions().filter(t => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    expenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return byCategory;
  });

  readonly monthlyTotal = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return this._transactions()
      .filter(t => t.date.startsWith(currentMonth))
      .reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);
  });

  // Actions
  setTransactions(transactions: Transaction[]) {
    this._transactions.set(transactions);
  }

  setBalance(balance: Balance) {
    this._balance.set(balance);
  }

  setLoading(loading: boolean) {
    this._loading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }

  addTransaction(transaction: Transaction) {
    this._transactions.update(txs => [transaction, ...txs]);
  }

  updateTransaction(id: string, data: Partial<Transaction>) {
    this._transactions.update(txs => 
      txs.map(t => t.id === id ? { ...t, ...data } : t)
    );
  }

  removeTransaction(id: string) {
    this._transactions.update(txs => txs.filter(t => t.id !== id));
  }

  clearError() {
    this._error.set(null);
  }
}