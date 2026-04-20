# 1. OBJECTIVE

Implementar o frontend de um app de gestão financeira (Smart Budget) utilizando **Angular 21** com as últimas APIs modernas (Signals, Signal Forms, Resource API, Zoneless), **Tailwind CSS 4.2** com configuração CSS-first, e **PrimeNG 21** com plugin Tailwind para um MVP funcional e future-proof.

# 2. CONTEXT SUMMARY

- **Repositório:** `Lucas-Damasceno-dev/smart-budget-app` (GitHub)
- **Branch atual:** `main` (vazio, apenas README + LICENSE)
- **Stack recomendada:** Angular 21 + Tailwind CSS 4.2 + PrimeNG 21 + Chart.js
- **Estado:** Angular Signals + Signal Forms + Resource API (Zoneless)
- **Backend:** Implementado na branch "back" (não existe ainda no remote)
- **Objetivo:** Criar interface responsiva para gerenciar transações, categorias, metas mensais e visualização de dados através de dashboards

# 3. APPROACH OVERVIEW

Vou seguir a stack mais moderna do Angular 21 com as APIs mais recentes:

1. **Angular 21 - Era dos Signals:**
   - Signal Components (`signals: true`) para components future-proof
   - Signal Forms (experimental) para validação e tipagem forte
   - Resource API (`resource()`) para fetching sem observables manuais
   - Zoneless Change Detection para bundle menor e melhor performance
   - Computed signals para previsão de saldo em tempo real

2. **Tailwind CSS 4.2 - CSS-First:**
   - Configuração via `@theme` no CSS (sem tailwind.config.js)
   - Zero-config engine - detecta automaticamente arquivos
   - Novas paletas `mist` e `mauve` para interface moderna

3. **PrimeNG 21 - Integração Total:**
   - Plugin `tailwindcss-primeui` obrigatório para integração
   - CSS Layers para ordem correta de precedence
   - Tema Aura ou Nora (Tailwind-ready)

4. **Ferramentas Modernas:**
   - Vitest + Analog para testes unitários (padrão atual para Angular)
   - Playwright Component Testing para testes de UI
   - Chart.js para gráficos

5. **Deploy:**
   - Vercel para preview automático (tegração com GitHub)

# 4. IMPLEMENTATION STEPS

## Fase 1: Setup e Configuração do Projeto

### Step 1.1: Criar novo projeto Angular 21
- **Goal:** Inicializar projeto Angular 21 com Standalone + Zoneless
- **Method:**
  ```bash
  npx @angular/cli@21 new smart-budget-frontend --style=scss --routing --standalone --skip-git --skip-tests
  cd smart-budget-frontend
  ```
- **Reference:** Novo projeto Angular

### Step 1.2: Configurar Zoneless no app.config.ts
- **Goal:** Habilitar change detection sem Zone.js para melhor performance
- **Method:**
  ```typescript
  // No app.config.ts, substituir provideZoneChangeDetection por:
  provideExperimentalZonelessChangeDetection()
  ```
- **Reference:** src/app/app.config.ts

### Step 1.3: Configurar Tailwind CSS 4.2
- **Goal:** Adicionar utilitários CSS via @theme (CSS-first, sem config file)
- **Method:**
  ```bash
  npm install -D tailwindcss@4.2
  # No styles.scss:
  @theme {
    --color-budget-green: #10b981;
    --color-budget-red: #ef4444;
    --color-budget-gold: #f59e0b;
    --color-mist-50: #f8fafc;
    --color-mist-100: #f1f5f9;
  }
  @import "tailwindcss";
  ```
- **Reference:** src/styles.scss

### Step 1.4: Configurar ESLint + Prettier
- **Goal:** Manter código limpo e formatado
- **Method:**
  ```bash
  npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
  # Criar .eslintrc.json e .prettierrc
  ```
- **Reference:** .eslintrc.json, .prettierrc

---

## Fase 2: Instalação de Dependências

