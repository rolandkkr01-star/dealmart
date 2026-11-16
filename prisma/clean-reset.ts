import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanReset() {
  console.log('🧹 Purge totale des données enregistrées localement et en base de données...');

  // 1. Suppression de toutes les données factices
  await prisma.auditLog.deleteMany();
  await prisma.orderStatusEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.session.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Recréation unique du compte SuperAdmin officiel
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@dealmart.sb';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'DealMart2026!Securise';
  const adminPasswordHash = await bcrypt.hash(defaultPassword, 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: defaultEmail,
      passwordHash: adminPasswordHash,
      role: 'SUPERADMIN',
      firstName: 'Manager',
      lastName: process.env.NEXT_PUBLIC_STORE_NAME || 'DealMart',
      phone: '+677 7465588',
      emailVerified: true,
    },
  });

  // 3. Création des catégories officielles de la boutique DealMart (Solomon Islands)
  const categories = [
    { slug: 'electronics-gadgets', name: 'Électronique & High-Tech' },
    { slug: 'beauty-cosmetics-skincare', name: 'Beauté, Cosmétiques & Soins' },
    { slug: 'fashion-accessories', name: 'Mode & Habillement' },
    { slug: 'home-kitchen-living', name: 'Maison, Déco & Cuisine' },
    { slug: 'audio-accessories', name: 'Audio & Casques Multimédia' },
    { slug: 'health-wellness', name: 'Santé & Bien-être' },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  // 4. Codes promos de base
  await prisma.promoCode.createMany({
    data: [
      { code: 'HONIARA2026', discountType: 'FIXED_AMOUNT', discountValue: 50, minOrderAmount: 300, isActive: true },
      { code: 'DEALMART5', discountType: 'PERCENTAGE', discountValue: 5, minOrderAmount: 150, isActive: true },
    ],
  });

  console.log('✅ Base de données remise à zéro proprement !');
  console.log(`👤 SuperAdmin prêt : ${superAdmin.email} / ${defaultPassword}`);
  console.log(`📁 Catégories créées : ${categories.length}`);
}

cleanReset()
  .catch((e) => {
    console.error('❌ Erreur clean reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
