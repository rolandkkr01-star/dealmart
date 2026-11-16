import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔄 Starting full database content translation to English...');

  // 1. Update Categories
  const categoryUpdates = [
    { slug: 'electronics-gadgets', name: 'Electronics & High-Tech' },
    { slug: 'beauty-cosmetics-skincare', name: 'Beauty, Cosmetics & Skincare' },
    { slug: 'fashion-accessories', name: 'Fashion, Footwear & Watches' },
    { slug: 'home-kitchen-living', name: 'Home, Living & Auto Care' },
  ];

  for (const cat of categoryUpdates) {
    await prisma.category.updateMany({
      where: { slug: cat.slug },
      data: { name: cat.name },
    });
    console.log(`✅ Category updated: ${cat.name}`);
  }

  // 2. Update Products
  const products = [
    {
      id: 'cmwiwj0bz0005v1j4kn1plidr',
      name: 'Samsung Galaxy S23+ (256GB / 8GB RAM)',
      description: '🔥 IN STOCK AT DEALMART HONIARA!\n\nThe flagship Samsung Galaxy S23+ smartphone combines power and elegance:\n• Ultra-fast Snapdragon 8 Gen 2 Mobile Platform for Galaxy\n• Immersive 6.6-inch Dynamic AMOLED 2X 120Hz display\n• 50MP high-resolution triple camera system with Nightography\n• 256GB internal storage and 8GB RAM\n• Long-lasting 4,700 mAh battery with Super Fast Charging\n\nOfficial manufacturer warranty with DealMart authenticity certificate.',
    },
    {
      id: 'cmwiwj22b000av1j4hn4qxw6q',
      name: 'Samsung Galaxy Z Fold 4 (512GB / 12GB RAM)',
      description: 'The pinnacle of foldable mobile innovation at DealMart.\nThe 7.6-inch expansive interior display unfolds for uncompromising productivity, S-Pen stylus support, and simultaneous 3-app multitasking.\n\n• 7.6" Dynamic AMOLED 2X 120Hz foldable display\n• 6.2" convenient single-hand cover screen\n• Generous 512GB storage and 12GB RAM\n• Armor Aluminum frame with IPX8 water resistance.',
    },
    {
      id: 'cmwiwj3sz000ev1j4bklj3n3a',
      name: 'Xiaomi Redmi Note Pro (256GB / 8GB RAM)',
      description: 'The champion of high performance at an unbeatable price at DealMart.\nStunning 200MP camera sensor, ultra-bright AMOLED display, and 67W Turbo Charge.\n\n• 256GB storage and 8GB RAM\n• 120Hz FHD+ AMOLED display with ultra-thin bezels\n• 67W fast wall charger included in the box.',
    },
    {
      id: 'cmwiwj5oe000iv1j4n20ywiia',
      name: 'Kemei Rechargeable Electric Shaver (Gold & Black)',
      description: '🔥 FLASH DEAL AT DEALMART HONIARA! 🔥\n\nThe professional cordless Kemei shaver delivers a close, smooth, irritation-free shave:\n✅ Dual ultra-thin floating foil head for easy cleaning\n✅ High-definition LED display showing remaining battery percentage and 7500 RPM speed\n✅ High-torque motor with long-life rechargeable battery\n✅ Convenient USB charging (via wall adapter, laptop, or power bank)\n✅ Complete set includes USB cable, cleaning brush, and DealMart travel pouch.',
    },
    {
      id: 'cmwiwj7ep000pv1j4h5dsju7h',
      name: 'G7 Max Smart Watch (Bluetooth Calls & Fitness Tracker)',
      description: '🔥 NEW ARRIVAL AT DEALMART HONIARA!\n\nThe G7 Max Smart Watch brings full smart features right to your wrist:\n• Compatible with both Android and iPhone devices\n• Crisp Bluetooth phone calls, SMS and app notifications\n• 24/7 health tracking: heart rate, blood oxygen (SpO2), sleep monitoring\n• Multiple sport modes and daily activity step counter\n• Comfortable strap and IP67 water-resistant casing.',
    },
    {
      id: 'cmwiwj951000uv1j4356nn5ij',
      name: 'RGB Backlit Gaming & Office Keyboard DealMart',
      description: '⌨️ TECH ACCESSORY DEAL AT DEALMART!\n\nBrighten up your workstation or gaming setup with this dynamic RGB backlit keyboard:\n• Smooth, quiet, and ultra-responsive keystrokes\n• Multi-zone RGB lighting with adjustable brightness levels\n• Spill-resistant design with reinforced braided USB cable\n• Universal compatibility with PC, Mac, and consoles.',
    },
    {
      id: 'cmwiwjb0y000yv1j45w2ovca7',
      name: 'DealMart 20,000 mAh Dual USB Power Bank',
      description: '⚡ NEVER RUN OUT OF POWER IN THE SOLOMON ISLANDS!\n\nThe DealMart 20,000 mAh portable power bank charges up to 3 devices simultaneously:\n• Massive capacity charges standard smartphones 4 to 5 times\n• Dual USB-A ports plus USB-C Power Delivery 22.5W fast charge\n• LED battery status indicator and multi-protection safety circuitry.',
    },
    {
      id: 'cmwiwjcr90012v1j4qmr0ovrk',
      name: 'Sadoer Coconut Oil 6-Piece Skincare Routine Set',
      description: '✨ COMPLETE FACIAL SKINCARE ROUTINE AT DEALMART! 💖\n\nNourish and restore your natural glow with this coconut oil enriched skincare collection:\n1. Gentle Purifying Cleanser\n2. Refreshing Facial Toner\n3. Concentrated Hydrating Face Serum\n4. Daily Nourishing Face Lotion\n5. Eye Repair Cream\n6. Deep Moisturizing Face Cream\n\nNatural ingredients suitable for daily use under tropical climates.',
    },
    {
      id: 'cmwiwjehh0017v1j4ly1pu7zk',
      name: 'DealMart Complete Professional Makeup Train Case & Vanity Kit',
      description: '✨ COMPLETE PROFESSIONAL MAKEUP KIT AVAILABLE AT DEALMART HONIARA! 💄\n\nThe ultimate all-in-one vanity kit and cosmetic organizer for beauty lovers and artists:\n• Multi-tier cantilever trays with spacious bottom storage\n• Rich assortment of eyeshadows, lipsticks, blush, powders, and applicator brushes\n• Sturdy aluminum-reinforced travel case with locking latch and carry handle\n• Perfect for personal glam, weddings, events, or salon use.',
    },
    {
      id: 'cmwiwjg7s001bv1j4g0aksr91',
      name: "Prestige Men's Fragrance (Eau de Parfum 100ml)",
      description: '👔 CAPTIVATING & SOPHISTICATED MASCULINE SCENT AT DEALMART!\n\nMake a lasting impression with this long-lasting Eau de Parfum:\n• Opening notes of vibrant citrus and bergamot\n• Heart of spicy cardamom, lavender, and cedarwood\n• Warm base of amber and Madagascar vanilla\n• High concentration with exceptional all-day sillage.',
    },
    {
      id: 'cmwiwjhy7001fv1j4uc0nk5f2',
      name: "Elegance & Charm Women's Fragrance (Eau de Parfum 100ml)",
      description: '🌸 FEMININE & LUXURIOUS FLORAL SCENT AT DEALMART!\n\nA sensual, radiant fragrance created for modern women:\n• Sparkling top notes of jasmine and sweet raspberry\n• Romantic floral heart of Damascus rose and peony\n• Delicate trail of white musk and sandalwood\n• Gorgeous designer bottle, perfect as a gift.',
    },
    {
      id: 'cmwiwjjow001jv1j4qtbe5pqz',
      name: 'Ladies Crystal Accent Fashion Watch (Stainless Steel)',
      description: '✨ TIMELESS ELEGANCE AT DEALMART SHOP HONIARA!\n\nElevate your everyday style with this dazzling crystal dress watch:\n• Precision-cut crystal bezel catching the light at every angle\n• Polished stainless steel mesh bracelet for comfortable daily wear\n• Accurate Japanese quartz movement\n• Secure deployant clasp.',
    },
    {
      id: 'cmwiwjlfa001ov1j40tqqk7mn',
      name: 'Waterproof Large Weekend Travel Duffle Bag',
      description: '🌟 POPULAR TRAVEL DUFFLE BACK IN STOCK AT DEALMART!\n\nTravel with effortless style and durability:\n• Heavy-duty waterproof coated canvas resisting tears and splashes\n• Generous main zippered compartment with internal organizers\n• Reinforced soft-grip handles and detachable padded shoulder strap\n• Ideal for flights, weekend getaways, and inter-island boat trips.',
    },
    {
      id: 'cmwiwjnb9001sv1j4kzcox11c',
      name: "Women's Breezy Summer Dress (Sizes L & XL)",
      description: "🔥 HOT DEAL ON WOMEN'S DRESSES AT DEALMART HONIARA!\n\nFlatter your silhouette with this flowy, elegant summer dress:\n• Lightweight, silky fabric designed for the tropical island breeze\n• Relaxed flattering cut suitable for daily wear and festive gatherings\n• Available in sizes L and XL at DealMart Kukum shop.",
    },
    {
      id: 'cmwiwjp1n001xv1j4hbq6mff4',
      name: "Men's Lightweight Running & Streetwear Sneakers",
      description: "🚨 SPECIAL OFFER ON MEN'S SNEAKERS AT DEALMART!\n\nGive your feet superior comfort and street-ready style:\n• Ergonomic shock-absorbing sole with anti-slip traction\n• Breathable mesh upper keeping feet cool throughout the day\n• Perfect for athletic training, walking, or weekend casual wear.",
    },
    {
      id: 'cmwiwjqrz0023v1j49pcpuzc0',
      name: "Women's Comfort Cloud Platform Sneakers",
      description: "Step out in cloud-soft comfort and modern style with DealMart women's sneakers!\nVersatile cushioning pairs effortlessly with dresses, skirts, or jeans.",
    },
    {
      id: 'cmwiwjsib0027v1j4s0eeqw8v',
      name: 'Kids Yellow Canvas Shoes (Samisobo All Sport)',
      description: '🔥 KIDS SHOES AVAILABLE AT DEALMART SHOP HONIARA!\n\nBright yellow DealMart canvas sneakers with velcro straps and elastic laces:\n• Durable, washable, breathable canvas upper\n• Vulcanized anti-slip rubber outsole\n• Easy velcro closure allowing children to dress independently.',
    },
    {
      id: 'cmwiwju8v002bv1j47zwtdtgj',
      name: 'Kids Summer Beach & Play Sandals (Blue & Pink)',
      description: 'Lightweight, ergonomic summer sandals for kids.\nSaltwater resistant, quick-drying, and easy to wipe clean. Great for beach play and outdoor adventures.',
    },
    {
      id: 'cmwiwjw01002fv1j44ptcv6gj',
      name: 'Girls Black Leather Polka-Dot Bow Dress Sandals (SNBA)',
      description: 'Charming dress sandals for young girls.\nSoft synthetic leather strap with metallic buckle and delightful black-and-white polka-dot bow.',
    },
    {
      id: 'cmwiwjxqa002jv1j4faugykxi',
      name: 'Kids 100% Pure Combed Cotton Pajama Set',
      description: '🎉 FLASH DEAL ON KIDS PAJAMAS AT DEALMART! 🎉\n\nFor peaceful, comfortable tropical nights:\n• Crafted from breathable, hypoallergenic pure combed cotton\n• Cheerful printed designs retaining softness through washes\n• Elasticated waistband designed for zero pinch.',
    },
    {
      id: 'cmwiwjzm9002nv1j4iswaaa3b',
      name: 'DealMart Deluxe Vent Clip Car Air Freshener',
      description: '🚨 FRESH SCENT ALERT AT DEALMART! 🚨\n\nYour vehicle deserves a premium refreshing scent:\n• Deluxe air vent clip diffuser dispersing subtle, elegant fragrances\n• Neutralizes humidity, dust, and unwanted interior odors\n• Long-lasting aroma lasting up to 45 days.',
    },
    {
      id: 'cmwiwk1cw002rv1j4tmjss8qs',
      name: 'Electric Foot Massage & Reflexology Acupressure Machine',
      description: 'RELAXATION & PERSONAL WELLNESS AT DEALMART HONIARA!\n\nPamper tired feet after long days in the island warmth:\n• Deep-kneading Shiatsu rotating rollers targeting reflexology points\n• Soothing heat function enhancing circulation and easing muscular tension\n• 3 adjustable intensity levels with handy remote control.',
    },
  ];

  for (const prod of products) {
    await prisma.product.update({
      where: { id: prod.id },
      data: {
        name: prod.name,
        description: prod.description,
      },
    });
    console.log(`✅ Product updated: ${prod.name}`);
  }

  // 3. Update variant colors
  const colorMap: Record<string, string> = {
    'Noir Sidéral': 'Space Black',
    'Titane Naturel': 'Natural Titanium',
    'Or': 'Gold',
    'Argent': 'Silver',
    'Bleu': 'Blue',
    'Vert': 'Green',
    'Rose': 'Pink',
    'Jaune': 'Yellow',
    'Blanc': 'White',
    'Noir': 'Black',
  };

  const variants = await prisma.productVariant.findMany();
  for (const v of variants) {
    if (v.color && colorMap[v.color]) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { color: colorMap[v.color] },
      });
      console.log(`✅ Variant color updated: ${v.color} -> ${colorMap[v.color]}`);
    }
  }

  console.log('🎉 Finished database content translation successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
