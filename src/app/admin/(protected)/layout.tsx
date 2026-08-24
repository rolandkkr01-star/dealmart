import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1D2129] flex">
      {/* Sidebar de navigation Desktop & Mobile Drawer */}
      <AdminSidebar />

      {/* Zone de contenu principale */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
