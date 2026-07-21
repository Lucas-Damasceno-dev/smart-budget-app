# FinanceFlow Frontend

Aplicação Angular para gerenciamento de finanças pessoais.

## Tecnologias

- Angular 18 (Standalone Components)
- Angular Material 17
- NgRx (State Management)
- RxJS
- ng2-charts (Chart.js)
- PWA (Service Worker)

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start

# Acesse: http://localhost:4200
```

## Build

```bash
# Build de desenvolvimento
npm run build

# Build de produção
npm run build:prod
```

## Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:ci
```

## Estrutura

```
src/app/
├── core/              # Serviços, Guards, Interceptors
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── shared/            # Componentes e pipes reutilizáveis
├── features/          # Feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── accounts/
│   ├── reports/
│   └── settings/
├── store/             # NgRx state management
│   ├── actions/
│   ├── effects/
│   ├── reducers/
│   └── selectors/
└── app.component.ts
```

## Design System

- **Cores principais:**
  - Primária: #2563eb (azul)
  - Secundária: #059669 (verde)
  - Erro: #dc2626 (vermelho)

- **Breakpoints (mobile-first):**
  - xs: 360px
  - sm: 600px
  - md: 960px
  - lg: 1280px

## PWA

A aplicação suporta instalação como PWA e funciona offline para visualização de dados em cache.

## Docker

```bash
# Build da imagem
docker build -t financeflow/frontend:latest .

# Executar
docker run -p 80:80 financeflow/frontend:latest
```
