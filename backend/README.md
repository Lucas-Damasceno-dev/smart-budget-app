# FinanceFlow Backend

API REST para gerenciamento de finanças pessoais.

## Tecnologias

- Java 21
- Spring Boot 3.3
- Spring Security (JWT/OAuth2)
- Spring Data JPA
- PostgreSQL 16
- Redis (cache e sessões)
- Flyway (migrações)
- Swagger/OpenAPI

## Pré-requisitos

- JDK 21
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL 16 (ou via Docker)

## Configuração

### Variáveis de Ambiente

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financeflow
DB_USERNAME=financeflow
DB_PASSWORD=financeflow123
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-at-least-256-bits
```

### Executando com Docker

```bash
# Iniciar banco e Redis
docker-compose up postgres redis -d

# Aguardar serviços estarem prontos
docker-compose logs -f postgres

# Executar API
./mvnw spring-boot:run
```

### Executando Manualmente

```bash
# Instalar dependências
./mvnw clean install -DskipTests

# Executar
./mvnw spring-boot:run
```

## Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard` | Dashboard com métricas |
| GET/POST | `/api/accounts` | CRUD de contas |
| GET/POST | `/api/transactions` | CRUD de transações |
| GET/POST | `/api/categories` | CRUD de categorias |
| GET | `/api/reports` | Relatórios financeiros |
| WS | `/api/ws/notifications` | WebSocket para notificações |

## Documentação da API

Swagger UI: `http://localhost:8080/api/swagger-ui.html`

OpenAPI Spec: `http://localhost:8080/api/v3/api-docs`

## Usuário Demo

- **Email:** demo@financeflow.com
- **Senha:** Demo@123

## Testes

```bash
# Executar todos os testes
./mvnw test

# Testes com cobertura
./mvnw test jacoco:report
```

## Build para Produção

```bash
# Build do JAR
./mvnw package -DskipTests

# Build Docker image
docker build -t financeflow/api:latest .
```

## Arquitetura

```
src/main/java/com/financeflow/
├── config/          # Configurações (Security, CORS, Swagger, WebSocket)
├── controller/      # Controllers REST
├── dto/             # Data Transfer Objects
├── entity/          # Entidades JPA
├── exception/       # Exceções customizadas
├── repository/      # Repositórios JPA
├── service/         # Lógica de negócio
└── util/            # Utilitários
```
