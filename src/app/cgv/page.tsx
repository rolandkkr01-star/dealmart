import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Terms & Conditions of Service - ${siteConfig.name}`,
  description: `Terms and Conditions of Sale and Use for ${siteConfig.name}, governing commercial transactions in the Solomon Islands.`,
};

export default function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0054A4] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Terms & Conditions of Service</span>
      </nav>

      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0054A4] px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Icons.ShieldCheck size={14} />
          <span>Commercial Framework • Solomon Islands</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Applicable to all orders and services on {siteConfig.name}.
        </p>
      </div>

      {/* Structured Content */}
      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Article 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              1
            </span>
            Purpose and Operator Identity
          </h2>
          <p className="mb-2">
            These Terms & Conditions govern all sales and transactions executed through the online marketplace <strong>{siteConfig.name}</strong>, operated by <strong>{siteConfig.legalName}</strong> located in {siteConfig.city}, Solomon Islands.
          </p>
          <p>
            <strong>Official Contact:</strong> {siteConfig.email} • Phone: {siteConfig.phone} • Address: {siteConfig.address}.
          </p>
        </section>

        {/* Article 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              2
            </span>
            Product Catalog & Quality Guarantee
          </h2>
          <p className="mb-3">
            {siteConfig.name} is a premier department marketplace offering genuine products across Electronics & Tech, Beauty & Skincare, Fashion & Apparel, and Home & Living. Every item undergoes rigorous inspection:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 mb-3">
            <li><strong>Brand New Factory Sealed:</strong> Original factory-sealed packaging with official manufacturer warranty.</li>
            <li><strong>Certified Refurbished (Grade A+):</strong> Pristine cosmetic condition, certified functional, professionally tested with warranty.</li>
            <li><strong>Certified Pre-Owned:</strong> Thoroughly inspected across our key hardware and performance check points.</li>
          </ul>
          <p className="text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
            <strong>Authenticity Guarantee:</strong> Any defective or non-compliant product delivered will be promptly replaced or fully refunded.
          </p>
        </section>

        {/* Article 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              3
            </span>
            Currency & Payment Terms
          </h2>
          <p className="mb-2">
            All prices are stated in <strong>Solomon Islands Dollars (SI$ / SBD)</strong> inclusive of applicable local taxes.
          </p>
          <p className="mb-2">
            Accepted payment methods include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li><strong>Cash on Delivery (COD):</strong> Pay cash in hand directly to the courier upon physical package delivery in Honiara and surrounding areas.</li>
            <li><strong>Direct Bank Transfer:</strong> Bank transfer to local commercial accounts (Bank South Pacific - BSP, ANZ) with payment reference confirmation.</li>
            <li><strong>Credit / Debit Card (Visa / Mastercard):</strong> Secure online checkout.</li>
          </ul>
        </section>

        {/* Article 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              4
            </span>
            Shipping & Nationwide Delivery
          </h2>
          <p className="mb-2">
            Deliveries operate across the entire Solomon Islands archipelago:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li><strong>Honiara & Guadalcanal:</strong> Standard delivery within 24 to 48 business hours (Free delivery on orders over SI$ 500).</li>
            <li><strong>Provinces (Western, Malaita, Isabel, etc.):</strong> Inter-island sea freight or air cargo through scheduled domestic services (Gizo, Noro, Auki, etc.).</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F1B20B] text-[#1D2129] text-xs font-black flex items-center justify-center">
              5
            </span>
            Applicable Law & Dispute Resolution
          </h2>
          <p className="mb-2">
            These terms and conditions are governed by and construed under the <strong>laws of Solomon Islands</strong>.
          </p>
          <p className="text-xs text-gray-600">
            In the event of any inquiry or complaint, customers are invited to first contact our dedicated customer care team at {siteConfig.phone} or via email at {siteConfig.email}. If an amicable resolution cannot be reached, the competent courts of Honiara shall hold exclusive jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
}