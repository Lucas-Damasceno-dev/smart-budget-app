import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="bg-white border-b border-mist-200 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="pi pi-wallet text-2xl text-budget-green"></i>
          <span class="text-xl font-semibold text-mist-800">Smart Budget</span>
        </div>
        <a routerLink="/transactions/new" class="bg-budget-green hover:bg-green-600 text-white px-4 py-2 rounded-lg">+ Nova Transacao</a>
      </header>
      <div class="flex flex-1">
        <aside class="w-64 bg-white border-r border-mist-200 hidden md:block">
          <nav class="p-4 space-y-2">
            @for (item of menuItems; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="bg-mist-100" class="flex items-center gap-3 px-4 py-3 rounded-lg text-mist-600 hover:bg-mist-50">
                <i class="pi {{ item.icon }}"></i>
                {{ item.label }}
              </a>
            }
          </nav>
        </aside>
        <main class="flex-1 p-6 bg-mist-50 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi-chart-bar', route: '/dashboard' },
    { label: 'Transacoes', icon: 'pi-list', route: '/transactions' },
    { label: 'Metas', icon: 'pi-flag', route: '/goals' },
    { label: 'Relatorios', icon: 'pi-chart-line', route: '/reports' },
    { label: 'Categorias', icon: 'pi-tags', route: '/categories' }
  ];
}