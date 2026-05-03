# 🟡 TAKESTREET | Urban Curation & Systems Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Culture-Streetwear%20%7C%20Trap%20%7C%20Hip--Hop-black?style=for-the-badge" />
</p>

---

## ⚡ A Proposta (The Vision)

O **TAKESTREET** não é apenas um template de e-commerce — é uma plataforma de curadoria streetwear que reflete a cultura **Trap, Hip-Hop e Boombap brasileiro** através de uma interface digital de alto impacto.

O projeto nasce da necessidade de unir a estética urbana "sem filtro" com uma arquitetura de software estruturada, focada em organização, performance e escalabilidade.

---

## 🏗️ Arquitetura de Sistemas & Engenharia

O TAKESTREET passou por uma evolução significativa: saiu de um protótipo em **Flask (Python)** para uma arquitetura **fullstack desacoplada** com Node.js + Express no backend e frontend estático servido pela própria API.

### 💻 Backend Core

| Componente | Tecnologia | Descrição |
|---|---|---|
| **Runtime** | Node.js >= 18 | Servidor de alta performance e ecossistema maduro |
| **Framework** | Express.js 4 | Roteamento modular, middlewares em cadeia |
| **ORM** | Prisma 5 | Type-safe queries, migrations e Prisma Studio |
| **Banco de Dados** | PostgreSQL >= 14 | Persistência relacional robusta |
| **Autenticação** | JWT (HS256) | Tokens com expiração configurável (padrão: 7 dias) |
| **Validação** | Joi | Schemas para body e query params |

### 🔒 Camadas de Segurança

| Camada | Solução |
|---|---|
| Senha | bcrypt (cost factor 12) |
| Token | JWT HS256, expiração configurável |
| Validação | Joi (body + query params) |
| XSS | xss-clean middleware |
| Headers HTTP | Helmet.js |
| Rate Limit | 10 req/15min (auth) · 200 req/15min (API geral) |
| SQL Injection | Prisma ORM (queries parametrizadas) |
| CORS | Configurável via variável de ambiente |
| Timing Attacks | Delay constante no fluxo de login |

### 🎨 Frontend & UX Strategy

| Componente | Descrição |
|---|---|
| **Identidade Visual** | Tema escuro com tipografia pesada e elementos em amarelo, inspirado na sinalização e estética urbana |
| **UX-Driven Design** | Fluxo de navegação desenhado para reduzir a fricção: *descoberta → interesse → ação (wishlist)* |
| **Responsividade** | Layout adaptável para múltiplos dispositivos, mantendo consistência visual e agressividade da marca |
| **Integração** | Frontend estático consumindo a API REST diretamente via JS |

---

## 📂 Estrutura do Projeto

```bash
takestreet/
├── backend/
│   ├── server.js                      # Entrada da aplicação
│   ├── package.json
│   ├── .env.example                   # Copie para .env e preencha
│   ├── config/
│   │   └── prisma.js                  # Singleton do Prisma Client
│   ├── prisma/
│   │   ├── schema.prisma              # Models: User, Product, Wishlist
│   │   └── seed.js                    # Dados iniciais para dev
│   ├── controllers/
│   │   ├── auth.controller.js         # Register, Login, Me
│   │   ├── products.controller.js     # CRUD + filtros + busca
│   │   └── wishlist.controller.js     # Adicionar/remover/listar favoritos
│   ├── middlewares/
│   │   ├── auth.middleware.js         # JWT verify + requireAdmin
│   │   ├── validate.middleware.js     # Joi schemas
│   │   └── rateLimit.middleware.js    # express-rate-limit
│   └── routes/
│       ├── auth.routes.js
│       ├── products.routes.js
│       └── wishlist.routes.js
└── frontend/
    ├── index.html
    └── static/
        ├── css/style.css              # Estilização (Urban style)
        └── js/app.js                  # Lógica cliente + integração API
```

---

## 🗄️ Modelo de Dados (Prisma Schema)

```
User        Product         Wishlist
────────    ────────────    ──────────────
id          id              id
username    name            userId  → User
email       brand           productId → Product
password    price           createdAt
role        oldPrice
createdAt   gender
            category
            platform
            badge / icon
            tags[]
            desc / link / img
            active
```

**Enums:**
- `Role`: `USER` · `ADMIN`
- `Gender`: `masculino` · `feminino` · `unissex`
- `Category`: `camisetas` · `moletons` · `calcas` · `jaquetas` · `tenis` · `acessorios`

---

## 🔌 Endpoints da API

