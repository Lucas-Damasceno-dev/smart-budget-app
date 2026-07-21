# FinanceFlow - Arquitetura

## Visão Geral

O FinanceFlow é uma aplicação de gerenciamento de finanças pessoais com arquitetura moderna de microsserviços, dividida em frontend (Angular) e backend (Spring Boot), comunicando-se via REST API e WebSocket.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENTE                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Angular 18 (PWA)                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │   NgRx      │  │   Services  │  │   Components        │   │  │
│  │  │   Store     │  │             │  │   (Standalone)      │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                    ┌─────────┴─────────┐                            │
│                    │ HTTP/REST + WS    │                            │
└────────────────────┼───────────────────┼────────────────────────────┘
                     │                   │
┌────────────────────┼───────────────────┼────────────────────────────┐
│                    │    NGINX          │                            │
│                    └─────────┬─────────┘                            │
│                              │                                       │
│  ┌───────────────────────────┴─────────────────────────────────┐    │
│  │                    Spring Boot 3.3                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │    │
│  │  │ Controllers │  │  Services   │  │   Security (JWT)    │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │    │
│  │  │ Repositories│  │  Entities   │  │   WebSocket         │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│  ┌──────┴──────┐     ┌───────┴───────┐    ┌──────┴──────┐          │
│  │ PostgreSQL  │     │    Redis      │    │   Flyway    │          │
│  │     16      │     │   (Cache)     │    │ (Migrations)│          │
│  └─────────────┘     └───────────────┘    └─────────────┘          │
│                             SERVIDOR                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Camadas do Backend

### 1. Controller Layer
- Endpoints REST
- Validação de requests
- Documentação Swagger

### 2. Service Layer
- Lógica de negócio
- Transações
- Eventos

### 3. Repository Layer
- Acesso a dados
- JPA/Hibernate
- Queries customizadas

### 4. Entity Layer
- Modelos de domínio
- Mapeamento ORM

## Fluxo de Autenticação

```
1. Cliente envia credenciais para /auth/login
2. Backend valida e gera JWT (access + refresh tokens)
3. Cliente armazena tokens
4. Requisições incluem "Authorization: Bearer {token}"
5. JwtAuthenticationFilter valida token
6. Refresh automático quando access token expira
```

## Modelo de Dados

### Entidades Principais

- **User**: Usuários do sistema
- **Account**: Contas bancárias/carteiras
- **Transaction**: Transações financeiras
- **Category**: Categorias de transações
- **Budget**: Orçamentos mensais
- **Investment**: Investimentos
- **Notification**: Notificações

### Relacionamentos

```
User 1:N Account
User 1:N Category
User 1:N Transaction
Account 1:N Transaction
Category 1:N Transaction
Category 1:N Category (subcategorias)
```

## Comunicação Real-time

WebSocket (STOMP) para:
- Notificações de orçamento
- Atualizações de saldo
- Alertas de gastos atípicos

## Cache Strategy

Redis usado para:
- Dashboard (5 min TTL)
- Contas (15 min TTL)
- Categorias (1 hora TTL)
- Sessions JWT

## Segurança

- JWT com RS256
- Refresh tokens rotativos
- Rate limiting
- CORS restrito
- HTTPS em produção
- Sanitização de inputs
- BCrypt para senhas
