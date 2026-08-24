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
  await prisma.tradeOffer.deleteMany();
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
  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@butiky.bj';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'AdminButiky2026!';
  const adminPasswordHash = await bcrypt.hash(defaultPassword, 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: defaultEmail,
      passwordHash: adminPasswordHash,
      role: 'SUPERADMIN',
      firstName: 'Directeur',
      lastName: process.env.NEXT_PUBLIC_STORE_NAME || 'Boutique',
      phone: '+229 97 00 00 00',
      emailVerified: true,
    },
  });

  // 3. Création des catégories officielles de la boutique
  const categories = [
    { slug: 'smartphones-apple', name: 'Smartphones Apple iPhone' },
    { slug: 'smartphones-samsung', name: 'Smartphones Samsung Galaxy' },
    { slug: 'accessoires-originaux', name: 'Accessoires & Chargeurs Originaux' },
    { slug: 'audio-ecouteurs', name: 'Audio & Écouteurs Sans-Fil' },
    { slug: 'coques-protections', name: 'Coques & Verres Trempés' },
    { slug: 'powerbanks-energie', name: 'Powerbanks & Énergie' },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  // 4. Codes promos de base
  await prisma.promoCode.createMany({
    data: [
      { code: 'COTONOU229', discountType: 'FIXED_AMOUNT', discountValue: 10000, minOrderAmount: 100000, isActive: true },
      { code: 'BIENVENUE5', discountType: 'PERCENTAGE', discountValue: 5, minOrderAmount: 50000, isActive: true },
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
