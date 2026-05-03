// server.js — TAKESTREET Backend
require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const xssClean  = require('xss-clean');
const path      = require('path');

const { generalLimiter } = require('./middlewares/rateLimit.middleware');

const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/products.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Segurança ───────────────────────────────── */

app.use(helmet({
  contentSecurityPolicy: false // desabilitado pois o frontend usa inline scripts/styles
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(xssClean());           // sanitiza req.body, req.query, req.params
app.use(generalLimiter);       // rate limit global
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Logs ────────────────────────────────────── */

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ── Frontend estático ───────────────────────── */

const FRONTEND = path.join(__dirname, '..', 'frontend');
app.use('/static', express.static(path.join(FRONTEND, 'static')));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND, 'index.html'));
});

/* ── API Routes ──────────────────────────────── */

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);

/* ── Health check ────────────────────────────── */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

/* ── 404 ─────────────────────────────────────── */

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

/* ── Error handler global ────────────────────── */

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor.'
      : err.message
  });
});

/* ── Start ───────────────────────────────────── */

app.listen(PORT, () => {
  console.log(`\n🚀 TAKESTREET backend rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Banco: ${process.env.DATABASE_URL?.split('@')[1] || 'configurado no .env'}\n`);
});

module.exports = app;
