'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import { submitReviewAction, getProductReviewsAction } from '@/actions/reviews';

export interface ProductReviewItem {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialRating?: number;
  initialReviewCount?: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  initialRating = 5.0,
  initialReviewCount = 0
}) => {
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      if (!productId) return;
      const dbReviews = await getProductReviewsAction(productId);
      if (dbReviews && dbReviews.length > 0) {
        setReviews(
          dbReviews.map((r: any) => ({
            id: r.id,
            authorName: r.authorName,
            city: r.city || 'Cotonou, Bénin',
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            verified: true,
          }))
        );
      }
    }
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await submitReviewAction({
      productId,
      authorName: authorName.trim(),
      city: city.trim() || 'Cotonou, Bénin',
      rating: newRating,
      comment: comment.trim(),
    });

    setIsSubmitting(false);

    if (res.success && res.review) {
      const newReview: ProductReviewItem = {
        id: res.review.id,
        authorName: res.review.authorName,
        city: res.review.city || 'Cotonou, Bénin',
        rating: res.review.rating,
        comment: res.review.comment,
        date: 'À l\'instant',
        verified: true,
      };

      setReviews([newReview, ...reviews]);
      setAuthorName('');
      setCity('');
      setComment('');
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsFormOpen(false);
      }, 2000);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : initialRating.toFixed(1);

  return (
    <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
      {/* En-tête des Avis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
        <div>
          <h2 className="font-heading font-black text-xl text-gray-900 tracking-tight">
            Avis & Évaluations Clients
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Retours d'expérience vérifiés pour <strong className="text-gray-900">{productName}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129] font-heading font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer inline-flex items-center gap-1.5"
        >
          {isFormOpen ? (
            'Fermer le formulaire'
          ) : (
            <>
              <Icons.Star size={14} fill="#1D2129" />
              <span>Donner votre avis</span>
            </>
          )}
        </button>
      </div>

      {/* Formulaire d'avis dépliable */}
      {isFormOpen && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 mb-8 animate-in fade-in duration-200">
          {submittedSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs text-emerald-800 font-bold">
              Merci ! Votre avis a été enregistré et publié avec succès.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Laisser une note et un commentaire
              </h3>

              {/* Sélection des étoiles */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Votre Note Globale *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Icons.Star
                        size={22}
                        className={`${
                          (hoverRating || newRating) >= star
                            ? 'text-[#F1B20B] fill-[#F1B20B]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-gray-900 text-xs">
                    {newRating} / 5 étoiles
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Votre Nom complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom complet (ex: Jean H.)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Votre Ville / Quartier</label>
                  <input
                    type="text"
                    placeholder="Votre ville & quartier (ex: Cotonou, Haie Vive)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Votre Avis détaillé *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Partagez votre expérience avec cet appareil (authenticité, performances, batterie, livraison)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#0054A4] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#1D2129] hover:bg-[#2C3039] text-[#F1B20B] font-heading font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Publier mon avis
              </button>
            </form>
          )}
        </div>
      )}

      {/* Résumé des notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
        <div className="text-center md:border-r md:border-gray-200 md:pr-6">
          <div className="font-price font-black text-4xl text-[#1D2129]">
            {averageRating}
          </div>
          <div className="flex justify-center my-1.5 gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icons.Star
                key={star}
                size={16}
                className={star <= Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
              />
            ))}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Basé sur {reviews.length} avis clients
          </p>
        </div>

        {/* Barres de répartition */}
        <div className="md:col-span-2 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-gray-600 font-semibold text-[11px] flex items-center gap-1">
                  {stars} <Icons.Star size={11} className="text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#F1B20B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-[11px] text-gray-500 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des avis individuels */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F1B20B] text-[#1D2129] font-black text-xs flex items-center justify-center">
                  {rev.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <span>{rev.authorName}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                        <Icons.ShieldCheck size={10} />
                        Achat Vérifié
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-gray-400">{rev.city}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex justify-end gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icons.Star
                      key={i}
                      size={12}
                      className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">{rev.date}</span>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed pl-10">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
