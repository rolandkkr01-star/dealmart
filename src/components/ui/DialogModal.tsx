'use client';

import React, { useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

export interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string | React.ReactNode;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isConfirmOnly?: boolean;
  loading?: boolean;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isConfirmOnly = false,
  loading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: 'bg-red-50 text-[#DC3545]',
      border: 'border-red-200',
      btn: 'bg-[#DC3545] hover:bg-red-700 text-white',
      icon: <Icons.Trash2 size={24} />,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-200',
      btn: 'bg-[#F1B20B] hover:bg-[#D99F07] text-[#1D2129]',
      icon: <Icons.AlertCircle size={24} />,
    },
    info: {
      bg: 'bg-blue-50 text-[#0054A4]',
      border: 'border-blue-200',
      btn: 'bg-[#0054A4] hover:bg-blue-700 text-white',
      icon: <Icons.ShieldCheck size={24} />,
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-200',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: <Icons.Check size={24} />,
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <Icons.X size={16} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconConfig.bg} border ${iconConfig.border}`}>
            {iconConfig.icon}
          </div>
          <div className="pr-6">
            <h3 className="font-heading font-black text-base text-gray-900 leading-snug">
              {title}
            </h3>
            <div className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-gray-100">
          {!isConfirmOnly && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                onClose();
              }
            }}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-black transition-all shadow-xs cursor-pointer flex items-center gap-2 ${iconConfig.btn} disabled:opacity-50`}
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
