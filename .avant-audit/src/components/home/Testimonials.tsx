import React from 'react';
import { Icons } from '@/components/ui/Icons';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Dr. Aurel Houessou',
      city: 'Cotonou, Haie Vive',
      comment: 'J\'ai acheté mon iPhone 15 Pro Max 256Go. Boîte scellée d\'origine vérifiée sur le site d\'Apple. Livraison reçue en moins de 2h à mon cabinet. Service impeccable !',
      rating: 5,
      product: 'iPhone 15 Pro Max'
    },
    {
      name: 'Sandrine Agbodjan',
      city: 'Abomey-Calavi',
      comment: 'Le service de troc est une merveille. J\'ai fait reprendre mon S21 Ultra pour prendre le S24 Ultra avec un petit complément en MoMo. Transaction très transparente.',
      rating: 5,
      product: 'Samsung Galaxy S24 Ultra'
    },
    {
      name: 'Marius Koudjo',
      city: 'Cotonou, Cadjehoun',
      comment: 'Difficile de trouver des chargeurs 20W Apple réellement authentiques à Cotonou avec toutes les contrefaçons. TechPhone229 est le seul en qui j\'ai totale confiance.',
      rating: 5,
      product: 'Chargeur Apple 20W Authentique'
    }
  ];

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-[#0062BD] uppercase tracking-widest block mb-1">
          Témoignages Vérifiés
        </span>
        <h2 className="font-heading font-black text-2xl text-[#1D2129] tracking-tight">
          Ce que disent nos clients au Bénin
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div key={idx} className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-[#FED700] mb-3">
                {[...Array(rev.rating)].map((_, i) => (
                  <Icons.Star key={i} size={14} className="text-[#FED700]" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">{rev.name}</p>
                <p className="text-[10px] text-gray-500">{rev.city}</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-[#0062BD] font-bold px-2 py-0.5 rounded">
                Achat vérifié
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
