import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du peuplement (seed) de DealMart (Îles Salomon)...');

  // Nettoyage préalable
  await prisma.review.deleteMany();
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

  console.log('✅ Base nettoyée : Aucun compte par défaut, configuration Master Admin disponible.');

  // 1. Création des Catégories Généralistes (Alibaba des Îles Salomon)
  const catElectronics = await prisma.category.create({
    data: {
      slug: 'electronics-gadgets',
      name: 'Électronique & High-Tech',
    },
  });

  const catBeauty = await prisma.category.create({
    data: {
      slug: 'beauty-cosmetics-skincare',
      name: 'Beauté, Cosmétiques & Soins',
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      slug: 'fashion-accessories',
      name: 'Mode & Habillement',
    },
  });

  const catHome = await prisma.category.create({
    data: {
      slug: 'home-kitchen-living',
      name: 'Maison, Déco & Cuisine',
    },
  });

  // 2. Création des Produits Multi-Rayons (Prix en SI$)

  // PRODUIT 1 (ÉLECTRONIQUE) : Flagship Smartphone Pro
  const p1 = await prisma.product.create({
    data: {
      slug: 'flagship-smartphone-pro-256gb',
      name: 'Flagship Smartphone Pro 256Go Titane',
      description: 'Le smartphone haut de gamme avec processeur dernière génération, écran AMOLED 120Hz 6,7", triple capteur photo professionnel 50 Mpx avec zoom optique 5x. Boîte d\'origine neuve sous scellé avec chargeur rapide inclus.',
      brand: 'DEALMART TECH',
      categoryId: catElectronics.id,
      condition: 'NEUF_SCELLE',
      basePrice: 12500, // SI$
      promoPrice: 10990, // SI$
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 38,
      warrantyMonths: 12,
      specsJson: JSON.stringify({
        'Écran': 'AMOLED 6,7" 120Hz HDR10+ Always-On',
        'Puce': 'Octa-core 3.4GHz Haute Performance',
        'Appareil Photo': 'Triple 50 Mpx + 12 Mpx Ultra-wide + 12 Mpx Téléobjectif',
        'Batterie': '5000 mAh avec charge rapide 45W',
        'Réseau': '5G, 4G LTE, Wi-Fi 6, Dual SIM',
      }),
      images: {
        create: [
          {
            url: '/images/products/daniel-romero-bR_r3fJu-vk-unsplash.jpg',
            altText: 'Smartphone Flagship Pro en finition titane naturel',
            position: 0,
          },
          {
            url: '/images/products/amanz-fYru5LNyJiM-unsplash.jpg',
            altText: 'Smartphone Flagship Pro vue arrière avec capteurs photo',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          { storage: '256 Go', color: 'Titane Naturel', colorCode: '#9C968E', priceOverride: 10990, promoPrice: 10990, stock: 15, sku: 'DM-PH-PRO-256-TN' },
          { storage: '512 Go', color: 'Noir Sidéral', colorCode: '#1C1C1E', priceOverride: 12490, promoPrice: 11990, stock: 8, sku: 'DM-PH-PRO-512-NS' },
        ],
      },
    },
  });

  // PRODUIT 2 (AUDIO) : Écouteurs Sans-Fil Pro avec Réduction de Bruit
  const p2 = await prisma.product.create({
    data: {
      slug: 'ecouteurs-sans-fil-pro-anc',
      name: 'Écouteurs Sans-Fil Pro avec Réduction de Bruit Active (ANC)',
      description: 'Audio spatial immersif haute-fidélité avec réduction active du bruit ambiant. Autonomie jusqu\'à 30 heures avec le boîtier de charge sans fil. Résistants à la transpiration et à l\'eau IPX4.',
      brand: 'DEALMART SOUND',
      categoryId: catElectronics.id,
      condition: 'NEUF_SCELLE',
      basePrice: 1850,
      promoPrice: 1490,
      isActive: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 52,
      warrantyMonths: 12,
      specsJson: JSON.stringify({
        'Autonomie': 'Jusqu\'à 6h par charge (30h avec boîtier)',
        'Technologies': 'ANC hybride + Mode Transparence + Bluetooth 5.3',
        'Résistance': 'Norme étanche IPX4',
      }),
      images: {
        create: [
          {
            url: '/images/products/amanz-MYFySiWABQE-unsplash.jpg',
            altText: 'Écouteurs Pro Sans-fil dans leur étui de charge',
            position: 0,
          },
        ],
      },
      variants: {
        create: [
          { color: 'Blanc Pur', colorCode: '#FFFFFF', priceOverride: 1490, stock: 25, sku: 'DM-AUDIO-ANC-W' },
          { color: 'Noir Mat', colorCode: '#111827', priceOverride: 1490, stock: 20, sku: 'DM-AUDIO-ANC-B' },
        ],
      },
    },
  });

  // PRODUIT 3 (BEAUTÉ & SOINS) : Sérum Hydratant Visage Acide Hyaluronique & Vitamine C
  const p3 = await prisma.product.create({
    data: {
      slug: 'serum-visage-eclat-acide-hyaluronique',
      name: 'Sérum Visage Éclat & Jeunesse (Acide Hyaluronique + Vitamine C)',
      description: 'Formule dermatologique concentrée enrichie en acide hyaluronique pur et antioxydants naturels. Hydrate intensément, illumine le teint et protège la peau contre la pollution et les rayons UV. Convient à tous types de peaux.',
      brand: 'SOLOMON GLOW',
      categoryId: catBeauty.id,
      condition: 'NEUF_SCELLE',
      basePrice: 420,
      promoPrice: 350,
      isActive: true,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 64,
      warrantyMonths: 0,
      specsJson: JSON.stringify({
        'Contenance': '50 ml / 1.7 fl.oz',
        'Ingrédients clés': 'Acide Hyaluronique, Vitamine C stabilisée, Niacinamide',
        'Type de peau': 'Tous types de peau, testé sous contrôle dermatologique',
        'Origine': 'Formulation premium certifiée sans parabènes',
      }),
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
            altText: 'Flacon de sérum visage éclat et soin hydratant',
            position: 0,
          },
        ],
      },
      variants: {
        create: [
          { storage: '50 ml', color: 'Transparent', priceOverride: 350, stock: 40, sku: 'DM-BEAUTY-SERUM-50' },
          { storage: '100 ml Format Éco', color: 'Transparent', priceOverride: 590, promoPrice: 520, stock: 25, sku: 'DM-BEAUTY-SERUM-100' },
        ],
      },
    },
  });

  // PRODUIT 4 (BEAUTÉ & SOINS) : Crème Régénératrice Huile de Coco & Karité Bio
  const p4 = await prisma.product.create({
    data: {
      slug: 'creme-nourrissante-corps-coco-karite',
      name: 'Crème Corps & Soin Nourrissant Huile de Coco Tropicale & Karité Bio',
      description: 'Soin corporel riche et soyeux élaboré avec de l\'huile de coco pure des Îles du Pacifique et du beurre de karité bio. Nourrit en profondeur, apaise après le soleil et parfume délicatement la peau toute la journée.',
      brand: 'PACIFIC BOTANICS',
      categoryId: catBeauty.id,
      condition: 'NEUF_SCELLE',
      basePrice: 280,
      promoPrice: 220,
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 47,
      warrantyMonths: 0,
      specsJson: JSON.stringify({
        'Volume': '250 ml',
        'Parfum': 'Noix de Coco douce & Vanille des îles',
        'Bénéfices': 'Nutrition 48h, non gras, absorption rapide',
      }),
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1608248597359-0a56e72b4c73?auto=format&fit=crop&w=800&q=80',
            altText: 'Pot de crème nourrissante corps au beurre de karité et coco',
            position: 0,
          },
        ],
      },
      variants: {
        create: [
          { storage: 'Pot 250 ml', color: 'Blanc Crème', priceOverride: 220, stock: 50, sku: 'DM-BEAUTY-CREAM-250' },
        ],
      },
    },
  });

  // PRODUIT 5 (MODE) : Montre Homme Chronographe Élégante Étanche
  const p5 = await prisma.product.create({
    data: {
      slug: 'montre-chronographe-acier-inoxydable',
      name: 'Montre Chronographe Acier Inoxydable & Verre Saphir',
      description: 'Design contemporain et finitions luxueuses en acier brossé. Cadran chronographe avec aiguilles luminescentes et affichage de la date. Étanche 5 ATM (50 mètres), idéale pour toutes les occasions habillées ou sportives.',
      brand: 'DEALMART LUXE',
      categoryId: catFashion.id,
      condition: 'NEUF_SCELLE',
      basePrice: 950,
      promoPrice: 790,
      isActive: true,
      isFeatured: true,
      rating: 4.7,
      reviewsCount: 31,
      warrantyMonths: 24,
      specsJson: JSON.stringify({
        'Mouvement': 'Quartz haute précision japonais',
        'Boîtier': 'Acier inoxydable 316L diamètre 42mm',
        'Étanchéité': '5 ATM / 50 mètres',
        'Verre': 'Cristal Saphir inrayable',
      }),
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
            altText: 'Montre chronographe élégante sur fond sombre',
            position: 0,
          },
        ],
      },
      variants: {
        create: [
          { color: 'Argent & Cadran Bleu', colorCode: '#0054A4', priceOverride: 790, stock: 12, sku: 'DM-WATCH-SILVER-BL' },
          { color: 'Or & Cadran Noir', colorCode: '#F1B20B', priceOverride: 890, promoPrice: 850, stock: 10, sku: 'DM-WATCH-GOLD-BK' },
        ],
      },
    },
  });

  // PRODUIT 6 (MAISON & CUISINE) : Diffuseur d'Arômes Ultrasonique & Lumière d'Ambiance
  const p6 = await prisma.product.create({
    data: {
      slug: 'diffuseur-aromes-ultrasonique-bois-led',
      name: 'Diffuseur d\'Huiles Essentielles Ultrasonique Effet Bois & LED 7 Couleurs',
      description: 'Humidificateur d\'air et diffuseur d\'arômes ultrasonique silencieux avec télécommande. Réservoir 500 ml avec arrêt automatique de sécurité. Idéal pour créer une atmosphère apaisante à la maison ou au bureau.',
      brand: 'DEALMART HOME',
      categoryId: catHome.id,
      condition: 'NEUF_SCELLE',
      basePrice: 480,
      promoPrice: 390,
      isActive: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 29,
      warrantyMonths: 12,
      specsJson: JSON.stringify({
        'Capacité': '500 ml (jusqu\'à 12h d\'autonomie continue)',
        'Technologie': 'Ultrasonique silencieuse (< 25 dB)',
        'Éclairage': 'LED d\'ambiance 7 couleurs changeantes',
        'Minuteur': '1h / 3h / 6h / continu avec arrêt automatique',
      }),
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
            altText: 'Diffuseur d\'huiles essentielles et humidificateur en bois',
            position: 0,
          },
        ],
      },
      variants: {
        create: [
          { color: 'Bois Clair Naturel', colorCode: '#D2B48C', priceOverride: 390, stock: 20, sku: 'DM-HOME-DIFF-LIGHT' },
          { color: 'Bois Sombre Noyer', colorCode: '#5C4033', priceOverride: 390, stock: 15, sku: 'DM-HOME-DIFF-DARK' },
        ],
      },
    },
  });

  // 3. Avis Clients Localisés aux Îles Salomon
  await prisma.review.createMany({
    data: [
      {
        productId: p1.id,
        authorName: 'Johnathan Tome',
        city: 'Honiara, Point Cruz',
        rating: 5,
        comment: 'Fast same-day delivery right to my office in Point Cruz. Phone came brand new and sealed. DealMart is officially my go-to shop in Solomon Islands!',
        isApproved: true,
        isFeaturedHome: true,
      },
      {
        productId: p3.id,
        authorName: 'Mary Rence',
        city: 'Honiara, Kukum',
        rating: 5,
        comment: 'Love the Solomon Glow serum! Excellent skincare quality, authentic product and very easy Cash on Delivery payment. Highly recommended!',
        isApproved: true,
        isFeaturedHome: true,
      },
      {
        productId: p2.id,
        authorName: 'David Keli',
        city: 'Gizo, Western Province',
        rating: 5,
        comment: 'Great noise cancelling earbuds. Shipped to Gizo within 48 hours in perfect condition. Friendly customer support via WhatsApp!',
        isApproved: true,
        isFeaturedHome: true,
      },
    ],
  });

  // 4. Codes Promos de Base
  await prisma.promoCode.createMany({
    data: [
      { code: 'HONIARA2026', discountType: 'FIXED_AMOUNT', discountValue: 50, minOrderAmount: 300, isActive: true },
      { code: 'DEALMART5', discountType: 'PERCENTAGE', discountValue: 5, minOrderAmount: 150, isActive: true },
    ],
  });

  console.log('✅ Peuplement DealMart terminé avec succès !');
  console.log(`📁 4 Catégories créées, 6 Produits phares multi-rayons injectés en SI$ et 3 Avis vérifiés.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
