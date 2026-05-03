// controllers/products.controller.js
const prisma = require('../config/prisma');

/* ── Helpers ─────────────────────────────────── */

function buildWhere({ gender, category, platform, badge, q }) {
  const where = { active: true };

  if (gender && gender !== 'todos') {
    where.gender = gender === 'unissex'
      ? { in: ['unissex'] }
      : { in: [gender, 'unissex'] };
  }

  if (category && category !== 'todos') {
    where.category = category;
  }

  if (platform) {
    where.platform = { equals: platform, mode: 'insensitive' };
  }

  if (badge) {
    where.badge = { equals: badge, mode: 'insensitive' };
  }

  if (q) {
    where.OR = [
      { name:  { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { tags:  { has: q.toLowerCase() } }
    ];
  }

  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'preco-asc':  return { price: 'asc' };
    case 'preco-desc': return { price: 'desc' };
    case 'novo':       return { createdAt: 'desc' };
    default:           return { id: 'asc' };
  }
}

/* ── GET /api/products ───────────────────────── */

async function list(req, res) {
  try {
    const { gender, category, platform, badge, q, sort, page = 1, limit = 100 } = req.query;

    const where   = buildWhere({ gender, category, platform, badge, q });
    const orderBy = buildOrderBy(sort);
    const skip    = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: Number(limit) }),
      prisma.product.count({ where })
    ]);

    return res.json({ products, total, page: Number(page) });
  } catch (err) {
    console.error('[products/list]', err);
    return res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
}

/* ── GET /api/products/search ────────────────── */

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ products: [] });

    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name:  { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { tags:  { has: q.toLowerCase() } }
        ]
      },
      take: 10,
      orderBy: { id: 'asc' }
    });

    return res.json({ products });
  } catch (err) {
    console.error('[products/search]', err);
    return res.status(500).json({ error: 'Erro na busca.' });
  }
}

/* ── GET /api/products/:id ───────────────────── */

async function getById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const product = await prisma.product.findUnique({ where: { id, active: true } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

    return res.json({ product });
  } catch (err) {
    console.error('[products/getById]', err);
    return res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
}

/* ── POST /api/products (admin) ──────────────── */

async function create(req, res) {
  try {
    const data = { ...req.body };
    if (data.price)    data.price    = parseFloat(data.price);
    if (data.oldPrice) data.oldPrice = parseFloat(data.oldPrice);

    const product = await prisma.product.create({ data });
    return res.status(201).json({ message: 'Produto criado!', product });
  } catch (err) {
    console.error('[products/create]', err);
    return res.status(500).json({ error: 'Erro ao criar produto.' });
  }
}

/* ── PUT /api/products/:id (admin) ───────────── */

async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const data = { ...req.body };
    if (data.price)    data.price    = parseFloat(data.price);
    if (data.oldPrice) data.oldPrice = parseFloat(data.oldPrice);

    const product = await prisma.product.update({ where: { id }, data });
    return res.json({ message: 'Produto atualizado!', product });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado.' });
    console.error('[products/update]', err);
    return res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
}

/* ── DELETE /api/products/:id (admin) ────────── */

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    await prisma.product.update({ where: { id }, data: { active: false } });
    return res.json({ message: 'Produto removido.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado.' });
    console.error('[products/remove]', err);
    return res.status(500).json({ error: 'Erro ao remover produto.' });
  }
}

module.exports = { list, search, getById, create, update, remove };
