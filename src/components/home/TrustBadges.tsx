import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { siteConfig } from '@/lib/site-config';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <Icons.ShieldCheck size={32} className="text-[#0054A4]" />,
      title: '100% Genuine Quality',
      description: 'Verified products & authentic warranty',
    },
    {
      icon: <Icons.Wallet size={32} className="text-[#0054A4]" />,
      title: 'Secure & Flexible Payment',
      description: 'Cash on Delivery & BSP Bank Transfer',
    },
    {
      icon: <Icons.Truck size={32} className="text-[#0054A4]" />,
      title: 'Fast Local Delivery',
      description: 'Honiara, Guadalcanal & Provinces',
    },
    {
      icon: <Icons.Headset size={32} className="text-[#0054A4]" />,
      title: 'Dedicated Customer Care',
      description: `${siteConfig.phone} • Local support 6 days a week`,
    },
  ];

  return (
    <section className="bg-white border border-[#E2E5E8] rounded-xl p-5 sm:p-6 mb-10 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 ${index !== 0 ? 'sm:pl-6 pt-4 sm:pt-0' : ''}`}
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              {badge.icon}
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-[#1D2129]">
                {badge.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
