import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du peuplement (seed) de la base de données TechPhone229...');

  // Nettoyage préalable
  await prisma.review.deleteMany();
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

  // 1. Initialisation : Aucun compte admin par défaut n'est recréé
  // Le système permettra à l'administrateur de configurer son compte propre sur /admin
  console.log('✅ Base nettoyée : Aucun compte par défaut, configuration Master Admin disponible.');

  // 2. Création des Catégories
  const catApple = await prisma.category.create({
    data: {
      slug: 'smartphones-apple',
      name: 'Smartphones Apple iPhone',
    },
  });

  const catSamsung = await prisma.category.create({
    data: {
      slug: 'smartphones-samsung',
      name: 'Smartphones Samsung Galaxy',
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      slug: 'accessoires-originaux',
      name: 'Accessoires & Chargeurs Originaux',
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      slug: 'audio-ecouteurs',
      name: 'Audio & Écouteurs Sans-Fil',
    },
  });

  // 3. Création des Produits Réels
  // Produit 1: iPhone 15 Pro Max
  const p1 = await prisma.product.create({
    data: {
      slug: 'iphone-15-pro-max-256go-titane-naturel',
      name: 'iPhone 15 Pro Max 256Go Titane Naturel',
      description: 'Le flagship ultime d\'Apple avec puce A17 Pro gravée en 3nm, design en titane aérospatial, bouton Action personnalisable et téléobjectif 5x. Écran Super Retina XDR 6,7" avec ProMotion 120Hz Always-On. Boîte scellée d\'origine constructeur.',
      brand: 'IPHONE',
      categoryId: catApple.id,
      condition: 'NEUF_SCELLE',
      tradeEligible: true,
      basePrice: 999000,
      promoPrice: 850000,
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 42,
      warrantyMonths: 12,
      specsJson: JSON.stringify({
        'Écran': 'Super Retina XDR OLED 6,7" 120Hz Always-On',
        'Puce': 'Apple A17 Pro (6 cœurs CPU, 6 cœurs GPU)',
        'Appareil Photo': 'Principal 48 Mpx + Ultra Grand-angle 12 Mpx + Téléobjectif 5x 12 Mpx',
        'Batterie': 'Jusqu\'à 29h en lecture vidéo (USB-C 3.0)',
        'Connectivité': '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C 10 Gb/s',
      }),
      images: {
        create: [
          {
            url: '/images/products/daniel-romero-bR_r3fJu-vk-unsplash.jpg',
            altText: 'iPhone 15 Pro Max 256 Go en titane naturel, vue de face et de profil',
            position: 0,
          },
          {
            url: '/images/products/amanz-fYru5LNyJiM-unsplash.jpg',
            altText: 'iPhone 15 Pro Max finition titane naturel avec triple capteur photo',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          { storage: '256 Go', color: 'Titane Naturel', colorCode: '#9C968E', priceOverride: 850000, promoPrice: 850000, stock: 8, sku: 'IP15PM-256-TN' },
          { storage: '512 Go', color: 'Titane Naturel', colorCode: '#9C968E', priceOverride: 975000, promoPrice: 975000, stock: 4, sku: 'IP15PM-512-TN' },
          { storage: '256 Go', color: 'Titane Noir', colorCode: '#3C3B37', priceOverride: 850000, promoPrice: 850000, stock: 6, sku: 'IP15PM-256-TB' },
        ],
      },
    },
  });

  // Produit 2: Samsung Galaxy S24 Ultra
  const p2 = await prisma.product.create({
    data: {
      slug: 'samsung-galaxy-s24-ultra-512go-gris-titane',
      name: 'Samsung Galaxy S24 Ultra 512Go Gris Titane',
      description: 'L\'expérience smartphone ultime sous Galaxy AI. Puce Snapdragon 8 Gen 3 for Galaxy, capteur révolutionnaire 200 Mpx avec Space Zoom 100x, stylet S-Pen intégré et écran Dynamic AMOLED 2X 6,8" anti-reflets.',
      brand: 'SAMSUNG',
      categoryId: catSamsung.id,
      condition: 'NEUF_SCELLE',
      tradeEligible: true,
      basePrice: 890000,
      promoPrice: 750000,
      isActive: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 35,
      warrantyMonths: 24,
      specsJson: JSON.stringify({
        'Écran': 'Dynamic AMOLED 2X 6,8" QHD+ 120Hz adaptatif',
        'Processeur': 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
        'Mémoire': '12 Go RAM + 512 Go Stockage',
        'Appareil Photo': '200 Mpx + 50 Mpx (5x) + 12 Mpx Ultra-wide + 10 Mpx (3x)',
        'Batterie': '5000 mAh avec charge 45W et sans fil',
      }),
      images: {
        create: [
          {
            url: '/images/products/zana-latif-5uJMG9fUAO0-unsplash.jpg',
            altText: 'Samsung Galaxy S24 Ultra Gris Titane avec S-Pen',
            position: 0,
          },
          {
            url: '/images/products/thai-nguyen-Fl0Jfh9oinQ-unsplash.jpg',
            altText: 'Samsung Galaxy S24 Ultra vue écran et bordures titane',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          { storage: '256 Go', color: 'Gris Titane', colorCode: '#777777', priceOverride: 710000, stock: 5, sku: 'S24U-256-GT' },
          { storage: '512 Go', color: 'Gris Titane', colorCode: '#777777', priceOverride: 750000, promoPrice: 750000, stock: 9, sku: 'S24U-512-GT' },
          { storage: '512 Go', color: 'Noir Titane', colorCode: '#222222', priceOverride: 750000, promoPrice: 750000, stock: 4, sku: 'S24U-512-NT' },
        ],
      },
    },
  });

  // Produit 3: iPhone 14 Pro Reconditionné Certifié
  const p3 = await prisma.product.create({
    data: {
      slug: 'iphone-14-pro-128go-reconditionne-certifie-violet',
      name: 'iPhone 14 Pro 128Go Deep Purple — Reconditionné Certifié A+',
      description: 'Appareil remis à neuf dans nos ateliers à Cotonou. Batterie d\'origine Apple à 100% de santé certifiée, écran Dynamic Island impeccable, testé sur 45 points de contrôle. Fourni avec câble et garantie 6 mois.',
      brand: 'IPHONE',
      categoryId: catApple.id,
      condition: 'NEUF_NON_SCELLE',
      tradeEligible: true,
      basePrice: 590000,
      promoPrice: 520000,
      isActive: true,
      isFeatured: false,
      rating: 4.7,
      reviewsCount: 28,
      warrantyMonths: 6,
      specsJson: JSON.stringify({
        'État': 'Reconditionné Grade A+ (Comme neuf)',
        'Batterie': 'Santé 100% garantie constructeur',
        'Écran': 'Super Retina XDR 6,1 pouces OLED 120Hz',
        'Puce': 'A16 Bionic avec GPU 5 cœurs',
      }),
      images: {
        create: [
          {
            url: '/images/products/anh-nhat-PdALQmfEqvE-unsplash.jpg',
            altText: 'iPhone 14 Pro reconditionné A+ couleur Deep Purple',
            position: 0,
          },
          {
            url: '/images/products/anh-nhat-uCqMa_s-JDg-unsplash.jpg',
            altText: 'iPhone 14 Pro vue arrière et capteurs photo',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          { storage: '128 Go', color: 'Deep Purple', colorCode: '#4A3B52', priceOverride: 520000, promoPrice: 520000, stock: 12, sku: 'IP14P-128-PUR-REC' },
        ],
      },
    },
  });

  // Produit 4: Samsung Galaxy Z Fold 5
  const p4 = await prisma.product.create({
    data: {
      slug: 'samsung-galaxy-z-fold-5-512go-noir-phantom',
      name: 'Samsung Galaxy Z Fold 5 512Go Noir Phantom',
      description: 'Le smartphone pliant de référence. Écran immersif 7,6" pliable, charnière Flex sans espace, multitâche puissant à 3 applications simultanées et processeur Snapdragon 8 Gen 2.',
      brand: 'SAMSUNG',
      categoryId: catSamsung.id,
      condition: 'NEUF_SCELLE',
      tradeEligible: true,
      basePrice: 950000,
      promoPrice: 820000,
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 19,
      warrantyMonths: 12,
      specsJson: JSON.stringify({
        'Écran Principal': '7.6" Dynamic AMOLED 2X 120Hz pliable',
        'Écran Externe': '6.2" Dynamic AMOLED 2X',
        'Puce': 'Snapdragon 8 Gen 2 for Galaxy',
      }),
      images: {
        create: [
          {
            url: '/images/products/shiwa-id-Uae7ouMw91A-unsplash.jpg',
            altText: 'Samsung Galaxy Z Fold 5 ouvert et fermé',
            position: 0,
          },
          {
            url: '/images/products/filip-baotic-DV0mB2uJM34-unsplash.jpg',
            altText: 'Samsung Galaxy Z Fold 5 vue latérale charnière',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          { storage: '512 Go', color: 'Noir Phantom', colorCode: '#111111', priceOverride: 820000, promoPrice: 820000, stock: 5, sku: 'ZFOLD5-512-BLK' },
        ],
      },
    },
  });

  // Produit 5: Chargeur Apple 20W Authentique
  const p5 = await prisma.product.create({
    data: {
      slug: 'adaptateur-secteur-apple-usb-c-20w-authentique',
      name: 'Adaptateur Secteur Apple USB-C 20W Authentique',
      description: 'Chargeur officiel Apple 20W Power Delivery. Assure une charge rapide et préserve la longévité de votre batterie iPhone. 100% garanti authentique Apple.',
      brand: 'ACCESSOIRE',
      categoryId: catAccessories.id,
      condition: 'NEUF_SCELLE',
      tradeEligible: false,
      basePrice: 22000,
      promoPrice: 18500,
      isActive: true,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 88,
      warrantyMonths: 12,
      specsJson: JSON.stringify({
        'Puissance': '20W USB Power Delivery',
        'Connectique': 'USB-C',
        'Norme': 'Certifié Apple Original avec numéro de série',
      }),
      images: {
        create: [
          {
            url: '/images/products/ubeyonroad-oLZ2htMNhbA-unsplash.jpg',
            altText: 'Chargeur officiel Apple USB-C 20W boîte scellée',
            position: 0,
          },
          {
            url: '/images/products/ubeyonroad-szNWSe97Mq0-unsplash.jpg',
            altText: 'Câble et adaptateur USB-C d\'origine',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          { color: 'Blanc', priceOverride: 18500, promoPrice: 18500, stock: 50, sku: 'APL-20W-ORIG' },
        ],
      },
    },
  });

  // 4. Création des Codes Promo
  await prisma.promoCode.createMany({
    data: [
      { code: 'COTONOU229', discountType: 'FIXED_AMOUNT', discountValue: 10000, minOrderAmount: 100000, isActive: true },
      { code: 'BIENVENUE5', discountType: 'PERCENTAGE', discountValue: 5, minOrderAmount: 50000, isActive: true },
      { code: 'VIPTECH', discountType: 'FIXED_AMOUNT', discountValue: 25000, minOrderAmount: 300000, isActive: true },
    ],
  });

  // 5. Création d'une proposition de troc d'exemple
  await prisma.tradeOffer.create({
    data: {
      userId: null,
      customerName: 'Ablam Dossou',
      customerPhone: '+229 97 12 34 56',
      customerEmail: 'client@techphone229.bj',
      customerCity: 'Cotonou (Cadjehoun)',
      productId: p1.id,
      offeredDeviceModel: 'iPhone 13 Pro Max 128Go Graphite',
      offeredDeviceDescription: 'Très bon état, batterie à 87%, écran d\'origine sans rayure, boîte d\'origine fournie.',
      offeredDeviceCondition: 'OCCASION',
      offeredDevicePhotosJson: JSON.stringify(['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80']),
      cashComplement: 380000,
      status: 'PENDING',
    },
  });

  // 6. Création d'une commande initiale
  const initialOrder = await prisma.order.create({
    data: {
      orderNumber: 'TP229-928412',
      userId: null,
      customerName: 'Ablam Dossou',
      customerEmail: 'client@techphone229.bj',
      customerPhone: '+229 97 12 34 56',
      city: 'Cotonou',
      district: 'Cadjehoun',
      streetDetails: 'Rue 124, Villa 4B',
      notes: 'Appeler à l\'arrivée',
      status: 'PAID',
      totalAmount: 868500,
      shippingFee: 0,
      discountAmount: 0,
      paymentProvider: 'mtn_momo',
      paymentRef: 'MTN-BJ-TX-84920491',
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            variantInfo: '256 Go - Titane Naturel',
            quantity: 1,
            unitPrice: 850000,
          },
          {
            productId: p4.id,
            productName: p4.name,
            variantInfo: 'Blanc',
            quantity: 1,
            unitPrice: 18500,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Commande initiée sur le site', createdAt: new Date(Date.now() - 3600000) },
          { status: 'PAID', note: 'Paiement MTN MoMo validé (868 500 FCFA)', createdAt: new Date() },
        ],
      },
    },
  });

  // 7. Création de 3 Avis Clients vérifiés et mis en avant sur l'accueil (Choisis par l'Admin)
  await prisma.review.createMany({
    data: [
      {
        productId: p1.id,
        authorName: 'Dr. Aurel Houessou',
        city: 'Cotonou, Haie Vive',
        rating: 5,
        comment: 'J\'ai acheté mon iPhone 15 Pro Max 256Go. Boîte scellée d\'origine vérifiée sur le site d\'Apple. Livraison reçue en moins de 2h à mon cabinet. Service impeccable !',
        isApproved: true,
        isFeaturedHome: true,
      },
      {
        productId: p2.id,
        authorName: 'Sandrine Agbodjan',
        city: 'Abomey-Calavi',
        rating: 5,
        comment: 'Le service de troc est une merveille. J\'ai fait reprendre mon ancien S21 Ultra pour prendre le S24 Ultra avec un petit complément en MoMo. Transaction très transparente.',
        isApproved: true,
        isFeaturedHome: true,
      },
      {
        productId: p5.id,
        authorName: 'Marius Koudjo',
        city: 'Cotonou, Cadjehoun',
        rating: 5,
        comment: 'Difficile de trouver des chargeurs 20W Apple réellement authentiques à Cotonou avec toutes les contrefaçons. TechPhone229 est le seul en qui j\'ai totale confiance.',
        isApproved: true,
        isFeaturedHome: true,
      },
    ],
  });

  console.log(`✅ Base de données initialisée avec succès (0 admin par défaut, configuration disponible sur /admin) !`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
