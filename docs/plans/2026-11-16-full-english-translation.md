# Implementation Plan: Full English Translation (100% Native English)

> **Pour l'agent d'exécution :** Chaque tâche est jalonnée de cases à cocher (`- [ ]`). Validez chaque micro-étape séquentiellement.

**Objectif :** Traduire l'intégralité de la plateforme DealMart (vitrine publique, tunnel d'achat, espace client, e-mails transactionnels et tableau de bord administrateur) en anglais natif pour le marché des Îles Salomon.  
**Architecture :** Remplacement direct et exhaustif des chaînes en français par des textes anglais natifs professionnels adaptés au marché d'Honiara et des Îles Salomon (Option A - 100% Native English, zéro surcharge runtime ni configuration de routage additionnelle).  
**Pile technique :** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Prisma ORM, Lucide React.  
**Spécification source :** Validation utilisateur du choix d'architecture Option A (100% English native + Admin).

## Contraintes Globales
- Zéro mention restante en français ("Boutique", "Panier", "Commander", "Prix", "Livraison", etc.).
- Conserver scrupuleusement la monnaie officielle des Salomon : `SI$` (ou `SBD`), avec le formatage déjà en place.
- Adresse et horaires officiels : `Kukum Transol Building, Honiara, Solomon Islands`, `Mon - Sat: 8:30 AM - 7:30 PM`.
- Numéro et WhatsApp officiels : `+677 7465588`.
- Aucun changement cassant sur les noms de routes existantes ou les tables de la base de données.
- Chaque étape doit préserver la compilation TypeScript (`npx tsc --noEmit`) sans aucune erreur.

## Focus de Revue Critique (Top 5 des angles morts potentiels)
1. **Statuts de commande et états produits :** Les clés techniques de la base Prisma (`NEUF_SCELLE`, `EN_ATTENTE`, etc.) ne doivent pas être renommées dans la base de données, seuls leurs libellés affichés (`label`, `badgeShort`, `description`) doivent être traduits.
2. **Messages dynamiques et toasts :** S'assurer que les toasts dans `CartContext`, `OrderContext`, et les formulaires sont traduits en anglais.
3. **Labels d'accessibilité et attributs `aria-label` / `placeholder` :** Remplacer les textes d'accessibilité et placeholders dans tous les inputs et boutons.
4. **Dates et heures :** Les formats de date affichés dans les avis, commandes et logs doivent adopter les conventions anglophones (`MMM DD, YYYY` ou `en-US` / `en-GB`).
5. **Formulaires de paiement et adresses :** Les champs doivent correspondre aux réalités des Îles Salomon (Honiara, Suburb / Area, Island / Province, Cash on Delivery, BSP Bank Transfer).

---

## Phase 1 : Fondations, Utils & Contextes Globaux

- [ ] **Tâche 1.1 : Mise à jour de la configuration globale du site**
  - **Fichier :** `src/lib/site-config.ts`
  - **Consomme :** Variables d'environnement `NEXT_PUBLIC_STORE_*`.
  - **Produit :** Constante `siteConfig` avec tous les fallbacks en anglais (slogan, openingHours, description).
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 1.2 : Traduction des fonctions utilitaires, statuts et badges**
  - **Fichier :** `src/lib/utils.ts`
  - **Consomme :** Types `ProductCondition`, `OrderStatus`.
  - **Produit :** Libellés traduits en anglais pour `getConditionBadgeInfo`, `getOrderStatusInfo`, `getPaymentMethodLabel`, `getTimeAgo`.
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 1.3 : Traduction des contextes d'état (Panier, Auth, Commandes)**
  - **Fichiers :** `src/context/CartContext.tsx`, `src/context/OrderContext.tsx`, `src/context/AuthContext.tsx`
  - **Consomme :** Actions d'ajout/suppression panier, création de commandes.
  - **Produit :** Messages toasts en anglais ("Added to cart", "Promo code applied successfully", "Stock limit reached", "Order placed successfully").
  - **Validation :** `npx tsc --noEmit`

---

## Phase 2 : Composants Vitrine & Navigation

