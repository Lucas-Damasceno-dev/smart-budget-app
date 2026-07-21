# Projeto FinanceFlow

Crie uma aplicação completa de gerenciamento de finanças pessoais chamada "FinanceFlow" com design moderno e mobile-first. Use exatamente estas tecnologias principais:

- **BACKEND**: Java 21 + Spring Boot 3.3 + Spring Security (JWT/OAuth2) + Spring Data JPA + Spring Validation
- **DATABASE**: PostgreSQL 16 (Dockerizado) + Flyway para migrações
- **FRONTEND**: Angular 18 + Standalone Components + Angular Material 17 + RxJS + NgRx (State Management)
- **CONTAINERS**: Docker Compose (multi-stage builds) + Dockerfiles otimizados
- **ESTRUTURA**: API REST + WebSockets (para real-time) + Swagger/OpenAPI

## FEATURES OBRIGATÓRIAS (MVP + Avançado):

### 1. **CADASTRO & AUTENTICAÇÃO**
- Registro/login com email + senha + Google OAuth
- Recuperação de senha + 2FA (TOTP)
- Perfis: Usuário individual / Família compartilhada
- Roles: Admin, User, Viewer

### 2. **DASHBOARD PRINCIPAL** (Real-time)
Métricas principais:
- Saldo atual (todas contas)
- Receitas vs Despesas (mês atual)
- Fluxo de caixa projetado (30 dias)
- Net worth evolução
- Top 5 categorias (gastos/receitas)
- Cards interativos + Gráficos animados (Chart.js/Ng-Charts)
- Filtros: período, conta, categoria

### 3. **TRANSAÇÕES (Core Feature)**
CRUD completo com:
- Data, valor, categoria, conta origem/destino
- Tags múltiplas + anexos (recibos)
- Recorrência (diária/semanal/mensal)
- Split (dividir transação em múltiplas categorias)
- Transferências entre contas
- Busca avançada + filtros dinâmicos
- Upload de recibos (extração OCR básica via API)

### 4. **CONTAS & CARTEIRAS**
- Conta Corrente, Poupança, Investimentos, Cartão
- Saldo inicial + histórico de movimentações
- Sincronização mock com APIs bancárias (Open Banking)
- Metas de saldo por conta

### 5. **CATEGORIAS & ORÇAMENTO**
Hierarquia: Categoria > Subcategoria
- Orçamento mensal por categoria
- Alertas quando 80%/100% atingido
- Sugestão automática de categoria (ML básico)
- Dashboard de orçamento visual (pizza + barras)

### 6. **RELATÓRIOS AVANÇADOS**
- Evolução patrimonial (linha temporal)
- Fluxo de caixa (cashflow waterfall)
- Pareto 80/20 (maiores gastos)
- Comparativo mês atual vs anterior
- Export PDF/CSV/Excel
- Custom reports + templates pré-definidos

### 7. **INVESTIMENTOS & PATRIMÔNIO**
- Ações, FIIs, Tesouro Direto, Cripto
- Cálculo de rentabilidade (TIR/CDI)
- Dividendos/Yields automáticos
- Rebalanceamento de carteira

### 8. **INTELIGÊNCIA & AUTOMATIZAÇÃO**
- Sugestões de economia baseadas em padrões
- Alertas inteligentes (gastos atípicos)
- Geração automática de categorias
- Planejamento de grandes compras

## ARQUITETURA TÉCNICA:

### BACKEND (estrutura esperada):
```text
src/main/java/com/financeflow/
├── config/ (Security, CORS, Swagger)
├── controller/ (Transactions, Accounts, Reports)
├── dto/ (Request/Response mapeados)
├── entity/ (User, Account, Transaction, Category)
├── repository/
├── service/
├── exception/
└── util/
```

**Endpoints principais (Swagger documentado):**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/accounts/{id}/balance`
- `POST /api/transactions`
- `GET /api/transactions/report`
- `POST /api/categories/bulk`
- `WEBSOCKET /ws/notifications`

### FRONTEND (Angular 18):
```text
src/app/
├── core/ (interceptors, guards, services)
├── shared/ (components, pipes, directives)
├── features/
│ ├── dashboard/
│ ├── transactions/
│ ├── accounts/
│ ├── reports/
│ └── settings/
├── store/ (NgRx effects/reducers)
└── app.component.ts (standalone)
```

**Design System:**
- Angular Material + Custom Theme (primária: #2563eb, secundária: #059669)
- Breakpoints mobile-first (xs: 360px, sm: 600px, md: 960px)
- Dark/Light mode toggle
- Loading skeletons + Error boundaries

### DOCKER (docker-compose.yml):
Services:
- `postgres:16` (volumes persistentes)
- `financeflow-api` (multi-stage: build + runtime)
- `financeflow-frontend` (nginx serve)
- `redis` (cache + sessions)

## CRITÉRIOS DE QUALIDADE:
✅ **Código limpo**: SOLID, DRY, camadas bem separadas  
✅ **Performance**: Paginação, cache Redis, índices Postgres  
✅ **Segurança**: Sanitização, JWT refresh, CORS restrito  
✅ **Testes**: 80% coverage (JUnit + Cypress + Jest)  
✅ **CI/CD**: GitHub Actions (lint, test, build, deploy)  
✅ **PWA**: Service Worker + Manifest (offline-first)  
✅ **i18n**: PT-BR + EN (Angular i18next)  
✅ **Acessibilidade**: WCAG 2.1 AA  

## DELIVERABLES ESPERADOS:
```text
📁 financeflow/
├── backend/ (Spring Boot completo)
│ ├── Dockerfile, docker-compose.yml
│ └── README.md (endpoints + setup)
├── frontend/ (Angular 18 standalone)
│ ├── Dockerfile, nginx.conf
│ └── README.md (build + deploy)
├── docs/ (arquitetura, API, screenshots)
└── deploy/ (docker-compose.prod.yml)
```

## COMANDOS PARA TESTAR:
```bash
# Backend
docker-compose up postgres
mvn spring-boot:run
curl http://localhost:8080/api/health

# Frontend
npm install && ng serve
# ou: docker-compose up frontend

# Full stack
docker-compose up --build
```

Crie PRIMEIRO o backend completo (com banco populado), DEPOIS frontend integrado, finalmente Docker. Gere screenshots do design final. Foque em UX fluida e dados realistas (seed com 1000+ transações).

Mantenha código production-ready desde o início. Progress report a cada 2 horas.

---
*Este prompt é auto-contido, específico para seu stack (Java/Angular/PostgreSQL/Docker) e gera uma app rica com 20+ features. Perfeito para rodar com os stop hooks que configuramos anteriormente! 🚀*
