'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 12,
  onItemsPerPageChange,
  pageSizeOptions = [12, 24, 48],
  className = '',
  itemLabel = 'éléments',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  // Calcul de la plage d'éléments affichés
  const startItem = totalItems ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  // Calcul des numéros de pages avec ellipses intelligentes
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}
      aria-label="Navigation par pagination"
    >
      {/* 1. Résumé textuel du nombre d'éléments & Sélecteur par page */}
      <div className="flex items-center gap-3 text-xs text-gray-500 order-2 sm:order-1">
        {totalItems !== undefined && (
          <span>
            Affichage de <strong className="text-gray-900 font-semibold">{startItem}</strong> à{' '}
            <strong className="text-gray-900 font-semibold">{endItem}</strong> sur{' '}
            <strong className="text-gray-900 font-semibold">{totalItems}</strong> {itemLabel}
          </span>
        )}

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200">
            <span className="text-[11px] text-gray-500">Par page :</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0054A4] cursor-pointer"
              aria-label="Nombre d'éléments par page"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Boutons de navigation de pages */}
      <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
        {/* Précédent */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
            currentPage === 1
              ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer shadow-2xs active:scale-95'
          }`}
          aria-label="Page précédente"
        >
          <Icons.ChevronLeft size={14} />
          <span className="hidden xs:inline">Précédent</span>
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNumber = p as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={`page-${pageNumber}`}
                onClick={() => onPageChange(pageNumber)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-8 h-8 rounded-xl text-xs font-heading font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F1B20B] text-[#1D2129] shadow-xs scale-105 border border-[#D99F07]'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Suivant */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
            currentPage === totalPages || totalPages === 0
              ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer shadow-2xs active:scale-95'
          }`}
          aria-label="Page suivante"
        >
          <span className="hidden xs:inline">Suivant</span>
          <Icons.ChevronRight size={14} />
        </button>
      </nav>
    </div>
  );
};