- [ ] **Tâche 2.1 : Traduction du Header, Navbar, Footer et Tiroir Panier**
  - **Fichiers :**
    - `src/components/layout/TopUtilityBar.tsx`
    - `src/components/layout/Header.tsx`
    - `src/components/layout/MainNav.tsx`
    - `src/components/layout/Footer.tsx`
    - `src/components/cart/CartDrawer.tsx`
  - **Traductions clés :** "Search for electronics, perfumes, shoes...", "Cart", "Account", "Store", "About Us", "Contact", "Opening Hours", "Customer Support", "Quick Links", "View Cart", "Checkout Now", "Subtotal", "Free Shipping".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 2.2 : Traduction des composants de la Page d'Accueil**
  - **Fichiers :**
    - `src/components/home/HeroBanner.tsx`
    - `src/components/home/TrustBadges.tsx`
    - `src/components/home/BrandShowcase.tsx`
    - `src/components/home/SpecialOfferCountdown.tsx`
    - `src/components/home/ProductShowcase.tsx`
    - `src/components/home/Testimonials.tsx`
    - `src/components/home/NewsletterSection.tsx`
    - `src/components/home/HomePageClient.tsx`
  - **Traductions clés :** "Shop Now", "Exclusive Deals in Honiara", "Fast Nationwide Delivery", "100% Genuine Products", "Deal of the Day", "Ends in", "Featured Products", "What Our Customers Say", "Subscribe to our Newsletter", "Get the latest deals and discounts directly in your inbox".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 2.3 : Traduction des composants Produits et Avis**
  - **Fichiers :**
    - `src/components/product/ProductCard.tsx`
    - `src/components/product/ProductReviews.tsx`
  - **Traductions clés :** "Add to Cart", "Out of Stock", "Quick View", "Reviews", "Verified Buyer", "Write a Review", "Rate this product", "Submit Review", "Specifications", "In Stock".
  - **Validation :** `npx tsc --noEmit`

---

## Phase 3 : Catalogue Magasin & Fiches Produits

- [ ] **Tâche 3.1 : Traduction de la page Magasin / Catalogue**
  - **Fichiers :** `src/app/boutique/page.tsx`, `src/components/boutique/BoutiqueClient.tsx`
  - **Traductions clés :** "Shop All Products", "Filters", "Categories", "Price Range", "Sort by: Price low to high, Price high to low, Newest", "Showing X of Y products", "Clear filters", "No products found matching your criteria".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 3.2 : Traduction de la page détaillée du Produit**
  - **Fichier :** `src/app/produit/[slug]/page.tsx`
  - **Traductions clés :** "Description", "Features & Specifications", "Delivery Information", "Same-day delivery in Honiara", "Customer Reviews", "Related Products", "Select Variant", "Quantity", "Buy Now".
  - **Validation :** `npx tsc --noEmit`

---

## Phase 4 : Tunnel de Commande & Espaces Utilisateurs

- [ ] **Tâche 4.1 : Traduction de la page Panier**
  - **Fichier :** `src/app/panier/page.tsx`
  - **Traductions clés :** "Your Shopping Cart", "Product", "Price", "Quantity", "Total", "Remove", "Have a promo code?", "Apply Code", "Order Summary", "Estimated Delivery", "Proceed to Checkout", "Continue Shopping", "Your cart is empty".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 4.2 : Traduction de la page Checkout**
  - **Fichier :** `src/app/checkout/page.tsx`
  - **Traductions clés :** "Checkout", "Customer Information", "Delivery Address", "Full Name", "Phone / WhatsApp Number", "Delivery Notes / Landmark", "Province / Island", "City (Honiara)", "Payment Method", "Cash on Delivery", "Direct Bank Transfer (BSP)", "Place Order", "By placing this order, you agree to our Terms".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 4.3 : Traduction des pages Confirmation & Suivi de Commande**
  - **Fichiers :** `src/app/commande/[id]/page.tsx`, `src/app/suivi/page.tsx`
  - **Traductions clés :** "Thank you for your order!", "Order Reference", "We received your order and will contact you via WhatsApp/Phone for delivery", "Track Your Order", "Enter your order number", "Current Status", "Order Details", "Delivery to".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 4.4 : Traduction des pages Authentification**
  - **Fichiers :**
    - `src/components/auth/ConnexionForm.tsx`
    - `src/components/auth/InscriptionForm.tsx`
    - `src/app/connexion/page.tsx`
    - `src/app/inscription/page.tsx`
    - `src/app/mot-de-passe-oublie/page.tsx`
    - `src/app/reinitialiser-mot-de-passe/page.tsx`
  - **Traductions clés :** "Sign In", "Sign Up", "Email address", "Password", "Confirm Password", "Forgot your password?", "Reset Password", "Don't have an account? Create one", "Already have an account? Sign in", "Continue with Google".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 4.5 : Traduction du tableau de bord Client & Favoris**
  - **Fichiers :**
    - `src/app/compte/page.tsx`
    - `src/app/compte/commandes/page.tsx`
    - `src/app/compte/adresses/page.tsx`
    - `src/app/compte/favoris/page.tsx`
    - `src/app/favoris/page.tsx`
  - **Traductions clés :** "My Account", "Order History", "Saved Addresses", "My Wishlist", "Profile Details", "Sign Out", "No orders yet", "Manage Addresses", "Add New Address".
  - **Validation :** `npx tsc --noEmit`

