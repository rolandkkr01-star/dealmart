import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Icons } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: `Privacy Policy and personal data protection principles for ${siteConfig.name} in Solomon Islands.`,
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0054A4] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Icons.ShieldCheck size={14} className="text-emerald-600" />
          <span>Data Protection & Privacy • Solomon Islands</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Transparency, trust, and security for your personal data on {siteConfig.name}.
        </p>
      </div>

      {/* Structured Content */}
      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.Lock size={18} className="text-[#0054A4]" />
            1. Data Controller
          </h2>
          <p className="mb-2">
            Personal data gathered through this website is processed by <strong>{siteConfig.legalName}</strong> (operator of <strong>{siteConfig.name}</strong>), situated in {siteConfig.city}, Solomon Islands.
          </p>
          <p className="text-xs text-gray-500">
            Privacy Contact: {siteConfig.email}.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.User size={18} className="text-[#0054A4]" />
            2. Data Collected & Processing Purpose
          </h2>
          <p className="mb-3">
            We collect only necessary information required to process your purchases and fulfill delivery:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 mb-3">
            <li><strong>Identity & Contact:</strong> Full name, email address, and phone number (+677 for courier coordination).</li>
            <li><strong>Delivery Destination:</strong> City, province, street or physical landmark within the Solomon Islands.</li>
            <li><strong>Order History:</strong> Past transaction details and electronic purchase invoices.</li>
          </ul>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900">
            <strong>Payment Security:</strong> {siteConfig.name} does not retain credit card details or bank passwords. Online card processing is performed through certified PCI-DSS compliant international gateways.
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.ShieldCheck size={18} className="text-[#0054A4]" />
            3. Security Measures & Encryption
          </h2>
          <p className="mb-2">
            We adhere to rigorous industry security standards:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>Passwords are hashed with cryptographic <strong>Argon2id</strong>.</li>
            <li>All communications between your device and our servers are encrypted via <strong>HTTPS / TLS</strong>.</li>
            <li>User sessions are secured with HTTP-Only cookies protected against XSS and CSRF attacks.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.Sliders size={18} className="text-[#0054A4]" />
            4. Your Rights
          </h2>
          <p className="mb-2">
            You retain full rights to inspect, update, or remove your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 mb-3">
            <li><strong>Access & Modification:</strong> Directly within your {siteConfig.name} customer dashboard.</li>
            <li><strong>Account Deletion:</strong> Upon direct request via email to {siteConfig.email}.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Icons.PhoneCall size={18} className="text-[#0054A4]" />
            5. Contact Us
          </h2>
          <p className="text-xs text-gray-600">
            For questions or requests regarding our privacy policy, reach out to our team at <strong>{siteConfig.phone}</strong> or via email at <strong>{siteConfig.email}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}