### Step 2.1: Instalar PrimeNG 21 + Tailwind Plugin
- **Goal:** Adicionar biblioteca de componentes com integração Tailwind 4
- **Method:**
  ```bash
  npm install primeng primeicons tailwindcss-primeui
  # Configurar no styles.scss:
  @layer theme, base, primeng, tailwind-utilities;
  @import "tailwindcss";
  @import "tailwindcss-primeui";
  ```
- **Importante:** A @layer `primeng` deve vir ANTES de `tailutilities` para que classes Tailwind sobrescrevam estilos do PrimeNG quando necessário
- **Reference:** src/styles.scss

### Step 2.2: Instalar Chart.js + ng2-charts
- **Goal:** Adicionar visualização de dados (gráficos)
- **Method:**
  ```bash
  npm install chart.js ng2-charts
  ```
- **Reference:** Gráficos de pizza/linha

### Step 2.3: Instalar utilitários
- **Goal:** Adicionar bibliotecas de utility
- **Method:**
  ```bash
  npm install date-fns
  ```
- **Reference:** Manipulação de datas

---

## Fase 3: Configuração do App

### Step 3.1: Configurar app.config.ts com Angular 21
- **Goal:** Configurar providers globais (HTTP, Router, Zoneless, Theme)
- **Method:**
  ```typescript
  // providers:
  provideHttpClient(),
  provideRouter(routes),
  provideExperimentalZonelessChangeDetection(),
  // Theme via CSS (Tailwind 4)
  ```
- **Reference:** src/app/app.config.ts

### Step 3.2: Configurar ambiente
- **Goal:** Definir URLs de API por ambiente
- **Method:** Criar environment.ts e environment.prod.ts
- **Reference:** src/environments/

### Step 3.3: Setup de assets e estruturas
- **Goal:** Organizar pastas do projeto
- **Method:** Criar diretórios src/app/components, pages, services, models, guards, interceptors

---

## Fase 4: Implementação de Componentes Base

### Step 4.1: Criar layout principal (Shell)
- **Goal:** Criar estrutura base com sidebar, header, content
- **Method:** Usar PrimeNG PanelMenu para sidebar, Toolbar para header
- **Reference:** src/app/components/layout/

### Step 4.2: Criar componentes reutilizáveis
- **Goal:** Desenvolver componentes básicos
- **Method:**
  - TransactionCard (card de transação)
  - BalanceWidget (widget de saldo)
  - CategoryBadge (badge de categoria)
  - CurrencyInput (input de moeda)
- **Reference:** src/app/components/shared/

### Step 4.3: Configurar Storybook
- **Goal:** Desenvolver componentes isoladamente
- **Method:**
  ```bash
  npx storybook@latest init
  # Desenvolver componentes no Storybook
  ```
- **Reference:** .storybook/

---

## Fase 5: Páginas e Funcionalidades

### Step 5.1: Página de Dashboard
- **Goal:** Criar tela principal com visão geral
- **Method:** Mostrar saldo total, gráficos de gastos por categoria, evolução mensal
- **Reference:** src/app/pages/dashboard/

### Step 5.2: Página de Transações
- **Goal:** Listar e gerenciar transações
- **Method:** Tabela com filtros PrimeNG, criar/editar/delete transação
- **Nota:** Usar **Signal Forms** (`@angular/forms/signals`) para formulários com validação automática e tipagem forte
- **Reference:** src/app/pages/transactions/

### Step 5.3: Página de Metas
- **Goal:** Definir e acompanhar metas mensais
- **Method:** Progress bars, alertas de limite
- **Reference:** src/app/pages/goals/

### Step 5.4: Página de Relatórios
- **Goal:** Visualizar dados detalhados
- **Method:** Gráficos Chart.js, exportáveis
- **Reference:** src/app/pages/reports/

### Step 5.5: Página de Categorias
- **Goal:** Gerenciar categorias de gastos
- **Method:** CRUD de categorias com ícones
- **Reference:** src/app/pages/categories/

---

## Fase 6: Estado e Integração com API (Angular 21 Signals + Resource)