---

## Phase 5 : Pages Légales & Notifications E-mail

- [ ] **Tâche 5.1 : Traduction des Conditions Générales & Politique de Confidentialité**
  - **Fichiers :** `src/app/cgv/page.tsx`, `src/app/confidentialite/page.tsx`
  - **Traductions clés :** Remplacement complet par les versions anglaises "Terms & Conditions of Service" et "Privacy Policy", conformes au droit des affaires et du commerce des Salomon et aux coordonnées de DealMart à Honiara.
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 5.2 : Traduction des E-mails Transactionnels**
  - **Fichier :** `src/lib/email-service.ts`
  - **Traductions clés :** Objets et corps des emails de confirmation de commande, mise à jour de statut, réinitialisation de mot de passe ("Order Confirmation - DealMart #...", "Your Order Status has been updated", "Password Reset Request").
  - **Validation :** `npx tsc --noEmit`

---

## Phase 6 : Espace Administration (`/admin`) & Validation Finale

- [ ] **Tâche 6.1 : Traduction de l'authentification et de la navigation Admin**
  - **Fichiers :**
    - `src/components/admin/AdminSidebar.tsx`
    - `src/components/admin/AdminHeader.tsx`
    - `src/components/admin/AdminLoginForm.tsx`
    - `src/app/admin/login/page.tsx`
  - **Traductions clés :** "Dashboard", "Products", "Orders", "Customer Reviews", "Analytics", "Settings", "Admin Sign In", "Access DealMart Management", "Signed in as", "Logout".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 6.2 : Traduction du Tableau de Bord Admin (KPIs)**
  - **Fichier :** `src/app/admin/(protected)/page.tsx`
  - **Traductions clés :** "Overview", "Total Revenue", "Total Orders", "Active Products", "Recent Orders", "Quick Actions", "View all orders", "Low Stock Alert".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 6.3 : Traduction de la gestion des Produits Admin**
  - **Fichiers :**
    - `src/app/admin/(protected)/produits/page.tsx`
    - `src/app/admin/(protected)/produits/nouveau/page.tsx`
    - `src/app/admin/(protected)/produits/[id]/modifier/page.tsx`
  - **Traductions clés :** "Products Management", "Add New Product", "Edit Product", "Product Title", "Base Price", "Promotional Price", "Stock Quantity", "Condition", "Category", "Specifications", "Upload Images", "Save Changes", "Delete Product".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 6.4 : Traduction des Commandes et Avis Admin**
  - **Fichiers :**
    - `src/app/admin/(protected)/commandes/page.tsx`
    - `src/app/admin/(protected)/avis/page.tsx`
  - **Traductions clés :** "Orders Management", "Filter by status", "Customer", "Date", "Items", "Payment", "Update Status", "Customer Reviews Moderation", "Rating", "Approve", "Reject", "Delete Review".
  - **Validation :** `npx tsc --noEmit`

- [ ] **Tâche 6.5 : Contrôle Qualité, Scan Anti-Français et Build de Production**
  - **Actions :**
    - Script de scan pour détecter toute chaîne française résiduelle.
    - `npx tsc --noEmit` (vérification de types stricte).
    - `npm run build` (génération de production Next.js 16).
    - Commit Git et Push sur la branche `main` de GitHub.
