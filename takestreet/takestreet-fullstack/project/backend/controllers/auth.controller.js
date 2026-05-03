// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../config/prisma');

/* ── Helpers ─────────────────────────────────── */

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

/* ── POST /api/auth/register ─────────────────── */

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Verifica duplicata
    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          ...(email ? [{ email: { equals: email, mode: 'insensitive' } }] : [])
        ]
      }
    });

    if (exists) {
      const field = exists.username.toLowerCase() === username.toLowerCase()
        ? 'Nome de usuário'
        : 'E-mail';
      return res.status(409).json({ error: `${field} já está em uso.` });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, email: email || null, password: hash }
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('[auth/register]', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}

/* ── POST /api/auth/login ────────────────────── */

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } }
    });

    // Timing-safe: sempre executa hash mesmo se usuário não existe
    const dummyHash = '$2a$12$dummyhashtopreventtimingattacks000000000000000000000';
    const match = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !match) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const token = signToken(user);

    return res.json({
      message: `Bem-vindo, ${user.username}!`,
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Erro interno no login.' });
  }
}

/* ── GET /api/auth/me ────────────────────────── */

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({ user });
  } catch (err) {
    console.error('[auth/me]', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}

module.exports = { register, login, me };
