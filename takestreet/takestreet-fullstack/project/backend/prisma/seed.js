// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const products = [
  {
    name: 'Camiseta Oversized Drop Shoulder',
    brand: 'BALENCIAGA',
    price: 189.90,
    oldPrice: 320.00,
    gender: 'masculino',
    category: 'camisetas',
    platform: 'Shopee',
    badge: 'hot',
    icon: 'shirt',
    tags: ['oversized', 'drop shoulder', 'streetwear', 'trap'],
    desc: 'Camiseta oversized com corte drop shoulder. Tecido pesado 300g. Perfeita para layering.',
    link: 'https://shopee.com.br',
    img: ''
  },
  {
    name: 'Moletom Cropped Puff Print',
    brand: 'PUMA',
    price: 229.90,
    gender: 'feminino',
    category: 'moletons',
    platform: 'Nike',
    badge: 'novo',
    icon: 'default',
    tags: ['cropped', 'puff', 'moletom', 'feminino'],
    desc: 'Moletom cropped com estampa em relevo puff. Algodão fleece.',
    link: 'https://puma.com',
    img: ''
  },
  {
    name: 'Tênis Chunky Platform Sole',
    brand: 'NEW BALANCE',
    price: 459.00,
    oldPrice: 599.00,
    gender: 'unissex',
    category: 'tenis',
    platform: 'Nike',
    badge: 'hot',
    icon: 'shoe',
    tags: ['chunky', 'platform', 'sneaker', 'unissex'],
    desc: 'Tênis com solado chunky plataforma. Cabedal em couro sintético premium.',
    link: 'https://newbalance.com.br',
    img: ''
  },
  {
    name: 'Calça Cargo Relaxed Fit',
    brand: 'CARHARTT WIP',
    price: 319.90,
    gender: 'masculino',
    category: 'calcas',
    platform: 'Shopee',
    icon: 'default',
    tags: ['cargo', 'relaxed', 'calça', 'streetwear'],
    desc: 'Calça cargo com múltiplos bolsos utilitários. Corte relaxed. Tecido ripstop.',
    link: 'https://shopee.com.br',
    img: ''
  },
  {
    name: 'Bucket Hat Aba Larga Logo',
    brand: 'SUPREME',
    price: 149.90,
    oldPrice: 199.90,
    gender: 'unissex',
    category: 'acessorios',
    platform: 'Shopee',
    badge: 'mais vendido',
    icon: 'hat',
    tags: ['bucket hat', 'logo', 'acessório', 'unissex'],
    desc: 'Bucket hat com aba larga e bordado de logo. 100% algodão. Reversível.',
    link: 'https://shopee.com.br',
    img: ''
  },
  {
    name: 'Jaqueta Coach Jacket Nylon',
    brand: 'ADIDAS',
    price: 389.00,
    oldPrice: 520.00,
    gender: 'masculino',
    category: 'jaquetas',
    platform: 'Adidas',
    badge: 'hot',
    icon: 'default',
    tags: ['coach jacket', 'nylon', 'jaqueta', 'sport'],
    desc: 'Jaqueta coach jacket em nylon ripstop. Corte regular.',
    link: 'https://adidas.com.br',
    img: ''
  },
  {
    name: 'Cropped Tie Dye Vintage',
    brand: 'VINTAGE HAVANA',
    price: 119.90,
    gender: 'feminino',
    category: 'camisetas',
    platform: 'Shopee',
    badge: 'novo',
    icon: 'shirt',
    tags: ['cropped', 'tie dye', 'vintage', 'feminino'],
    desc: 'Cropped tie dye com tingimento artesanal. Algodão 100%.',
    link: 'https://shopee.com.br',
    img: ''
  },
  {
    name: 'Tênis Air Max Collab',
    brand: 'NIKE',
    price: 699.90,
    oldPrice: 899.00,
    gender: 'unissex',
    category: 'tenis',
    platform: 'Nike',
    badge: 'hot',
    icon: 'shoe',
    tags: ['air max', 'collab', 'nike', 'sneaker'],
    desc: 'Air Max edição limitada em collab exclusiva. Unidade de amortecimento Air visível.',
    link: 'https://nike.com.br',
    img: ''
  }
];

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin user
  const adminHash = await bcrypt.hash('ts@admin2025', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@takestreet.com',
      password: adminHash,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin criado: admin / ts@admin2025');

  // Products
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log(`✅ ${products.length} produtos inseridos`);

  console.log('🎉 Seed concluído!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
