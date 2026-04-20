import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-mist-800">Categorias</h1>
      <div class="bg-white rounded-lg shadow-sm border border-mist-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-mist-50">
            <tr class="text-left text-xs font-medium text-mist-500 uppercase">
              <th class="px-6 py-3">Nome</th>
              <th class="px-6 py-3">Cor</th>
              <th class="px-6 py-3 text-center">Transações</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-mist-100"><td class="px-6 py-4"><i class="pi pi-briefcase mr-2" style="color:#10b981"></i>Trabalho</td><td class="px-6 py-4"><div class="w-6 h-6 rounded bg-green-500"></div></td><td class="px-6 py-4 text-center">45</td></tr>
            <tr class="border-t border-mist-100"><td class="px-6 py-4"><i class="pi pi-shopping-cart mr-2" style="color:#f59e0b"></i>Alimentação</td><td class="px-6 py-4"><div class="w-6 h-6 rounded bg-yellow-500"></div></td><td class="px-6 py-4 text-center">23</td></tr>
            <tr class="border-t border-mist-100"><td class="px-6 py-4"><i class="pi pi-car mr-2" style="color:#3b82f6"></i>Transporte</td><td class="px-6 py-4"><div class="w-6 h-6 rounded bg-blue-500"></div></td><td class="px-6 py-4 text-center">15</td></tr>
            <tr class="border-t border-mist-100"><td class="px-6 py-4"><i class="pi pi-credit-card mr-2" style="color:#ef4444"></i>Contas</td><td class="px-6 py-4"><div class="w-6 h-6 rounded bg-red-500"></div></td><td class="px-6 py-4 text-center">8</td></tr>
            <tr class="border-t border-mist-100"><td class="px-6 py-4"><i class="pi pi-heart mr-2" style="color:#ec4899"></i>Saúde</td><td class="px-6 py-4"><div class="w-6 h-6 rounded bg-pink-500"></div></td><td class="px-6 py-4 text-center">5</td></tr>
            <tr class="border-t border-mist-100"><td class="px-6 py-4"><i class="pi pi-star mr-2" style="color:#8b5cf6"></i>Lazer</td><td class="px-6 py-4"><div class="w-6 h-6 rounded bg-purple-500"></div></td><td class="px-6 py-4 text-center">12</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CategoriesComponent {}
