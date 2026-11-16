'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { DialogModal } from '@/components/ui/DialogModal';
import { Pagination } from '@/components/ui/Pagination';
import { getAllReviewsAdminAction, toggleFeatureReviewAction, deleteReviewAction } from '@/actions/reviews';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtres & Recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [featuredFilter, setFeaturedFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    userName: string;
  }>({
    isOpen: false,
    reviewId: null,
    userName: '',
  });

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
    setSuccessMessage(null);
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

  const handleDelete = (reviewId: string, userName: string) => {
    setDeleteConfirmState({
      isOpen: true,
      reviewId,
      userName,
    });
  };

  const confirmDeleteReview = async () => {
    if (!deleteConfirmState.reviewId) return;
    const reviewId = deleteConfirmState.reviewId;
    setDeleteConfirmState({ isOpen: false, reviewId: null, userName: '' });

    setActionLoadingId(reviewId);
    const res = await deleteReviewAction(reviewId);
    setActionLoadingId(null);

    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setSuccessMessage('Avis supprimé avec succès.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.error || 'Erreur lors de la suppression.');
    }
  };

  const featuredCount = reviews.filter((r) => r.isFeaturedHome).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Filtre note
      if (ratingFilter !== 'ALL') {
        const targetRating = parseInt(ratingFilter, 10);
        if (rev.rating !== targetRating) return false;
      }

      // Filtre épinglé
      if (featuredFilter === 'FEATURED' && !rev.isFeaturedHome) return false;
      if (featuredFilter === 'NOT_FEATURED' && rev.isFeaturedHome) return false;

      // Recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAuthor = rev.authorName?.toLowerCase().includes(q);
        const matchCity = rev.city?.toLowerCase().includes(q);
        const matchComment = rev.comment?.toLowerCase().includes(q);
        const matchProduct = rev.product?.name?.toLowerCase().includes(q);
        if (!matchAuthor && !matchCity && !matchComment && !matchProduct) return false;
      }

      return true;
    });
  }, [reviews, ratingFilter, featuredFilter, searchQuery]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DialogModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState({ isOpen: false, reviewId: null, userName: '' })}
        onConfirm={confirmDeleteReview}
        title="Supprimer cet avis ?"
        message={`Êtes-vous certain de vouloir supprimer définitivement l'avis de ${deleteConfirmState.userName} ?`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Conserver"
      />

      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin" className="hover:text-[#0054A4]">Administration</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Modération des Avis</span>
      </nav>

      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-900 font-bold hover:underline cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      {/* Message de succès */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-900 font-bold hover:underline cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      {/* Cartes d'indicateurs / Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Icons.Star size={24} className="text-[#F1B20B] fill-[#F1B20B]" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Note Moyenne Globale</span>
            <span className="font-price font-black text-2xl text-gray-900">{avgRating} / 5</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0054A4] flex items-center justify-center font-bold">
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

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par auteur, ville, commentaire ou produit..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0054A4] focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les notes</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
            <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
            <option value="3">⭐⭐⭐ (3 étoiles)</option>
            <option value="2">⭐⭐ (2 étoiles)</option>
            <option value="1">⭐ (1 étoile)</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les avis</option>
            <option value="FEATURED">Épinglés Accueil uniquement</option>
            <option value="NOT_FEATURED">Non épinglés</option>
          </select>
        </div>
      </div>

      {/* Tableau / Liste des avis */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-heading font-black text-sm text-gray-900 uppercase tracking-wider">
            Avis clients ({filteredReviews.length})
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
            <div className="w-8 h-8 border-3 border-[#F1B20B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Chargement des avis clients...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Icons.MessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-1">Aucun avis pour le moment</h3>
            <p className="text-xs text-gray-500">Les avis soumis par les clients sur les fiches produits s'afficheront ici.</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-gray-500 mb-4">Aucun avis ne correspond à vos critères de recherche.</p>
            <button
              onClick={() => {
                setRatingFilter('ALL');
                setFeaturedFilter('ALL');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="bg-[#F1B20B] text-[#1D2129] font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-gray-100">
              {paginatedReviews.map((rev) => (
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
                        <span className="bg-[#F1B20B] text-[#1D2129] font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
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
                          className="font-bold text-[#0054A4] hover:underline"
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
                          : 'bg-[#1D2129] hover:bg-[#0054A4] text-[#F1B20B] hover:text-white'
                      }`}
                    >
                      <Icons.Star size={13} className={rev.isFeaturedHome ? 'text-amber-700 fill-amber-700' : ''} />
                      <span>{rev.isFeaturedHome ? 'Retirer de l\'accueil' : 'Épingler sur l\'accueil'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(rev.id, rev.authorName || 'ce client')}
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

            {/* Pagination Admin Avis */}
            <div className="border-t border-gray-200 px-4 py-2 bg-gray-50/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                totalItems={filteredReviews.length}
                itemsPerPage={pageSize}
                onItemsPerPageChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 12, 24]}
                itemLabel="avis"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