### Step 6.1: Criar serviços de API com Resource API
- **Goal:** Comunicação com backend usando `resource()` (sem observables manuais)
- **Method:**
  ```typescript
  // Exemplo com resource():
  transactions = resource<Transaction[], void>(() => this.http.get<Transaction[]>('/api/transactions'));
  
  // Para criar/editar:
  createTransaction(data: Transaction) {
    return this.http.post('/api/transactions', data);
  }
  ```
- **Reference:** src/app/services/

### Step 6.2: Criar Signal Store para global state
- **Goal:** Gerenciar estado global das transações
- **Method:**
  ```typescript
  // Using Angular Signals
  private balance = signal(0);
  private transactions = signal<Transaction[]>([]);
  
  // Computed - previsão de saldo em tempo real
  readonly projectedBalance = computed(() => 
    this.transactions().reduce((sum, t) => sum + t.amount, 0)
  );
  ```
- **Reference:** src/app/services/

### Step 6.3: Criar interceptors
- **Goal:** Adicionar token JWT, tratar erros
- **Method:** Criar AuthInterceptor, ErrorInterceptor
- **Reference:** src/app/interceptors/

---

## Fase 7: Testes (Vitest + Analog + Playwright)

### Step 7.1: Configurar Vitest + Analog
- **Goal:** Testes unitários rápidos (padrão atual para Angular 21)
- **Method:**
  ```bash
  npm install -D vitest @analogjs/vitest-angular
  # Configurar vitest.config.ts
  ```
- **Reference:** vitest.config.ts

### Step 7.2: Testes unitários
- **Goal:** Testar lógica de serviços e utilitários
- **Method:** 
  - Testar cálculo de saldo, filtros, computed signals
  - **Nota:** Para testar `resource()` (assíncrono), usar `waitFor` do Analog para aguardar o sinal de valor antes das asserções
  ```typescript
  import { waitFor } from '@analogjs/vitest-angular';
  
  it('should load transactions', async () => {
    await waitFor(() => service.transactions().length > 0);
    expect(service.transactions()).toHaveLength(5);
  });
  ```
- **Reference:** *.spec.ts

### Step 7.3: Testes de Componente com Playwright
- **Goal:** Testar interações complexas de UI (seletor de categorias)
- **Method:**
  ```bash
  npm init playwright@latest
  # Testar componentes isolados com Playwright Component Testing
  ```
- **Reference:** tests/components/

---

## Fase 8: Deploy

### Step 8.1: Configurar Vercel
- **Goal:** Deploy contínuo
- **Method:** Conectar repositório no Vercel, configurar build: ng build
- **Reference:** vercel.json (opcional)

### Step 8.2: Configurar GitHub Actions
- **Goal:** CI automático
- **Method:** Criar workflow para lint, test, build
- **Reference:** .github/workflows/

---

# 5. TESTING AND VALIDATION

## Critérios de Sucesso

1. **Build bem-sucedido:** `ng build` completa sem erros
2. **App inicia:** Servidor local roda na porta 4200
3. **Componentes renderizam:** UI exibe sem erros no console
4. **Dashboard funcional:** Gráficos renderizam dados de exemplo
5. **Transações CRUD:** Create, Read, Update, Delete funcionam
6. **Formulários válidos:** Validação de currency input funciona
7. **Testes passam:** `npm run test` e `npm run test:e2e` green

## Validação Visual

- Layout responsivo funciona em mobile/tablet/desktop
- Tema visual consistente
- Gráficos interativos (hover, click)
- Transições e animações suaves

## Integração com Backend

- API endpoints respondem corretamente
- Cache atualiza após mutations
- Tratamento de erros robusto

## Considerações Avançadas

- **SSR com Hydration:** Se utilizar Server-Side Rendering no futuro, o Angular 21 tem Event Replay aprimorado. Com Zoneless, a hidratação é quase imperceptível para o usuário.
- **Future-proof:** Os Signal Components (`signals: true`) garantem compatibilidade com versões futuras do Angular.
