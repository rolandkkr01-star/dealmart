'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { getAllReviewsAdminAction, toggleFeatureReviewAction, deleteReviewAction } from '@/actions/reviews';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    const data = await getAllReviewsAdminAction();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleFeature = async (reviewId: string) => {
    setErrorMessage(null);
    setActionLoadingId(reviewId);
    const res = await toggleFeatureReviewAction(reviewId);
    setActionLoadingId(null);

    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isFeaturedHome: res.isFeaturedHome } : r))
      );
    } else {
      setErrorMessage(res.error || 'Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet avis ?')) return;
    setActionLoadingId(reviewId);
    const res = await deleteReviewAction(reviewId);
    setActionLoadingId(null);

    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } else {
      setErrorMessage(res.error || 'Erreur lors de la suppression.');
    }
  };

  const featuredCount = reviews.filter((r) => r.isFeaturedHome).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Modération des Avis Clients & Témoignages
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez les avis déposés sur les fiches produits et choisissez les <strong>3 avis phares</strong> à afficher sur la page d'accueil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadReviews}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Icons.RotateCcw size={14} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Message d'erreur éventuel */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-900 font-bold hover:underline">
            Fermer
          </button>
        </div>
      )}

      {/* Cartes d'indicateurs / Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Icons.Star size={24} className="text-[#FED700] fill-[#FED700]" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Note Moyenne Globale</span>
            <span className="font-price font-black text-2xl text-gray-900">{avgRating} / 5</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0062BD] flex items-center justify-center font-bold">
            <Icons.MessageSquare size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Total des Avis Enregistrés</span>
            <span className="font-price font-black text-2xl text-gray-900">{reviews.length} avis</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Icons.Sparkles size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Épinglés sur l'accueil</span>
            <span className="font-price font-black text-2xl text-emerald-700">
              {featuredCount} / 3 sélectionnés
            </span>
          </div>
        </div>
      </div>

      {/* Tableau / Liste des avis */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-heading font-black text-sm text-gray-900 uppercase tracking-wider">
            Tous les avis clients
          </h2>
          <span className="text-[11px] text-gray-500">
            {featuredCount === 3 ? (
              <strong className="text-emerald-600 font-bold">✓ 3 avis sélectionnés pour la page d'accueil</strong>
            ) : (
              <span>Sélectionnez encore {3 - featuredCount} avis pour la page d'accueil</span>
            )}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#FED700] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Chargement des avis clients...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Icons.MessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-1">Aucun avis pour le moment</h3>
            <p className="text-xs text-gray-500">Les avis soumis par les clients sur les fiches produits s'afficheront ici.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-xs text-gray-900">{rev.authorName}</span>
                    <span className="text-[11px] text-gray-400">• {rev.city || 'Cotonou, Bénin'}</span>
                    <div className="flex gap-0.5 ml-1">
                      {[...Array(5)].map((_, i) => (
                        <Icons.Star
                          key={i}
                          size={13}
                          className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
                        />
                      ))}
                    </div>
                    {rev.isFeaturedHome && (
                      <span className="bg-[#FED700] text-[#1D2129] font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Icons.Sparkles size={10} />
                        Épinglé Accueil
                      </span>
                    )}
                  </div>

                  {/* Produit concerné */}
                  {rev.product && (
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <span>Produit :</span>
                      <Link
                        href={`/produit/${rev.product.slug}`}
                        className="font-bold text-[#0062BD] hover:underline"
                        target="_blank"
                      >
                        {rev.product.name}
                      </Link>
                    </div>
                  )}

                  {/* Commentaire */}
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <span className="text-[10px] text-gray-400 block">
                    Déposé le {new Date(rev.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Actions Modérateur */}
                <div className="flex items-center gap-2 self-start lg:self-center flex-shrink-0">
                  <button
                    onClick={() => handleToggleFeature(rev.id)}
                    disabled={actionLoadingId === rev.id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      rev.isFeaturedHome
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-[#1D2129] hover:bg-[#0062BD] text-[#FED700] hover:text-white'
                    }`}
                  >
                    <Icons.Star size={13} className={rev.isFeaturedHome ? 'text-amber-700 fill-amber-700' : ''} />
                    <span>{rev.isFeaturedHome ? 'Retirer de l\'accueil' : 'Épingler sur l\'accueil'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={actionLoadingId === rev.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer cet avis"
                  >
                    <Icons.Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
