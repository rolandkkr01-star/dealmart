import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InscriptionForm } from '@/components/auth/InscriptionForm';

export const dynamic = 'force-dynamic';

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const redirectTarget = params?.redirect || '/compte';

  if (user) {
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      redirect('/admin');
    }
    redirect(redirectTarget);
  }

  return <InscriptionForm redirectTarget={redirectTarget} />;
}
