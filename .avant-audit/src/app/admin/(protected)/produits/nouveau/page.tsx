'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { getCategoriesAction, createProductAction } from '@/actions/admin-products';
import { uploadProductImageAction } from '@/actions/upload';

interface VariantForm {
  storage: string;
  color: string;
  colorCode: string;
  priceOverride: string;
  promoPrice: string;
  stock: number;
  sku: string;
}

interface ImageForm {
  url: string;
  altText: string;
  position: number;
}

interface SpecForm {
  key: string;
  value: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState<'IPHONE' | 'SAMSUNG' | 'ACCESSOIRE'>('IPHONE');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<'NEUF_SCELLE' | 'NEUF_NON_SCELLE' | 'OCCASION'>('NEUF_SCELLE');
  const [tradeEligible, setTradeEligible] = useState(false);
  const [basePrice, setBasePrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  const generateSku = (brandName: string, prodName: string, storageVal?: string, colorVal?: string) => {
    const brandCode = brandName === 'IPHONE' ? 'APL' : brandName === 'SAMSUNG' ? 'SAM' : 'ACC';
    const nameClean = (prodName || 'PROD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const storageClean = storageVal ? storageVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'STD';
    const colorClean = colorVal ? colorVal.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() : 'DEF';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TP229-${brandCode}-${nameClean}-${storageClean}-${colorClean}-${rand}`;
  };

  // Variants
  const [variants, setVariants] = useState<VariantForm[]>([
    { storage: '128 Go', color: 'Noir', colorCode: '#1A1E24', priceOverride: '', promoPrice: '', stock: 5, sku: 'TP229-APL-PROD-128GO-NOI-1001' },
  ]);

  // Images uploaded directly
  const [images, setImages] = useState<ImageForm[]>([]);

  // Tech Specs
  const [specs, setSpecs] = useState<SpecForm[]>([
    { key: 'Écran', value: 'Super Retina XDR OLED' },
    { key: 'Processeur', value: 'Puce haute performance' },
    { key: 'Batterie', value: 'Autonomie toute la journée' },
  ]);

  useEffect(() => {
    async function loadCategories() {
      const res = await getCategoriesAction();
      if (res.success && res.categories.length > 0) {
        setCategories(res.categories);
        setCategoryId(res.categories[0].id);
      }
      setLoadingCats(false);
    }
    loadCategories();
  }, []);

  // Synchronisation dynamique du SKU lors du changement de marque
  const handleBrandChange = (newBrand: 'IPHONE' | 'SAMSUNG' | 'ACCESSOIRE') => {
    setBrand(newBrand);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sku: generateSku(newBrand, name, v.storage, v.color),
      }))
    );
  };

  // Synchronisation dynamique du nom
  const handleNameChange = (newName: string) => {
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const addVariant = () => {
    const autoSku = generateSku(brand, name, '256 Go', 'Titane Naturel');
    setVariants((prev) => [
      ...prev,
      {
        storage: '256 Go',
        color: 'Titane Naturel',
        colorCode: '#9C968E',
        priceOverride: '',
        promoPrice: '',
        stock: 5,
        sku: autoSku,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Vous devez conserver au moins une variante.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Téléversement direct de fichiers images depuis l'appareil
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadedList: ImageForm[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadProductImageAction(formData);
      if (res.success && res.url) {
        uploadedList.push({
          url: res.url,
          altText: name ? `Photo de ${name} - Vue ${images.length + uploadedList.length + 1}` : `Photo du smartphone - Vue ${images.length + uploadedList.length + 1}`,
          position: images.length + uploadedList.length,
        });
      } else {
        setError(res.error || `Échec du téléversement pour ${file.name}`);
      }
    }

    if (uploadedList.length > 0) {
      setImages((prev) => [...prev, ...uploadedList]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageManualUrl = () => {
    setImages((prev) => [
      ...prev,
      {
        url: '',
        altText: name ? `Photo de ${name}` : 'Photo du produit',
        position: prev.length,
      },
    ]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !categoryId || !basePrice || !description) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (images.length === 0) {
      setError('Veuillez ajouter au moins une image pour ce produit.');
      return;
    }

    // Validation des images
    for (const img of images) {
      if (!img.url || !img.url.trim()) {
        setError('Toutes les images doivent avoir une URL ou un fichier valide.');
        return;
      }
      if (!img.altText || img.altText.trim().length < 3) {
        setError('Le texte alternatif SEO est requis pour toutes les images (3 car. min).');
        return;
      }
    }

    // Validation des variantes
    for (const v of variants) {
      if (v.stock < 0) {
        setError('Le stock de chaque variante ne peut pas être négatif.');
        return;
      }
    }

    setSubmitting(true);

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      name,
      slug: slug || undefined,
      brand,
      categoryId,
      condition,
      tradeEligible,
      basePrice: parseInt(basePrice, 10),
      promoPrice: promoPrice ? parseInt(promoPrice, 10) : null,
      warrantyMonths,
      isFeatured,
      isActive,
      description,
      specs: Object.keys(specsObj).length > 0 ? specsObj : undefined,
      variants: variants.map((v) => ({
        storage: v.storage || null,
        color: v.color || null,
        colorCode: v.colorCode || null,
        priceOverride: v.priceOverride ? parseInt(v.priceOverride, 10) : null,
        promoPrice: v.promoPrice ? parseInt(v.promoPrice, 10) : null,
        stock: v.stock,
        sku: v.sku.trim() || generateSku(brand, name, v.storage, v.color),
      })),
      images: images.map((img, idx) => ({
        url: img.url,
        altText: img.altText,
        position: idx,
      })),
    };

    const res = await createProductAction(payload);
    setSubmitting(false);

    if (res.success) {
      router.push('/admin/produits');
      router.refresh();
    } else {
      if (res.error === 'UNAUTHORIZED') {
        router.push('/admin/login?redirect=/admin/produits/nouveau');
        return;
      }
      setError(res.error || 'Erreur lors de la création du produit.');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* En-tête de navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/produits"
          className="text-xs font-bold text-gray-500 hover:text-[#0062BD] flex items-center gap-1.5"
        >
          <Icons.ArrowLeft size={16} />
          <span>Retour aux produits</span>
        </Link>
        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
          Nouveau Produit
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
        <h1 className="font-heading font-black text-2xl text-gray-900 mb-1">
          Ajouter un Produit au Catalogue
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Renseignez la fiche technique, le prix en FCFA, les variantes de stockage et téléversez directement vos images.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs mb-6 flex items-center gap-2">
            <Icons.AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Section 1 : Informations Générales */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Icons.Smartphone size={16} className="text-[#0062BD]" />
              <span>1. Informations Générales</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Nom du Produit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: iPhone 15 Pro Max 256Go Titane Naturel"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#0062BD] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Marque *</label>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white font-bold text-gray-900 focus:outline-none"
                >
                  <option value="IPHONE">Apple iPhone</option>
                  <option value="SAMSUNG">Samsung Galaxy</option>
                  <option value="ACCESSOIRE">Accessoires & Chargeurs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catégorie *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">État de l'Appareil (Obligatoire) *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white font-bold text-gray-900 focus:outline-none"
                >
                  <option value="NEUF_SCELLE">Neuf sous scellé d'origine (Garantie 12 Mois)</option>
                  <option value="NEUF_NON_SCELLE">Neuf non scellé / Reconditionné A+</option>
                  <option value="OCCASION">Occasion certifiée TechPhone229</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Garantie constructeur (en mois)</label>
                <input
                  type="number"
                  min="0"
                  max="36"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Slug URL (Optionnel - auto-généré)</label>
                <input
                  type="text"
                  placeholder="iphone-15-pro-max-titane"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none text-gray-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Description détaillée *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Décrivez précisément l'appareil, son authenticité, ses points forts et accessoires inclus dans le coffret..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Tarification & Troc */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Icons.CreditCard size={16} className="text-[#0062BD]" />
              <span>2. Tarification en FCFA & Éligibilité au Troc</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Prix de Base (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="Ex: 450000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-gray-900 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Prix Promotionnel Barré (FCFA - Optionnel)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 429000"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Options Troc & Mise en avant */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tradeEligible}
                  onChange={(e) => setTradeEligible(e.target.checked)}
                  className="w-5 h-5 text-[#FED700] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-900 text-xs block">
                    🔄 Éligible au Troc (Reprise d'ancien smartphone possible)
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Permet aux clients de soumettre leur ancien appareil en paiement partiel ou total. L'achat direct reste actif.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 text-[#FED700] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-900 text-xs block">
                    ⭐ Mettre en avant sur la page d'accueil (Top Deals)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-[#FED700] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-900 text-xs block">
                    ✅ Produit Actif (Visible immédiatement dans la boutique)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3 : Variantes de Stockage, Couleur & Stock */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <Icons.Layers size={16} className="text-[#0062BD]" />
                <span>3. Variantes de Stockage, Couleur & Stock ({variants.length})</span>
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Icons.Plus size={14} />
                <span>Ajouter une variante</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Capacité</label>
                    <input
                      type="text"
                      placeholder="Ex: 256 Go"
                      value={variant.storage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, storage: val } : v)));
                      }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Couleur</label>
                    <input
                      type="text"
                      placeholder="Ex: Titane Naturel"
                      value={variant.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, color: val } : v)));
                      }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Code Hex Couleur</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={variant.colorCode || '#000000'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, colorCode: val } : v)));
                        }}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        placeholder="#9C968E"
                        value={variant.colorCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, colorCode: val } : v)));
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-gray-600">SKU Unique</label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoSku = generateSku(brand, name, variant.storage, variant.color);
                          setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, sku: autoSku } : v)));
                        }}
                        className="text-[10px] text-[#0062BD] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Générer automatiquement"
                      >
                        ⚡ Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: TP229-APL-PROD..."
                      value={variant.sku}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, sku: val } : v)));
                      }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Stock Disponible *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, stock: val } : v)));
                      }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Icons.Trash size={14} />
                      <span>Retirer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 : Galerie d'Images & Téléversement Direct */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Icons.Image size={16} className="text-[#0062BD]" />
                  <span>4. Images du Produit ({images.length})</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Sélectionnez directement vos photos depuis votre téléphone ou ordinateur (JPG, PNG, WEBP).
                </p>
              </div>
              <button
                type="button"
                onClick={addImageManualUrl}
                className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                + Ajouter via URL externe
              </button>
            </div>

            {/* Zone de Drag & Drop / Téléversement de fichiers */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileUpload}
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                uploading
                  ? 'border-[#0062BD] bg-blue-50/50'
                  : 'border-gray-300 hover:border-[#0062BD] hover:bg-blue-50/20'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0062BD] flex items-center justify-center">
                <Icons.Upload size={28} className={uploading ? 'animate-bounce' : ''} />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-gray-900">
                  {uploading ? 'Téléversement des photos en cours...' : 'Cliquez pour choisir des photos depuis votre appareil'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Glissez-déposez ou sélectionnez plusieurs images à la fois (JPG, PNG, WEBP jusqu'à 10 Mo)
                </p>
              </div>
              <button
                type="button"
                disabled={uploading}
                className="bg-[#0062BD] hover:bg-[#00519E] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Icons.Plus size={14} />
                <span>Sélectionner des photos</span>
              </button>
            </div>

            {/* Liste des images sélectionnées */}
            {images.length > 0 && (
              <div className="space-y-3 pt-2">
                {images.map((img, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-20 h-20 bg-white border border-gray-300 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {img.url ? (
                        <img src={img.url} alt={img.altText || 'Aperçu'} className="w-full h-full object-contain" />
                      ) : (
                        <Icons.Image size={24} className="text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <label className="block font-medium text-gray-600 mb-1">Chemin / URL de l'image *</label>
                        <input
                          type="text"
                          required
                          value={img.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImages((prev) => prev.map((im, i) => (i === index ? { ...im, url: val } : im)));
                          }}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-600 mb-1">Texte Alternatif SEO (Alt) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: iPhone 15 Pro Max coloris titane naturel vue de face"
                          value={img.altText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImages((prev) => prev.map((im, i) => (i === index ? { ...im, altText: val } : im)));
                          }}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer self-center"
                      title="Supprimer cette image"
                    >
                      <Icons.Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5 : Fiche Technique & Spécifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Icons.ShieldCheck size={16} className="text-[#0062BD]" />
                  <span>5. Spécifications & Caractéristiques Techniques</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Affichées dans l'onglet Caractéristiques de la fiche produit.
                </p>
              </div>
              <button
                type="button"
                onClick={addSpec}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Icons.Plus size={14} />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    placeholder="Caractéristique (ex: Écran)"
                    value={spec.key}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, key: val } : s)));
                    }}
                    className="w-1/2 p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Valeur (ex: 6.7 pouces OLED)"
                    value={spec.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, value: val } : s)));
                    }}
                    className="w-1/2 p-2 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Icons.X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de Validation */}
          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/admin/produits"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 text-center hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full sm:w-auto bg-[#FED700] hover:bg-[#E8C400] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Enregistrement en cours...' : 'Enregistrer le Produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
