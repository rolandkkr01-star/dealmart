import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9]">
      <AdminHeader />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-[#1E293B] border-t border-gray-800 text-gray-400 text-center py-4 text-xs">
        TechPhone229 • Console d'Administration Interne
      </footer>
    </div>
  );
}
