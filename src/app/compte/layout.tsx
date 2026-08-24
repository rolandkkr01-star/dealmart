import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/connexion?redirect=/compte');
  }

  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    redirect('/admin');
  }

  return <>{children}</>;
}
