import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site-config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTarget = searchParams.get('redirect') || '/compte';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // Si les clés Google OAuth sont configurées dans .env
  if (clientId && clientId !== 'your_google_client_id_here') {
    const state = encodeURIComponent(JSON.stringify({ redirect: redirectTarget }));
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('access_type', 'online');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Si les clés ne sont pas encore renseignées dans .env (Mode Démo / Assistant)
  // Redirige vers la page de callback en mode démonstration guidée
  const demoUrl = new URL(`${baseUrl}/api/auth/callback/google`);
  demoUrl.searchParams.set('demo', 'true');
  demoUrl.searchParams.set('redirect', redirectTarget);
  return NextResponse.redirect(demoUrl.toString());
}
