# FinanceFlow

Aplicação completa de gerenciamento de finanças pessoais com design moderno e mobile-first.

## 🚀 Tecnologias

### Backend
- Java 21 + Spring Boot 3.3
- Spring Security (JWT/OAuth2)
- Spring Data JPA + Spring Validation
- PostgreSQL 16 + Flyway
- Redis (cache + sessões)
- WebSocket para notificações real-time
- Swagger/OpenAPI

### Frontend
- Angular 18 (Standalone Components)
- Angular Material 17
- NgRx (State Management)
- ng2-charts (Chart.js)
- PWA (Service Worker)

### Infraestrutura
- Docker Compose (multi-stage builds)
- GitHub Actions (CI/CD)

## 📋 Features

### Autenticação
- ✅ Registro/Login com email + senha
- ✅ OAuth2 com Google
- ✅ 2FA (TOTP)
- ✅ Recuperação de senha
- ✅ Perfis: Individual / Família

### Dashboard
- ✅ Saldo total (todas contas)
- ✅ Receitas vs Despesas
- ✅ Fluxo de caixa projetado
- ✅ Top categorias
- ✅ Gráficos interativos
- ✅ Notificações real-time

### Transações
- ✅ CRUD completo
- ✅ Categorias hierárquicas
- ✅ Tags múltiplas
- ✅ Transações recorrentes
- ✅ Split de categorias
- ✅ Transferências entre contas
- ✅ Busca avançada + filtros

### Contas
- ✅ Conta Corrente, Poupança, Investimentos, Cartão
- ✅ Metas de saldo
- ✅ Histórico de movimentações

### Orçamento
- ✅ Orçamento mensal por categoria
- ✅ Alertas 80%/100%
- ✅ Dashboard visual

### Relatórios
- ✅ Evolução patrimonial
- ✅ Fluxo de caixa
- ✅ Análise Pareto (80/20)
- ✅ Comparativo mensal
- ✅ Export PDF/CSV/Excel

## 🛠️ Instalação

### Pré-requisitos
- Docker & Docker Compose
- Java 21 (para desenvolvimento)
- Node.js 20+ (para desenvolvimento)

### Quick Start com Docker

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeflow.git
cd financeflow

# Inicie todos os serviços
docker-compose up --build

# Acesse:
# - Frontend: http://localhost
# - API: http://localhost:8080/api
# - Swagger: http://localhost:8080/api/swagger-ui.html
```

### Desenvolvimento

#### Backend
```bash
cd backend

# Inicie banco e Redis
docker-compose up postgres redis -d

# Execute a aplicação
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend

# Instale dependências
npm install

# Inicie servidor de desenvolvimento
npm start
```

## 👤 Usuário Demo

- **Email:** demo@financeflow.com
- **Senha:** Demo@123

## 📚 API Documentation

A documentação completa da API está disponível em:
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI Spec: http://localhost:8080/api/v3/api-docs

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard` | Dashboard com métricas |
| GET/POST | `/api/accounts` | CRUD de contas |
| GET/POST | `/api/transactions` | CRUD de transações |
| GET/POST | `/api/categories` | CRUD de categorias |
| GET | `/api/reports` | Relatórios financeiros |

## 📁 Estrutura do Projeto

```
financeflow/
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # Angular SPA
│   ├── src/app/
│   ├── Dockerfile
│   └── package.json
├── deploy/                  # Configurações de deploy
│   └── docker-compose.prod.yml
├── docs/                    # Documentação
└── docker-compose.yml       # Dev environment
```

## 🧪 Testes

```bash
# Backend (80% coverage target)
cd backend && mvn test

# Frontend
cd frontend && npm test
```

## 📱 PWA

A aplicação funciona como PWA, permitindo:
- Instalação no dispositivo
- Funcionamento offline
- Notificações push (futuro)

## 🔒 Segurança

- JWT com refresh tokens
- Rate limiting
- CORS configurado
- Sanitização de inputs
- Criptografia de senhas (BCrypt)

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
