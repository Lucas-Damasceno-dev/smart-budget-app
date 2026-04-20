import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-mist-800">Transacoes</h1>
        <a routerLink="/transactions/new" class="bg-budget-green hover:bg-green-600 text-white px-4 py-2 rounded-lg">+ Nova Transacao</a>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-mist-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-mist-50">
            <tr class="text-left text-xs font-medium text-mist-500 uppercase">
              <th class="px-6 py-3">Data</th>
              <th class="px-6 py-3">Descricao</th>
              <th class="px-6 py-3">Categoria</th>
              <th class="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-mist-100">
              <td class="px-6 py-4">15/04/2026</td>
              <td class="px-6 py-4 font-medium">Salario</td>
              <td class="px-6 py-4"><span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Trabalho</span></td>
              <td class="px-6 py-4 text-right text-budget-green">R$ 5.000</td>
            </tr>
            <tr class="border-t border-mist-100">
              <td class="px-6 py-4">14/04/2026</td>
              <td class="px-6 py-4 font-medium">Supermercado</td>
              <td class="px-6 py-4"><span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Alimentacao</span></td>
              <td class="px-6 py-4 text-right text-budget-red">R$ 350</td>
            </tr>
            <tr class="border-t border-mist-100">
              <td class="px-6 py-4">13/04/2026</td>
              <td class="px-6 py-4 font-medium">Internet</td>
              <td class="px-6 py-4"><span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Contas</span></td>
              <td class="px-6 py-4 text-right text-budget-red">R$ 120</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TransactionsComponent {}