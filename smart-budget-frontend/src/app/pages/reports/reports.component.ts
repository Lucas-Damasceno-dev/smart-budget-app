import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-mist-800">Relatórios</h1>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6 text-center"><div class="text-mist-500 text-sm">Total Receitas</div><div class="text-2xl font-bold text-budget-green">R$ 12.000</div></div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6 text-center"><div class="text-mist-500 text-sm">Total Despesas</div><div class="text-2xl font-bold text-budget-red">R$ 8.500</div></div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6 text-center"><div class="text-mist-500 text-sm">Saldo</div><div class="text-2xl font-bold text-budget-green">R$ 3.500</div></div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6 text-center"><div class="text-mist-500 text-sm">Média Diária</div><div class="text-2xl font-bold text-mist-800">R$ 283</div></div>
      </div>
    </div>
  `
})
export class ReportsComponent {}
