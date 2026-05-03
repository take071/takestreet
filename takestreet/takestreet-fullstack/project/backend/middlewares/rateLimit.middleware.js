// middlewares/rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

// Geral: 100 req / 15 min por IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

// Auth: 10 tentativas / 15 min (anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' }
});

// API: 200 req / 15 min
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de requisições atingido.' }
});

module.exports = { generalLimiter, authLimiter, apiLimiter };
