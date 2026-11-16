'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { getCategoriesAction, getAdminProductByIdAction, updateProductAction } from '@/actions/admin-products';
import { uploadProductImageAction } from '@/actions/upload';
import { DialogModal } from '@/components/ui/DialogModal';

interface VariantImage {
  url: string;
  altText: string;
  position?: number;
}

interface VariantForm {
  color: string;
  colorCode: string;
  storage?: string;
  priceOverride: string;
  promoPrice: string;
  stock: number;
  sku: string;
  images: VariantImage[];
}

interface ImageForm {
  url: string;
  altText: string;
  color?: string;
  position: number;
}

interface SpecForm {
  key: string;
  value: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [variantUploadingIdx, setVariantUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog Modal
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    isConfirmOnly?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    isConfirmOnly: true,
  });

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('DealMart');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<'NEUF_SCELLE' | 'NEUF_NON_SCELLE' | 'OCCASION'>('NEUF_SCELLE');
  const [basePrice, setBasePrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [images, setImages] = useState<ImageForm[]>([]);
  const [specs, setSpecs] = useState<SpecForm[]>([]);

  const generateSku = (brandName: string, prodName: string, colorVal?: string) => {
    const brandCode = (brandName || 'DM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'DM';
    const nameClean = (prodName || 'PROD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'PROD';
    const colorClean = colorVal ? colorVal.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() : 'DEF';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DM-${brandCode}-${nameClean}-${colorClean}-${rand}`;
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [catRes, prodRes] = await Promise.all([
        getCategoriesAction(),
        getAdminProductByIdAction(id),
      ]);

      if (catRes.success) {
        setCategories(catRes.categories);
      }

      if (prodRes.success && prodRes.product) {
        const p = prodRes.product;
        setName(p.name);
        setSlug(p.slug);
        setBrand(p.brand as any);
        setCategoryId(p.categoryId);
        setCondition(p.condition as any);
        setBasePrice(p.basePrice.toString());
        setPromoPrice(p.promoPrice ? p.promoPrice.toString() : '');
        setWarrantyMonths(p.warrantyMonths);
        setIsFeatured(p.isFeatured);
        setIsActive(p.isActive);
        setDescription(p.description);

        if (p.variants && p.variants.length > 0) {
          setVariants(
            p.variants.map((v: any) => {
              let variantImages: VariantImage[] = [];
              if (v.imagesJson) {
                try {
                  variantImages = JSON.parse(v.imagesJson);
                } catch (_) {}
              } else if (p.images) {
                variantImages = p.images
                  .filter((im: any) => im.color === v.color)
                  .map((im: any) => ({ url: im.url, altText: im.altText, position: im.position }));
              }
              return {
                storage: v.storage || '',
                color: v.color || '',
                colorCode: v.colorCode || '#1A1E24',
                priceOverride: v.priceOverride ? v.priceOverride.toString() : '',
                promoPrice: v.promoPrice ? v.promoPrice.toString() : '',
                stock: v.stock,
                sku: v.sku,
                images: variantImages,
              };
            })
          );
        } else {
          setVariants([{ storage: '', color: 'Space Black', colorCode: '#1A1E24', priceOverride: '', promoPrice: '', stock: 1, sku: generateSku(p.brand, p.name), images: [] }]);
        }

        if (p.images && p.images.length > 0) {
          setImages(
            p.images.map((im: any) => ({
              url: im.url,
              altText: im.altText,
              color: im.color || undefined,
              position: im.position,
            }))
          );
        }

        if (p.specsJson) {
          try {
            const parsed = JSON.parse(p.specsJson);
            setSpecs(Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) })));
          } catch (_) {
            setSpecs([]);
          }
        }
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  const addVariant = () => {
    const autoSku = generateSku(brand, name, 'Natural Titanium');
    setVariants((prev) => [
      ...prev,
      {
        color: 'Natural Titanium',
        colorCode: '#9C968E',
        storage: '',
        priceOverride: '',
        promoPrice: '',
        stock: 5,
        sku: autoSku,
        images: [],
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      setDialogState({
        isOpen: true,
        title: 'Action impossible',
        message: 'You must maintain at least one color variant for this product.',
        type: 'warning',
        isConfirmOnly: true,
        confirmText: 'Understood',
      });
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setVariantUploadingIdx(index);
    setError(null);

    const uploadedVariantImages: VariantImage[] = [];
    const colorName = variants[index].color || 'Color';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadProductImageAction(formData);
      if (res.success && res.url) {
        uploadedVariantImages.push({
          url: res.url,
          altText: name ? `${name} - ${colorName}` : `Product photo - ${colorName}`,
          position: variants[index].images.length + uploadedVariantImages.length,
        });
      } else {
        setError(res.error || `Upload failed for ${file.name}`);
      }
    }

    if (uploadedVariantImages.length > 0) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === index
            ? { ...v, images: [...v.images, ...uploadedVariantImages] }
            : v
        )
      );

      setImages((prev) => [
        ...prev,
        ...uploadedVariantImages.map((vImg, vPos) => ({
          url: vImg.url,
          altText: vImg.altText,
          color: colorName,
          position: prev.length + vPos,
        })),
      ]);
    }

    setVariantUploadingIdx(null);
    if (variantFileInputRefs.current[index]) {
      variantFileInputRefs.current[index]!.value = '';
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const imgToRemove = variants[variantIndex].images[imageIndex];
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, images: v.images.filter((_, idx) => idx !== imageIndex) }
          : v
      )
    );
    if (imgToRemove) {
      setImages((prev) => prev.filter((im) => im.url !== imgToRemove.url));
    }
  };

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
          altText: name ? `${name} - View ${images.length + uploadedList.length + 1}` : `Product photo - View ${images.length + uploadedList.length + 1}`,
          position: images.length + uploadedList.length,
        });
      } else {
        setError(res.error || `Upload failed for ${file.name}`);
      }
    }

    if (uploadedList.length > 0) {
      setImages((prev) => [...prev, ...uploadedList]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      setError('Please fill out all required fields.');
      return;
    }

    let allImages = [...images];
    if (allImages.length === 0) {
      variants.forEach((v) => {
        v.images.forEach((vImg) => {
          allImages.push({
            url: vImg.url,
            altText: vImg.altText || `${name} - ${v.color}`,
            color: v.color,
            position: allImages.length,
          });
        });
      });
    }

    if (allImages.length === 0) {
      setError('Please add at least one image for this product.');
      return;
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
        sku: v.sku.trim() || generateSku(brand, name, v.color),
        images: v.images,
      })),
      images: allImages.map((img, idx) => ({
        url: img.url,
        altText: img.altText || `${name} - Photo ${idx + 1}`,
        color: img.color || null,
        position: idx,
      })),
    };

    const res = await updateProductAction(id, payload);
    setSubmitting(false);

    if (res.success) {
      router.push('/admin/produits');
      router.refresh();
    } else {
      if (res.error === 'UNAUTHORIZED') {
        router.push(`/admin/login?redirect=/admin/produits/${id}/modifier`);
        return;
      }
      setError(res.error || 'Failed to update product.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-bold">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <DialogModal
        {...dialogState}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/admin/produits"
          className="text-xs font-bold text-gray-500 hover:text-[#0054A4] flex items-center gap-1.5"
        >
          <Icons.ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full">
          Edit Product
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
        <h1 className="font-heading font-black text-2xl text-gray-900 mb-1">
          Edit: {name}
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Update specifications, retail pricing, inventory stock, and color photo galleries.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs mb-6 flex items-center gap-2">
            <Icons.AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Section 1 : General Information */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Icons.Smartphone size={16} className="text-[#0054A4]" />
              <span>1. Model & Core Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Full Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro 128GB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-gray-900 focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Samsung, Sony, Anker, DealMart..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category *</label>
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
                <label className="block font-bold text-gray-700 mb-1">Item Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white font-bold text-gray-900 focus:outline-none"
                >
                  <option value="NEUF_SCELLE">Brand New Factory Sealed (12 Month Warranty)</option>
                  <option value="NEUF_NON_SCELLE">Certified Refurbished (Grade A+)</option>
                  <option value="OCCASION">Certified Pre-Owned & Guaranteed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Warranty Period (in months)</label>
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
                <label className="block font-bold text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none text-gray-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Pricing */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Icons.CreditCard size={16} className="text-[#0054A4]" />
              <span>2. Pricing in SI$ (Solomon Islands Dollars)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Regular Retail Price (SI$) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-gray-900 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Discounted Promo Price (SI$ - Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 text-[#F1B20B] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-900 text-xs block">
                    Feature on Homepage (Top Picks / Best Sellers)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-[#F1B20B] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-gray-900 text-xs block">
                    Active Product (Visible to storefront customers)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3 : Color Variants & Photos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Icons.Layers size={16} className="text-[#0054A4]" />
                  <span>3. Color Variants & Linked Photos ({variants.length})</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Manage color options, inventory stock, and color-matched photos.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="bg-[#0054A4] hover:bg-[#00519E] text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Icons.Plus size={14} />
                <span>Add Color</span>
              </button>
            </div>

            <div className="space-y-5">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3xl space-y-4 hover:border-gray-300 transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label className="block font-bold text-gray-700 mb-1">
                        Color Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Space Black, Titanium Gray..."
                        value={variant.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) =>
                            prev.map((v, i) => (i === index ? { ...v, color: val } : v))
                          );
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block font-bold text-gray-700 mb-1">Color Swatch</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={variant.colorCode || '#1A1E24'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) =>
                              prev.map((v, i) => (i === index ? { ...v, colorCode: val } : v))
                            );
                          }}
                          className="w-9 h-9 rounded-xl border border-gray-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          placeholder="#1A1E24"
                          value={variant.colorCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) =>
                              prev.map((v, i) => (i === index ? { ...v, colorCode: val } : v))
                            );
                          }}
                          className="w-full p-2 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">Stock *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={variant.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setVariants((prev) =>
                            prev.map((v, i) => (i === index ? { ...v, stock: val } : v))
                          );
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-medium text-gray-600 mb-1 text-[10px]">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) =>
                            prev.map((v, i) => (i === index ? { ...v, sku: val } : v))
                          );
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-[10px] font-mono text-gray-500"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold flex items-center justify-center cursor-pointer"
                        title="Delete color"
                      >
                        <Icons.Trash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Color-specific Photos */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-[11px] flex items-center gap-1.5">
                        <Icons.Image size={14} className="text-[#0054A4]" />
                        <span>Photos for <strong>"{variant.color || 'Untitled'}"</strong> ({variant.images.length})</span>
                      </span>

                      <div>
                        <input
                          type="file"
                          ref={(el) => {
                            variantFileInputRefs.current[index] = el;
                          }}
                          onChange={(e) => handleVariantImageUpload(index, e)}
                          multiple
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={variantUploadingIdx === index}
                          onClick={() => variantFileInputRefs.current[index]?.click()}
                          className="bg-blue-50 hover:bg-blue-100 text-[#0054A4] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Icons.Upload size={13} className={variantUploadingIdx === index ? 'animate-bounce' : ''} />
                          <span>{variantUploadingIdx === index ? 'Uploading...' : '+ Add Photos'}</span>
                        </button>
                      </div>
                    </div>

                    {variant.images.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {variant.images.map((vImg, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative group w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 p-1 flex items-center justify-center overflow-hidden"
                          >
                            <img
                              src={vImg.url}
                              alt={vImg.altText || 'Preview'}
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(index, imgIdx)}
                              className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-90 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-xs"
                              title="Remove photo"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">
                        No photos added for this color yet. Click "+ Add Photos" above.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 : Complete Global Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Icons.Image size={16} className="text-[#0054A4]" />
                  <span>4. Global Product Gallery ({images.length})</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Photos uploaded to colors appear here automatically. You can also upload general product or packaging shots.
                </p>
              </div>
            </div>

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
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                uploading
                  ? 'border-[#0054A4] bg-blue-50/50'
                  : 'border-gray-300 hover:border-[#0054A4] hover:bg-blue-50/20'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0054A4] flex items-center justify-center">
                <Icons.Upload size={20} className={uploading ? 'animate-bounce' : ''} />
              </div>
              <p className="font-heading font-bold text-xs text-gray-900">
                {uploading ? 'Uploading...' : 'Upload general product photos (JPG, PNG, WEBP)'}
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group bg-gray-50 border border-gray-200 rounded-2xl p-2 flex flex-col items-center justify-center"
                  >
                    <div className="w-full aspect-square bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden mb-1.5">
                      <img src={img.url} alt={img.altText} className="w-full h-full object-contain" />
                    </div>
                    {img.color && (
                      <span className="text-[10px] font-bold text-gray-600 truncate max-w-full">
                        {img.color}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Remove from gallery"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5 : Technical Specifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <Icons.Sliders size={16} className="text-[#0054A4]" />
                <span>5. Technical Specifications ({specs.length})</span>
              </h2>
              <button
                type="button"
                onClick={addSpec}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Icons.Plus size={14} />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Feature"
                    value={spec.key}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, key: val } : s)));
                    }}
                    className="w-1/3 p-2.5 border border-gray-300 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, value: val } : s)));
                    }}
                    className="w-2/3 p-2.5 border border-gray-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
                  >
                    <Icons.Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link
              href="/admin/produits"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#1D2129] border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Icons.Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}