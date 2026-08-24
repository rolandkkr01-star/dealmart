'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export interface FeaturedReviewItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  date?: string;
  isFeaturedHome?: boolean;
}

interface TestimonialsProps {
  reviews?: FeaturedReviewItem[];
}

const DEFAULT_REVIEWS: FeaturedReviewItem[] = [
  {
    id: 'f-1',
    name: 'Dr. Aurel Houessou',
    city: 'Cotonou, Haie Vive',
    comment: 'J\'ai acheté mon iPhone 15 Pro Max 256Go. Boîte scellée d\'origine vérifiée sur le site d\'Apple. Livraison reçue en moins de 2h à mon cabinet. Service impeccable !',
    rating: 5,
    productName: 'iPhone 15 Pro Max',
  },
  {
    id: 'f-2',
    name: 'Sandrine Agbodjan',
    city: 'Abomey-Calavi',
    comment: 'Le service de troc est une merveille. J\'ai fait reprendre mon ancien S21 Ultra pour prendre le S24 Ultra avec un petit complément en MoMo. Transaction très transparente.',
    rating: 5,
    productName: 'Samsung Galaxy S24 Ultra',
  },
  {
    id: 'f-3',
    name: 'Marius Koudjo',
    city: 'Cotonou, Cadjehoun',
    comment: 'Difficile de trouver des chargeurs 20W Apple réellement authentiques à Cotonou avec toutes les contrefaçons. TechPhone229 est le seul en qui j\'ai totale confiance.',
    rating: 5,
    productName: 'Chargeur Apple 20W Authentique',
  }
];

export const Testimonials: React.FC<TestimonialsProps> = ({ reviews = [] }) => {
  const displayReviews = reviews.length > 0 ? reviews.slice(0, 3) : DEFAULT_REVIEWS;

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-[11px] font-semibold mb-2">
          <Icons.ShieldCheck size={13} className="text-amber-700" />
          <span>Avis Clients Vérifiés & Certifiés</span>
        </div>
        <h2 className="font-heading font-black text-2xl text-[#1D2129] tracking-tight">
          Ce que disent nos clients au Bénin
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
          Retours d'expérience authentiques sur nos smartphones et notre service de livraison express.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayReviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icons.Star
                      key={i}
                      size={14}
                      className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
                    />
                  ))}
                </div>
                {rev.productName && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded truncate max-w-[150px]">
                    {rev.productSlug ? (
                      <Link href={`/produit/${rev.productSlug}`} className="hover:text-[#0062BD]">
                        {rev.productName}
                      </Link>
                    ) : (
                      rev.productName
                    )}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1D2129] text-[#FED700] font-black text-[11px] flex items-center justify-center">
                  {rev.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{rev.name}</p>
                  <p className="text-[10px] text-gray-500">{rev.city}</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Icons.Check size={10} />
                Vérifié
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
