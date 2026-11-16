import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed complet DealMart (Îles Salomon)...');

  // Nettoyage préalable complet
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

  console.log('✅ Base nettoyée.');

  // 1. Catégories officielles DealMart
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
      name: 'Mode, Chaussures & Montres',
    },
  });

  const catHome = await prisma.category.create({
    data: {
      slug: 'home-kitchen-living',
      name: 'Maison, Auto & Bien-être',
    },
  });

  console.log('✅ 4 Catégories créées.');

  // 2. Création des 22 Produits authentiques DealMart

  // --- ÉLECTRONIQUE ---

  // #1 Samsung Galaxy S23+
  const p1 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S23+ (256GB / 8GB RAM)',
      slug: 'samsung-galaxy-s23-plus-256gb',
      description: `🔥 EN STOCK CHEZ DEALMART HONIARA !

Le smartphone haut de gamme Samsung Galaxy S23+ allie puissance et élégance :
• Processeur ultra-rapide Snapdragon 8 Gen 2 pour Galaxy
• Écran immersif Dynamic AMOLED 2X 6.6 pouces à 120Hz
• Triple capteur photo 50 Mpx haute résolution avec mode nuit Nightography
• 256 Go de stockage interne et 8 Go de RAM
• Batterie longue durée 4 700 mAh avec charge ultra-rapide

Garantie constructeur officielle avec certificat d'authenticité DealMart.`,
      brand: 'Samsung',
      condition: 'NEUF_SCELLE',
      basePrice: 4500,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 14,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Écran': '6.6" Dynamic AMOLED 2X 120Hz',
        'Processeur': 'Snapdragon 8 Gen 2 Mobile Platform',
        'Stockage': '256 Go UFS 4.0',
        'Mémoire RAM': '8 Go LPDDR5X',
        'Batterie': '4 700 mAh charge rapide 45W',
        'Réseau': '5G / Double SIM (Nano + eSIM)',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_5.jpg', altText: 'Samsung Galaxy S23+ DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Phantom Black', colorCode: '#1C1C1E', storage: '256 Go', stock: 4, sku: 'DM-SAM-S23P-BLK-1001' },
          { color: 'Cream', colorCode: '#F5F5DC', storage: '256 Go', stock: 3, sku: 'DM-SAM-S23P-CRM-1002' },
        ],
      },
    },
  });

  // #2 Samsung Galaxy Z Fold 4
  const p2 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy Z Fold 4 (512GB / 12GB RAM)',
      slug: 'samsung-galaxy-z-fold-4-512gb',
      description: `Le summum de l'innovation pliable entre vos mains chez DealMart.
L'écran intérieur de 7,6 pouces se déplie pour une productivité sans compromis, compatible stylet S-Pen et multitâche jusqu'à 3 applications simultanées.

• Écran pliable 7.6" Dynamic AMOLED 2X 120Hz
• Écran externe 6.2" pratique à une main
• 512 Go de stockage ultra-confortable et 12 Go de RAM
• Charnière résistante en aluminium Armor et étanchéité IPX8.`,
      brand: 'Samsung',
      condition: 'NEUF_SCELLE',
      basePrice: 4900,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 8,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Écran principal': '7.6" Dynamic AMOLED 2X 120Hz Pliable',
        'Écran externe': '6.2" Dynamic AMOLED 2X 120Hz',
        'Stockage': '512 Go',
        'Mémoire RAM': '12 Go',
        'Appareil Photo': 'Triple capteur 50 + 12 + 10 MP avec zoom optique 3x',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_5.jpg', altText: 'Samsung Galaxy Z Fold 4 DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Graygreen', colorCode: '#4F5D59', storage: '512 Go', stock: 2, sku: 'DM-SAM-FLD4-GRY-1001' },
        ],
      },
    },
  });

  // #3 Xiaomi Redmi Note 15 Pro
  await prisma.product.create({
    data: {
      name: 'Xiaomi Redmi Note Pro (256GB / 8GB RAM)',
      slug: 'xiaomi-redmi-note-pro-256gb',
      description: `Le champion de la performance à prix accessible chez DealMart.
Capteur photo sensationnel de 200 MP, écran AMOLED ultra-lumineux et charge Turbo 67W.

• 256 Go de mémoire et 8 Go de RAM
• Écran AMOLED 120Hz FHD+ avec bordures ultra-fines
• Chargeur rapide 67W inclus dans la boîte.`,
      brand: 'Xiaomi',
      condition: 'NEUF_SCELLE',
      basePrice: 2900,
      warrantyMonths: 12,
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 19,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Écran': '6.67" AMOLED 120Hz',
        'Capteur photo': '200 Mpx avec stabilisation OIS',
        'Stockage': '256 Go',
        'Batterie': '5 000 mAh avec charge rapide 67W',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_5.jpg', altText: 'Xiaomi Redmi Note Pro DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Midnight Black', colorCode: '#111827', storage: '256 Go', stock: 6, sku: 'DM-XIA-RDMP-BLK-1001' },
        ],
      },
    },
  });

  // #4 Rasoir Électrique Kemei Rechargeable
  const p4 = await prisma.product.create({
    data: {
      name: 'Rasoir Électrique Rechargeable Kemei Gold & Black',
      slug: 'rasoir-electrique-kemei-rechargeable-gold',
      description: `🔥 VENTE FLASH SPÉCIALE CHEZ DEALMART HONIARA ! 🔥

Le rasoir professionnel sans fil Kemei pour un rasage doux, précis et sans irritation :
✅ Double grille de coupe ultra-fine amovible pour un nettoyage simple
✅ Écran LED haute définition indiquant le pourcentage de batterie restante et vitesse 7500 RPM
✅ Moteur puissant et batterie rechargeable longue autonomie
✅ Recharge pratique via câble USB universel (sur secteur, ordinateur ou batterie externe)
✅ Livré complet avec câble USB, brosse de nettoyage et pochette de voyage DealMart.`,
      brand: 'Kemei',
      condition: 'NEUF_SCELLE',
      basePrice: 350,
      promoPrice: 320,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 27,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Vitesse': '7 500 RPM haute performance',
        'Affichage': 'Écran LED numérique multifonction',
        'Batterie': 'Lithium-ion rechargeable autonomie 90 min',
        'Recharge': 'USB universel compatible chargeur smartphone',
        'Accessoires': 'Câble USB, brosse, étui de protection',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_1.jpg', altText: 'Rasoir Kemei Rechargeable DealMart', position: 0 },
          { url: '/images/products/dealmart/kemei_cutter_head.jpg', altText: 'Tête de coupe amovible Kemei', position: 1 },
          { url: '/images/products/dealmart/kemei_usb_charging.jpg', altText: 'Affichage LED et charge USB Kemei', position: 2 },
          { url: '/images/products/dealmart/kemei_usage_steps.jpg', altText: 'Guide utilisation rasage sans trace', position: 3 },
        ],
      },
      variants: {
        create: [
          { color: 'Or & Noir Métallisé', colorCode: '#F1B20B', stock: 15, sku: 'DM-KEM-SHAV-GLD-1001' },
        ],
      },
    },
  });

  // #5 Montre Connectée G7 Max
  await prisma.product.create({
    data: {
      name: 'Montre Connectée G7 Max Smart Watch (Appels & Sport)',
      slug: 'montre-connectee-g7-max-smart-watch',
      description: `🔥 NOUVEL ARRIVAGE CHEZ DEALMART HONIARA !

La montre connectée G7 Max offre toutes les fonctionnalités modernes au poignet :
• Compatible avec tous les smartphones Android et iPhone
• Prise d'appels téléphoniques en Bluetooth et notifications SMS / WhatsApp
• Suivi complet de santé : fréquence cardiaque, oxygène sanguin, sommeil
• Nombreux modes sportifs et podomètre
• Bracelet confortable et boîtier étanche IP67.`,
      brand: 'G7 Max',
      condition: 'NEUF_SCELLE',
      basePrice: 320,
      promoPrice: 290,
      warrantyMonths: 6,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 16,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Écran': 'Tactile HD couleur haute luminosité',
        'Connectivité': 'Bluetooth 5.2 compatible iOS & Android',
        'Fonctions': 'Appels Bluetooth, SMS, Cardio, Sommeil, Sport',
        'Autonomie': 'Jusqu\'à 5 jours en utilisation standard',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_16.jpg', altText: 'Montre connectée G7 Max DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Noir Sidéral', colorCode: '#111827', stock: 8, sku: 'DM-G7M-WATC-BLK-1001' },
          { color: 'Argent & Blanc', colorCode: '#E5E7EB', stock: 5, sku: 'DM-G7M-WATC-SLV-1002' },
        ],
      },
    },
  });

  // #6 Clavier Rétroéclairé RGB
  await prisma.product.create({
    data: {
      name: 'Clavier Gaming & Bureau Rétroéclairé RGB DealMart',
      slug: 'clavier-gaming-bureau-retro-eclaire-rgb',
      description: `⌨️ OFFRE SPÉCIALE ACCESSOIRE TECH DEALMART !

Illuminez votre bureau avec ce clavier rétroéclairé multicolore RGB :
• Frappe douce, silencieuse et ultra-réactive
• Rétroéclairage dynamique multizone avec luminosité réglable
• Résistant aux éclaboussures avec câble USB renforcé
• Compatible PC, Mac et consoles.`,
      brand: 'DealMart Tech',
      condition: 'NEUF_SCELLE',
      basePrice: 250,
      warrantyMonths: 12,
      isFeatured: false,
      rating: 4.7,
      reviewsCount: 11,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Rétroéclairage': 'LED RGB multicolore',
        'Connexion': 'Câble USB Plug & Play sans pilote requis',
        'Touches': '104 touches avec pavé numérique intégré',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_9.jpg', altText: 'Clavier rétroéclairé RGB DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Noir RGB', colorCode: '#1A1E24', stock: 12, sku: 'DM-TEC-KEYB-RGB-1001' },
        ],
      },
    },
  });

  // #7 Batterie Externe 20000 mAh Fast Charge
  await prisma.product.create({
    data: {
      name: 'Batterie Externe Power Bank 20,000 mAh Dual USB',
      slug: 'batterie-externe-power-bank-20000-mah',
      description: `⚡ NE SOYEZ PLUS JAMAIS À COURT D'ÉNERGIE AUX ÎLES SALOMON !

La batterie externe DealMart 20 000 mAh recharge simultanément jusqu'à 3 appareils :
• Capacité géante capable de recharger un smartphone 4 à 5 fois
• Double port USB + port USB-C Power Delivery 22.5W
• Indicateur LED de charge et circuits de protection anti-surchauffe.`,
      brand: 'DealMart Power',
      condition: 'NEUF_SCELLE',
      basePrice: 180,
      warrantyMonths: 6,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 31,
      categoryId: catElectronics.id,
      specsJson: JSON.stringify({
        'Capacité': '20 000 mAh (74 Wh)',
        'Ports de sortie': '2x USB-A Fast Charge + 1x USB-C PD',
        'Sécurité': 'Protection contre la surcharge et les courts-circuits',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_20.jpg', altText: 'Power Bank 20000mAh DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Noir Mat', colorCode: '#111827', stock: 20, sku: 'DM-POW-BANK-BLK-1001' },
        ],
      },
    },
  });

  // --- BEAUTÉ & COSMÉTIQUES ---

  // #8 Coffret Soins Sadoer Coconut Oil (6 pièces)
  const p8 = await prisma.product.create({
    data: {
      name: 'Coffret Routine Soins Visage Sadoer Coconut Oil (6 pièces)',
      slug: 'coffret-soins-visage-sadoer-coconut-oil',
      description: `✨ ROUTINE COMPLÈTE DE SOINS VISAGE DISPONIBLE CHEZ DEALMART ! 💖

Obtenez une peau éclatante et soyeuse avec le coffret nourrissant à l'huile de coco naturelle :
1. Nettoyant moussant purifiant doux (Cleanser)
2. Lotion tonique rafraîchissante et équilibrante (Toner)
3. Sérum concentré hydratant et raffermissant (Face Serum)
4. Émulsion fluide hydratante quotidienne (Face Lotion)
5. Crème réparatrice contour des yeux (Eye Cream)
6. Crème riche visage ultra-nourrissante (Face Cream)

Convient à tous types de peau, particulièrement les peaux sèches et fatiguées.`,
      brand: 'Sadoer',
      condition: 'NEUF_SCELLE',
      basePrice: 250,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 38,
      categoryId: catBeauty.id,
      specsJson: JSON.stringify({
        'Composant principal': 'Huile de coco pure 100% naturelle',
        'Contenu': 'Coffret luxe 6 produits complets',
        'Bénéfices': 'Hydratation profonde, éclat du teint, anti-tiraillement',
        'Certification': 'Sans parabènes, testé sous contrôle dermatologique',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_2.jpg', altText: 'Coffret Sadoer Coconut Oil DealMart', position: 0 },
          { url: '/images/products/dealmart/sadoer_ingredients.jpg', altText: 'Bénéfices et formule soin hydratant', position: 1 },
        ],
      },
      variants: {
        create: [
          { color: 'Pack Complet 6 Pièces', colorCode: '#5B3A29', stock: 18, sku: 'DM-SAD-COCO-SET-1001' },
        ],
      },
    },
  });

  // #9 Mallette Maquillage Professionnelle
  await prisma.product.create({
    data: {
      name: 'Mallette Complète de Maquillage Professionnelle DealMart',
      slug: 'mallette-complete-maquillage-professionnelle',
      description: `💄 OFFRE EXCLUSIVE MAKEUP DEALS CHEZ DEALMART HONIARA ! 💄

La mallette de maquillage complète indispensable pour renouveler toute votre collection beauté sans vous ruiner :
• Grandes palettes d'ombres à paupières hautement pigmentées
• Rouges à lèvres aux finis mats et satinés longue tenue
• Poudres bronzantes, blush et illuminateurs de teint
• Set complet de 12 pinceaux professionnels doux et denses
• Mallette rigide à compartiments avec miroir intégré.`,
      brand: 'DealMart Beauty',
      condition: 'NEUF_SCELLE',
      basePrice: 650,
      promoPrice: 590,
      warrantyMonths: 6,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 15,
      categoryId: catBeauty.id,
      specsJson: JSON.stringify({
        'Boîtier': 'Mallette compartimentée zippée avec poignée',
        'Accessoires': '12 pinceaux pro + miroir haute clarté',
        'Pigmentation': 'Tenue 24 heures résistante à la chaleur',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_14.jpg', altText: 'Mallette Maquillage Complète DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Mallette Luxe Noire', colorCode: '#111827', stock: 7, sku: 'DM-BTY-MKUP-KIT-1001' },
        ],
      },
    },
  });

  // #10 Parfum Homme de Prestige
  await prisma.product.create({
    data: {
      name: 'Parfum pour Homme de Prestige (Eau de Parfum 100ml)',
      slug: 'parfum-homme-prestige-eau-de-parfum-100ml',
      description: `🔥 ARRIVAGE OFFICIEL DES PARFUMS HOMME LES PLUS DEMANDÉS CHEZ DEALMART !

Une fragrance virile, magnétique et raffinée qui affirme votre présence :
• Notes de tête : Bergamote fraîche et poivre noir épicé
• Notes de cœur : Cuir noble, vétiver et lavande aromatique
• Notes de fond : Bois de cèdre, ambre gris et patchouli
• Sillage puissant et excellente tenue sous le climat tropical.`,
      brand: 'Luxury Fragrance',
      condition: 'NEUF_SCELLE',
      basePrice: 450,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 22,
      categoryId: catBeauty.id,
      specsJson: JSON.stringify({
        'Contenance': '100 ml (3.4 fl. oz)',
        'Concentration': 'Eau de Parfum (EDP) longue durée',
        'Famille olfactive': 'Boisé Épicé Chaud',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_8.jpg', altText: 'Parfum Homme Prestige DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Flacon 100 ml', colorCode: '#0054A4', stock: 10, sku: 'DM-FRG-MENP-100-1001' },
        ],
      },
    },
  });

  // #11 Parfum Femme Élégance
  await prisma.product.create({
    data: {
      name: 'Parfum pour Femme Élégance & Séduction (Eau de Parfum 100ml)',
      slug: 'parfum-femme-elegance-seduction-100ml',
      description: `🔥 LE GRAND RETOUR DES PARFUMS FEMME LES PLUS PLEBISCITÉS CHEZ DEALMART !

Un parfum envoûtant qui sublime la féminité et le charme :
• Notes de tête : Fruits rouges pétillants et mandarine douce
• Notes de cœur : Jasmin sambac blanc et rose précieuse
• Notes de fond : Vanille de Madagascar, musc blanc et santal.`,
      brand: 'Luxury Fragrance',
      condition: 'NEUF_SCELLE',
      basePrice: 450,
      warrantyMonths: 12,
      isFeatured: false,
      rating: 5.0,
      reviewsCount: 29,
      categoryId: catBeauty.id,
      specsJson: JSON.stringify({
        'Contenance': '100 ml',
        'Concentration': 'Eau de Parfum (EDP)',
        'Famille olfactive': 'Floral Oriental Sensuel',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_11.jpg', altText: 'Parfum Femme Élégance DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Flacon 100 ml', colorCode: '#F472B6', stock: 12, sku: 'DM-FRG-WOMP-100-1001' },
        ],
      },
    },
  });

  // --- MODE, CHAUSSURES & MONTRES ---

  // #12 Montres Dames Élégantes
  await prisma.product.create({
    data: {
      name: 'Montre Élégante pour Dames Cadran Cristaux (Ladies Fashion Watch)',
      slug: 'montre-elegante-dames-cadran-cristaux',
      description: `🔥 MONTRES ÉLÉGANTES POUR DAMES EN STOCK CHEZ DEALMART !

L'accessoire chic indispensable pour rehausser votre style au quotidien ou lors de vos sorties :
• Cadran orné de cristaux étincelants taillés avec précision
• Bracelet en mailles acier inoxydable confortable et résistant
• Mouvement à quartz japonais de haute précision
• Fermoir déployant sécurisé.`,
      brand: 'Ladies Watch Collection',
      condition: 'NEUF_SCELLE',
      basePrice: 300,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 14,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Mouvement': 'Quartz haute précision',
        'Boîtier': 'Acier inoxydable finition dorée / argentée',
        'Résistance': 'Résistant aux éclaboussures',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_6.jpg', altText: 'Montre pour femme DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Doré Brillant', colorCode: '#F1B20B', stock: 7, sku: 'DM-WAT-LADG-GLD-1001' },
          { color: 'Argenté Étoilé', colorCode: '#D1D5DB', stock: 5, sku: 'DM-WAT-LADG-SLV-1002' },
        ],
      },
    },
  });

  // #13 Sac de Voyage Luxe
  await prisma.product.create({
    data: {
      name: 'Grand Sac de Voyage & Week-end Imperméable (Travel Bag)',
      slug: 'grand-sac-voyage-week-end-impermeable',
      description: `🌟 SAC DE VOYAGE RETOUR EN STOCK CHEZ DEALMART !

Voyagez avec classe et praticité :
• Toile enduite renforcée imperméable et résistante aux déchirures
• Grand compartiment principal zippé avec poches intérieures d'organisation
• Poignées cuir souple et bandoulière réglable amovible
• Format idéal pour les voyages en avion ou transferts inter-îles.`,
      brand: 'Travel Luxe',
      condition: 'NEUF_SCELLE',
      basePrice: 350,
      warrantyMonths: 12,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 18,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Dimensions': '50 x 28 x 25 cm',
        'Matière': 'Toile enduite haute résistance & finitions cuir',
        'Capacité': 'Volume spacieux environ 40 litres',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_7.jpg', altText: 'Sac de voyage luxe DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Monogramme Brun & Cuir', colorCode: '#5B3A29', stock: 9, sku: 'DM-BAG-TRVL-BRN-1001' },
        ],
      },
    },
  });

  // #14 Robe Femme Fluide
  await prisma.product.create({
    data: {
      name: 'Robe d\'Été Élégante pour Femmes (Tailles L et XL)',
      slug: 'robe-ete-elegante-femmes-tailles-l-xl',
      description: `🔥 HOT DEAL OF WOMEN'S DRESSES CHEZ DEALMART HONIARA !

Sublimez votre allure avec nos robes féminines fluides :
• Tissu léger et soyeux parfait pour la brise tropicale
• Coupe flatteuse qui met en valeur toutes les morphologies
• Disponible en tailles L et XL au magasin DealMart Kukum.`,
      brand: 'Fashion Island',
      condition: 'NEUF_SCELLE',
      basePrice: 180,
      promoPrice: 100,
      warrantyMonths: 3,
      isFeatured: false,
      rating: 4.7,
      reviewsCount: 12,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Tailles disponibles': 'L et XL',
        'Matière': 'Viscose & coton fluide respirant',
        'Entretien': 'Lavage doux en machine à 30°C',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_12.jpg', altText: 'Robe pour femme DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Imprimé Floral (Taille L)', colorCode: '#EC4899', storage: 'Taille L', stock: 6, sku: 'DM-DRS-FLOR-L-1001' },
          { color: 'Imprimé Floral (Taille XL)', colorCode: '#EC4899', storage: 'Taille XL', stock: 6, sku: 'DM-DRS-FLOR-XL-1002' },
        ],
      },
    },
  });

  // #15 Baskets Sneakers Homme Sport
  await prisma.product.create({
    data: {
      name: 'Baskets Sneakers Homme Running & Streetwear',
      slug: 'baskets-sneakers-homme-running-streetwear',
      description: `🚨 OFFRE SPÉCIALE SNEAKERS HOMME CHEZ DEALMART !

Offrez à vos pieds le confort et le style dont ils ont besoin :
• Semelle ergonomique absorbant les chocs avec traction antidérapante
• Empeigne en mesh aéré pour garder vos pieds au frais
• Idéales pour le sport, la marche ou les sorties du week-end.`,
      brand: 'Sport Streetwear',
      condition: 'NEUF_SCELLE',
      basePrice: 480,
      warrantyMonths: 6,
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 20,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Pointures': '40, 41, 42, 43, 44',
        'Amorti': 'Semelle intermédiaire coussin d\'air',
        'Tige': 'Mesh respirant renforcé',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_13.jpg', altText: 'Baskets Homme Sneakers DealMart', position: 0 },
          { url: '/images/products/dealmart/post_15.jpg', altText: 'Sneakers Homme Vue de profil', position: 1 },
        ],
      },
      variants: {
        create: [
          { color: 'Noir & Blanc Sport', colorCode: '#111827', storage: 'Pointure 42', stock: 5, sku: 'DM-SNK-MENB-42-1001' },
          { color: 'Noir & Blanc Sport', colorCode: '#111827', storage: 'Pointure 43', stock: 4, sku: 'DM-SNK-MENB-43-1002' },
        ],
      },
    },
  });

  // #16 Baskets Sneakers Femme Tendance
  await prisma.product.create({
    data: {
      name: 'Sneakers Tendance pour Femmes Confort Absolu',
      slug: 'sneakers-tendance-femmes-confort-absolu',
      description: `Vos baskets de rêve enfin abordables chez DealMart !
Pourquoi choisir entre confort et élégance ? Nos sneakers féminines s'adaptent à toutes vos tenues avec légèreté.`,
      brand: 'Sport Streetwear',
      condition: 'NEUF_SCELLE',
      basePrice: 420,
      warrantyMonths: 6,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 16,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Pointures': '37, 38, 39, 40',
        'Semelle': 'Semelle compensée légère mémoire de forme',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_17.jpg', altText: 'Sneakers Femme DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Blanc & Rose Poudré', colorCode: '#FBCFE8', storage: 'Pointure 38', stock: 6, sku: 'DM-SNK-WOMR-38-1001' },
        ],
      },
    },
  });

  // #17 Chaussures Toile Enfants Samisobo
  await prisma.product.create({
    data: {
      name: 'Baskets Basses en Toile Jaune Enfants (Samisobo All Sport)',
      slug: 'baskets-basses-toile-jaune-enfants-samisobo',
      description: `🔥 KID SHOES AVAILABLE AT DEALMART SHOP HONIARA !

Baskets en toile jaune DealMart avec scratch et lacets :
• Toile respirante solide et lavable
• Semelle vulcanisée en caoutchouc antidérapant
• Fermeture velcro pour que les enfants se chaussent en toute autonomie.`,
      brand: 'Samisobo',
      condition: 'NEUF_SCELLE',
      basePrice: 80,
      warrantyMonths: 6,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 34,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Pointures': '25 à 32',
        'Fermeture': 'Scratch velcro + lacets élastiques',
        'Semelle': 'Caoutchouc blanc vulcanisé',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_3.jpg', altText: 'Baskets Toile Jaune Enfant DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Jaune DealMart', colorCode: '#F1B20B', stock: 15, sku: 'DM-KID-SAMJ-YEL-1001' },
        ],
      },
    },
  });

  // #18 Sandales Enfants Snorks
  await prisma.product.create({
    data: {
      name: 'Sandales d\'Été Enfants Bleu & Rose (Snorks Beach Sandals)',
      slug: 'sandales-ete-enfants-snorks-bleu-rose',
      description: `Sandales d'été légères et ergonomiques pour enfants.
Résistantes à l'eau de mer et faciles à nettoyer. Parfaites pour la plage et le jeu en extérieur.`,
      brand: 'Snorks',
      condition: 'NEUF_SCELLE',
      basePrice: 80,
      warrantyMonths: 6,
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 19,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Pointures': '23 à 30',
        'Matière': 'Mousse EVA souple imperméable',
        'Fermeture': 'Double bande auto-agrippante',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/kids_snorks_sandals.jpg', altText: 'Sandales Enfants Snorks DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Bleu Ciel & Rose', colorCode: '#93C5FD', stock: 12, sku: 'DM-KID-SNRK-BLU-1001' },
        ],
      },
    },
  });

  // #19 Sandales Fille SNBA avec Nœud
  await prisma.product.create({
    data: {
      name: 'Sandales Habillées Fille Cuir Noir & Nœud Papillon à Pois (SNBA)',
      slug: 'sandales-fille-noir-noeud-pois-snba',
      description: `Magnifiques sandales élégantes pour petites filles.
Lanière en cuir synthétique souple avec boucle dorée et superbe nœud papillon à pois noir et blanc.`,
      brand: 'SNBA',
      condition: 'NEUF_SCELLE',
      basePrice: 80,
      warrantyMonths: 6,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 23,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Pointures': '26 à 33',
        'Tige': 'Cuir synthétique souple avec nœud tissu',
        'Semelle': 'Semelle confort anatomique',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/kids_bow_sandals.jpg', altText: 'Sandales Fille Nœud Pois DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Noir & Pois Blancs', colorCode: '#111827', stock: 10, sku: 'DM-KID-SNBA-BLK-1001' },
        ],
      },
    },
  });

  // #20 Pyjamas Enfants
  await prisma.product.create({
    data: {
      name: 'Ensemble Pyjamas Enfants 100% Coton Doux (Kids Pyjamas)',
      slug: 'ensemble-pyjamas-enfants-pur-coton-doux',
      description: `🎉 VENTE FLASH PYJAMAS ENFANTS CHEZ DEALMART ! 🎉

Pour des nuits paisibles et douces :
• Confectionné en pur coton peigné respirant et hypoallergénique
• Motifs joyeux qui résistent aux lavages répétés
• Coupe confortable avec taille élastiquée sans serrer.`,
      brand: 'Kids Comfort',
      condition: 'NEUF_SCELLE',
      basePrice: 75,
      warrantyMonths: 3,
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 17,
      categoryId: catFashion.id,
      specsJson: JSON.stringify({
        'Âges': '2 à 10 ans',
        'Matière': '100% coton doux',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_18.jpg', altText: 'Pyjamas Enfants DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Multicolore Coton', colorCode: '#38BDF8', stock: 14, sku: 'DM-KID-PYJM-COT-1001' },
        ],
      },
    },
  });

  // --- MAISON, AUTO & BIEN-ÊTRE ---

  // #21 Désodorisants Auto Luxe
  await prisma.product.create({
    data: {
      name: 'Désodorisant Automobile Parfumé de Luxe DealMart',
      slug: 'desodorisant-automobile-parfume-de-luxe',
      description: `🚨 FRESH SCENT ALERT AT DEALMART ! 🚨

Votre véhicule mérite le meilleur parfum :
• Diffuseur de senteurs haut de gamme à clipser sur les grilles d'aération
• Élimine instantanément les odeurs d'humidité et de tabac
• Parfum vivifiant qui dure plus de 45 jours.`,
      brand: 'DealMart Home & Auto',
      condition: 'NEUF_SCELLE',
      basePrice: 50,
      warrantyMonths: 3,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 42,
      categoryId: catHome.id,
      specsJson: JSON.stringify({
        'Durée': '45+ jours de diffusion continue',
        'Senteur': 'Fraîcheur Océane & Bois Précieux',
        'Fixation': 'Pince universelle pour grille de ventilation',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_19.jpg', altText: 'Désodorisant Voiture DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Fraîcheur Marine', colorCode: '#0054A4', stock: 35, sku: 'DM-AUT-FRSH-BLU-1001' },
        ],
      },
    },
  });

  // #22 Appareil Massage des Pieds
  await prisma.product.create({
    data: {
      name: 'Appareil de Massage & Réflexologie Plantaire des Pieds',
      slug: 'appareil-massage-reflexologie-plantaire-pieds',
      description: `RELAXATION & SOIN PERSONNEL CHEZ DEALMART HONIARA !

Vos pieds vous portent toute la journée sous la chaleur tropicale :
• Rouleaux de massage shiatsu rotatifs stimulant les points de réflexologie
• Fonction chaleur douce pour stimuler la circulation sanguine et soulager les tensions
• 3 modes d'intensité réglables avec télécommande pratique.`,
      brand: 'DealMart Wellness',
      condition: 'NEUF_SCELLE',
      basePrice: 380,
      warrantyMonths: 12,
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 15,
      categoryId: catHome.id,
      specsJson: JSON.stringify({
        'Fonctions': 'Massage Shiatsu, Chaleur infrarouge, Compression d\'air',
        'Alimentation': 'Prise secteur 220V',
        'Entretien': 'Housses de pieds amovibles et lavables',
      }),
      images: {
        create: [
          { url: '/images/products/dealmart/post_10.jpg', altText: 'Appareil Massage Pieds DealMart', position: 0 },
        ],
      },
      variants: {
        create: [
          { color: 'Gris & Noir Confort', colorCode: '#374151', stock: 6, sku: 'DM-WEL-FOOT-GRY-1001' },
        ],
      },
    },
  });

  console.log('✅ 22 Produits authentiques créés avec succès.');

  // 3. Avis clients authentiques géolocalisés aux Îles Salomon
  await prisma.review.createMany({
    data: [
      {
        productId: p4.id, // Rasoir Kemei
        authorName: 'Peter K.',
        city: 'Kukum, Honiara',
        rating: 5,
        comment: 'Best shaver in town! The LED battery display is super helpful and it cuts very cleanly. Grabbed it at the Kukum shop for SI$ 350.',
        isApproved: true,
        isFeaturedHome: true,
      },
      {
        productId: p8.id, // Sadoer Coconut set
        authorName: 'Grace M.',
        city: 'Point Cruz, Honiara',
        rating: 5,
        comment: 'My skin has never felt so soft! The coconut toner and serum smell amazing. Great quality skincare set.',
        isApproved: true,
        isFeaturedHome: true,
      },
      {
        productId: p1.id, // Samsung S23+
        authorName: 'James V.',
        city: 'Gizo, Western Province',
        rating: 5,
        comment: 'Phone delivered by flight to Gizo in 2 days. 100% brand new sealed in box with warranty. Thank you DealMart team!',
        isApproved: true,
        isFeaturedHome: true,
      },
    ],
  });

  console.log('✅ Avis clients enregistrés.');

  // 4. Codes promo actifs DealMart
  await prisma.promoCode.createMany({
    data: [
      {
        code: 'HONIARA2026',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 100,
        isActive: true,
        timesUsed: 3,
      },
      {
        code: 'DEALMART5',
        discountType: 'PERCENTAGE',
        discountValue: 5,
        minOrderAmount: 50,
        isActive: true,
        timesUsed: 12,
      },
    ],
  });

  console.log('✅ Codes promo créés.');
  console.log('🎉 SEED DEALMART TERMINÉ AVEC SUCCÈS !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
