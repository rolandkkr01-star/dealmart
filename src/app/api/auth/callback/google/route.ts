import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const isDemo = searchParams.get('demo') === 'true';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  let redirectTarget = '/compte';
  if (stateRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(stateRaw));
      if (parsed.redirect) redirectTarget = parsed.redirect;
    } catch (_) {}
  } else if (searchParams.get('redirect')) {
    redirectTarget = searchParams.get('redirect') || '/compte';
  }

  // 1. Mode Réel : Échange du code contre les informations de profil Google
  if (code) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${baseUrl}/api/auth/callback/google`;

      // Échange du code d'autorisation contre le token Google
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId || '',
          client_secret: clientSecret || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Erreur échange token Google:', await tokenResponse.text());
        return NextResponse.redirect(`${baseUrl}/connexion?error=oauth_token_failed`);
      }

      const tokenData = await tokenResponse.json();

      // Récupération des informations utilisateur depuis Google UserInfo
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userinfoResponse.ok) {
        return NextResponse.redirect(`${baseUrl}/connexion?error=oauth_userinfo_failed`);
      }

      const googleUser = await userinfoResponse.json();
      const email = googleUser.email?.toLowerCase().trim();

      if (!email) {
        return NextResponse.redirect(`${baseUrl}/connexion?error=no_email_provided`);
      }

      // Recherche ou création de l'utilisateur en base de données
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const randomPass = await hashPassword(Math.random().toString(36) + Date.now().toString());
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: randomPass,
            firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'Client',
            lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || 'Google',
            role: 'CLIENT',
            emailVerified: Boolean(googleUser.email_verified),
          },
        });
      }

      // Création de la session sécurisée
      await createSession(user.id);

      return NextResponse.redirect(`${baseUrl}${redirectTarget}`);
    } catch (error) {
      console.error('Erreur OAuth Google Callback:', error);
      return NextResponse.redirect(`${baseUrl}/connexion?error=oauth_internal_error`);
    }
  }

  // 2. Mode Démonstration (uniquement autorisé en environnement de développement local)
  if (isDemo) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Tentative d\'accès au mode démo OAuth bloquée en production.');
      return NextResponse.redirect(`${baseUrl}/connexion?error=demo_disabled_in_production`);
    }

    try {
      const demoEmail = 'client.demo@techphone229.bj';
      let user = await prisma.user.findUnique({
        where: { email: demoEmail },
      });

      if (!user) {
        const randomPass = await hashPassword('DemoClientLocalTestPass2026!');
        user = await prisma.user.create({
          data: {
            email: demoEmail,
            passwordHash: randomPass,
            firstName: 'Client',
            lastName: 'Démo Test',
            role: 'CLIENT',
            emailVerified: true,
          },
        });
      }

      await createSession(user.id);
      return NextResponse.redirect(`${baseUrl}${redirectTarget}`);
    } catch (error) {
      console.error('Erreur Démo Google Auth:', error);
      return NextResponse.redirect(`${baseUrl}/connexion?error=demo_failed`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/connexion?error=invalid_oauth_request`);
}
