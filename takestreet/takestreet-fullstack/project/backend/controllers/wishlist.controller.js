// controllers/wishlist.controller.js
const prisma = require('../config/prisma');

/* ── GET /api/wishlist ───────────────────────── */

async function list(req, res) {
  try {
    const userId = req.user.id;

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true, name: true, brand: true, price: true,
            oldPrice: true, img: true, icon: true, badge: true,
            gender: true, category: true, platform: true, tags: true,
            desc: true, link: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const products = items.map(i => i.product);
    return res.json({ products });
  } catch (err) {
    console.error('[wishlist/list]', err);
    return res.status(500).json({ error: 'Erro ao buscar favoritos.' });
  }
}

/* ── GET /api/wishlist/ids ───────────────────── */

async function listIds(req, res) {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      select: { productId: true }
    });
    return res.json({ ids: items.map(i => i.productId) });
  } catch (err) {
    console.error('[wishlist/listIds]', err);
    return res.status(500).json({ error: 'Erro ao buscar IDs dos favoritos.' });
  }
}

/* ── POST /api/wishlist ──────────────────────── */

async function add(req, res) {
  try {
    const userId    = req.user.id;
    const productId = parseInt(req.body.productId);

    // Verifica se produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId, active: true }
    });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

    // upsert evita erro de duplicata
    await prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId }
    });

    return res.status(201).json({ message: 'Adicionado aos favoritos!' });
  } catch (err) {
    console.error('[wishlist/add]', err);
    return res.status(500).json({ error: 'Erro ao adicionar favorito.' });
  }
}

/* ── DELETE /api/wishlist/:productId ─────────── */

async function remove(req, res) {
  try {
    const userId    = req.user.id;
    const productId = parseInt(req.params.productId);

    await prisma.wishlist.deleteMany({ where: { userId, productId } });

    return res.json({ message: 'Removido dos favoritos.' });
  } catch (err) {
    console.error('[wishlist/remove]', err);
    return res.status(500).json({ error: 'Erro ao remover favorito.' });
  }
}

module.exports = { list, listIds, add, remove };
