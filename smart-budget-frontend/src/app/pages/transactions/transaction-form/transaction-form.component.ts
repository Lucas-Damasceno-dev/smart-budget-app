import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-transaction-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold text-mist-800 mb-6">Nova Transação</h1>
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-mist-200">
          <label class="block text-sm font-medium text-mist-700 mb-2">Tipo</label>
          <div class="flex gap-4">
            <label class="flex items-center"><input type="radio" name="type" value="income" [(ngModel)]="type" class="mr-2" />Receita</label>
            <label class="flex items-center"><input type="radio" name="type" value="expense" [(ngModel)]="type" class="mr-2" />Despesa</label>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-mist-200">
          <label class="block text-sm font-medium text-mist-700 mb-2">Descrição</label>
          <input type="text" [(ngModel)]="description" name="description" class="w-full px-3 py-2 border border-mist-200 rounded-lg" placeholder="Ex: Supermercado" />
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-mist-200">
          <label class="block text-sm font-medium text-mist-700 mb-2">Valor</label>
          <input type="number" [(ngModel)]="amount" name="amount" class="w-full px-3 py-2 border border-mist-200 rounded-lg" placeholder="0,00" />
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-mist-200">
          <label class="block text-sm font-medium text-mist-700 mb-2">Categoria</label>
          <select [(ngModel)]="category" name="category" class="w-full px-3 py-2 border border-mist-200 rounded-lg">
            <option value="">Selecione</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Contas">Contas</option>
            <option value="Saúde">Saúde</option>
            <option value="Lazer">Lazer</option>
          </select>
        </div>
        <div class="flex gap-4 justify-end">
          <button type="button" (click)="cancel()" class="px-4 py-2 border border-mist-200 rounded-lg hover:bg-mist-50">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-budget-green text-white rounded-lg hover:bg-green-600">Criar</button>
        </div>
      </form>
    </div>
  `
})
export class TransactionFormComponent {
  type = "expense";
  description = "";
  amount = 0;
  category = "";
  constructor(private router: Router) {}
  onSubmit() { this.router.navigate(["/transactions"]); }
  cancel() { this.router.navigate(["/transactions"]); }
}
