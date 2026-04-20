import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-goals",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-mist-800">Metas Mensais</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-4">
          <div class="font-semibold text-mist-800 mb-2">Alimentação</div>
          <div class="text-sm text-mist-500">R$ 890 / R$ 1.500</div>
          <div class="h-2 bg-mist-100 rounded-full mt-2"><div class="h-full bg-budget-green rounded-full" style="width:59%"></div></div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-4">
          <div class="font-semibold text-mist-800 mb-2">Lazer</div>
          <div class="text-sm text-mist-500">R$ 450 / R$ 500</div>
          <div class="h-2 bg-mist-100 rounded-full mt-2"><div class="h-full bg-yellow-500 rounded-full" style="width:90%"></div></div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-mist-200 p-4">
          <div class="font-semibold text-mist-800 mb-2">Transporte</div>
          <div class="text-sm text-mist-500">R$ 320 / R$ 600</div>
          <div class="h-2 bg-mist-100 rounded-full mt-2"><div class="h-full bg-budget-green rounded-full" style="width:53%"></div></div>
        </div>
      </div>
    </div>
  `
})
export class GoalsComponent {}
