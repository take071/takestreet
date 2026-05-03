# TAKESTREET — Setup Completo

## 📁 Estrutura

```
project/
├── backend/
│   ├── server.js              # Entrada da aplicação
│   ├── package.json
│   ├── .env.example           # Copie para .env e preencha
│   ├── prisma/
│   │   ├── schema.prisma      # Models: User, Product, Wishlist
│   │   └── seed.js            # Dados iniciais
│   ├── config/
│   │   └── prisma.js          # Singleton do Prisma Client
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── products.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verify
│   │   ├── validate.middleware.js   # Joi schemas
│   │   └── rateLimit.middleware.js  # express-rate-limit
│   └── routes/
│       ├── auth.routes.js
│       ├── products.routes.js
│       └── wishlist.routes.js
└── frontend/
    ├── index.html
    └── static/
        ├── css/style.css
        └── js/app.js          # JS integrado com a API
```

---

## ⚙️ Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14 rodando localmente ou em nuvem

---

## 🚀 Instalação passo a passo

### 1. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://SEU_USER:SUA_SENHA@localhost:5432/takestreet"
JWT_SECRET="cole_aqui_uma_chave_longa_e_aleatoria"
PORT=3000
NODE_ENV=development
```

Para gerar um JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 2. Criar o banco de dados

```bash
# No PostgreSQL (psql ou via pgAdmin):
CREATE DATABASE takestreet;
```

---

### 3. Instalar dependências e rodar migrations

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

---

### 4. Popular o banco com dados iniciais

```bash
npm run db:seed
```

Isso cria:
- Usuário admin: `admin` / `ts@admin2025`
- 8 produtos de exemplo

---

### 5. Rodar o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

Acesse: **http://localhost:3000**

---

## 🔌 Endpoints da API

### Auth
| Método | Rota              | Auth | Descrição         |
|--------|-------------------|------|-------------------|
| POST   | /api/auth/register | ✗   | Cadastro          |
| POST   | /api/auth/login    | ✗   | Login → JWT       |
| GET    | /api/auth/me       | ✓   | Dados do usuário  |

### Produtos
| Método | Rota                  | Auth  | Descrição           |
|--------|-----------------------|-------|---------------------|
| GET    | /api/products         | ✗     | Listar/filtrar      |
| GET    | /api/products/search  | ✗     | Busca por texto     |
| GET    | /api/products/:id     | ✗     | Detalhe             |
| POST   | /api/products         | ADMIN | Criar               |
| PUT    | /api/products/:id     | ADMIN | Atualizar           |
| DELETE | /api/products/:id     | ADMIN | Remover (soft)      |

Filtros disponíveis em `GET /api/products`:
```
?gender=masculino|feminino|unissex
?category=camisetas|moletons|calcas|jaquetas|tenis|acessorios
?platform=Shopee|Nike|Adidas|Amazon
?sort=preco-asc|preco-desc|novo
?q=texto de busca
?page=1&limit=20
```

### Wishlist (requer login)
| Método | Rota                     | Descrição              |
|--------|--------------------------|------------------------|
| GET    | /api/wishlist            | Listar favoritos       |
| GET    | /api/wishlist/ids        | Apenas os IDs          |
| POST   | /api/wishlist            | Adicionar `{productId}`|
| DELETE | /api/wishlist/:productId | Remover                |

---

## 🔒 Segurança implementada

| Camada          | Solução                    |
|-----------------|----------------------------|
| Senha           | bcrypt (cost 12)           |
| Token           | JWT HS256, expira em 7d    |
| Validação       | Joi (body + query)         |
| XSS             | xss-clean middleware       |
| Headers         | Helmet.js                  |
| Rate limit      | 10 req/15min (auth), 200 (api) |
| SQL injection   | Prisma ORM (queries parametrizadas) |
| CORS            | Configurável via .env      |
| Timing attacks  | Delay constante no login   |

---

## 🗄️ Gerenciar banco de dados

```bash
# Visualizar dados via interface web
npm run db:studio

# Resetar tudo e re-seedar
npm run db:reset
```

---

## 🐛 Problemas comuns

**"Can't reach database server"**
→ Verifique se o PostgreSQL está rodando e se o `DATABASE_URL` no `.env` está correto.

**"JWT_SECRET is not defined"**
→ O arquivo `.env` não foi criado. Copie `.env.example` para `.env`.

**"Prisma Client is not generated"**
→ Rode `npx prisma generate` dentro de `backend/`.