### Auth

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | ✗ | Cadastro de usuário |
| POST | `/api/auth/login` | ✗ | Login → retorna JWT |
| GET | `/api/auth/me` | ✓ | Dados do usuário logado |

### Produtos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/products` | ✗ | Listar com filtros e paginação |
| GET | `/api/products/search` | ✗ | Busca por texto |
| GET | `/api/products/:id` | ✗ | Detalhe de um produto |
| POST | `/api/products` | ADMIN | Criar produto |
| PUT | `/api/products/:id` | ADMIN | Atualizar produto |
| DELETE | `/api/products/:id` | ADMIN | Remover (soft delete) |

**Filtros disponíveis em `GET /api/products`:**
```
?gender=masculino|feminino|unissex
?category=camisetas|moletons|calcas|jaquetas|tenis|acessorios
?platform=Shopee|Nike|Adidas|Amazon
?sort=preco-asc|preco-desc|novo
?q=texto de busca
?page=1&limit=20
```

### Wishlist (requer login)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/wishlist` | Listar produtos favoritos |
| GET | `/api/wishlist/ids` | Retornar apenas os IDs |
| POST | `/api/wishlist` | Adicionar `{ productId }` |
| DELETE | `/api/wishlist/:productId` | Remover dos favoritos |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14 rodando localmente ou em nuvem

### 1. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://SEU_USER:SUA_SENHA@localhost:5432/takestreet"
JWT_SECRET="cole_aqui_uma_chave_longa_e_aleatoria"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

Para gerar um `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Criar o banco de dados

```sql
-- No PostgreSQL (psql ou pgAdmin):
CREATE DATABASE takestreet;
```

### 3. Instalar dependências e rodar migrations

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

### 4. Popular o banco com dados iniciais

```bash
npm run db:seed
```

Isso cria:
- Usuário admin: `admin` / `ts@admin2025`
- 8 produtos de exemplo

### 5. Rodar o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

Acesse: **http://localhost:3000**

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia com nodemon (hot reload) |
| `npm start` | Inicia em produção |
| `npm run db:migrate` | Roda nova migration |
| `npm run db:seed` | Popula o banco com dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio (GUI do banco) |
| `npm run db:reset` | Reseta tudo e re-seeda |

---

## 🐛 Problemas Comuns

**"Can't reach database server"**
→ Verifique se o PostgreSQL está rodando e se o `DATABASE_URL` no `.env` está correto.

**"JWT_SECRET is not defined"**
→ O arquivo `.env` não foi criado. Copie `.env.example` para `.env`.

**"Prisma Client is not generated"**
→ Rode `npx prisma generate` dentro de `backend/`.

---

## 🤖 Liderança Técnica com IA (AI Orchestration)

O projeto atua como um experimento em **desenvolvimento orientado por Inteligência Artificial**, demonstrando competência em direção técnica assistida:

- **Prompt Engineering** — Uso estruturado e avançado de prompts para geração de lógica, refatoração de código complexo e resolução de bugs
- **Apoio em Decisão Técnica** — Utilização de modelos de linguagem como suporte estratégico para decisões de arquitetura e organização de arquivos
- **Eficiência de Desenvolvimento** — Otimização do tempo em tarefas repetitivas e aceleração do ciclo de iteração

---

## 🚀 Roadmap de Evolução

| Status | Feature | Descrição |
|---|---|---|
| ✅ | **Data Persistence** | PostgreSQL + Prisma ORM integrados |
| ✅ | **Security Layer** | JWT, bcrypt, Helmet, rate limit, XSS protection |
| ✅ | **API REST** | Backend desacoplado com Express.js |
| ✅ | **Wishlist** | Sistema de favoritos por usuário autenticado |
| ✅ | **RBAC** | Controle de acesso por roles (USER / ADMIN) |
| ⬜ | **DevOps** | Pipeline CI/CD e automação de deploy |
| ⬜ | **Testes** | Cobertura com Jest (unit + integration) |
| ⬜ | **Upload de Imagens** | Storage para fotos dos produtos |
| ⬜ | **Frontend Framework** | Migração para React ou Vue |

---

## 👨‍💻 Autor & Direção Técnica

**Arthur Felipe (Take)**
Estudante de Sistemas de Informação — UNEB (3º semestre)

> Focado em desenvolvimento Web, arquitetura de sistemas e na aplicação da tecnologia como uma extensão da cultura urbana e da experiência do usuário.

---

<p align="center">
  Feito com 🖤 e cultura urbana por <strong>Take</strong>
</p>
