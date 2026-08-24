import { getCurrentUser } from '@/lib/auth';
import { checkMasterAdminExistsAction } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { MasterAdminSetupForm } from '@/components/admin/MasterAdminSetupForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const hasMasterAdmin = await checkMasterAdminExistsAction();
  const params = await searchParams;
  const redirectTarget = params?.redirect || '/admin';

  // 1. Première utilisation : Aucun Master Admin n'existe encore en base
  if (!hasMasterAdmin) {
    return <MasterAdminSetupForm />;
  }

  // 2. Si le Master Admin existe déjà et qu'un utilisateur admin est déjà connecté, redirection 307 immédiate
  const user = await getCurrentUser();
  if (user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
    redirect(redirectTarget);
  }

  // 3. Sinon, affichage du formulaire de connexion admin classique
  return <AdminLoginForm redirectTarget={redirectTarget} />;
}
