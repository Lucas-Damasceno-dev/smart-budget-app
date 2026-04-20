import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AppStore } from "../../services/app.store";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-mist-800">Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6">
          <div class="text-mist-500 text-sm">Saldo Total</div>
          <div class="text-3xl font-bold text-budget-green">{{ store.projectedBalance() | currency:"BRL" }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6">
          <div class="text-mist-500 text-sm">Receitas do Mês</div>
          <div class="text-3xl font-bold text-budget-green">R$ 6.500</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-6">
          <div class="text-mist-500 text-sm">Despesas do Mês</div>
          <div class="text-3xl font-bold text-budget-red">R$ 550</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  store = inject(AppStore);
}
