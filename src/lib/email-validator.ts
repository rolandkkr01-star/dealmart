import { resolveMx } from 'node:dns/promises';
import { siteConfig } from '@/lib/site-config';

// 1. Domaines d'exemples, fictifs et génériques souvent saisis par erreur
const RESERVED_AND_GENERIC_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test.com',
  'test.fr',
  'test.org',
  'sample.com',
  'sample.org',
  'fake.com',
  'fake.org',
  'bidon.com',
  'bidon.fr',
  'demo.com',
  'xyz.com',
  'domain.com',
  'domaine.com',
  'monemail.com',
  'email.com',
  'emails.com',
  'mail.com', // Très souvent utilisé comme mot générique fictif
  'mail.fr',
  'courrier.com',
  'courriel.com',
  'inconnu.com',
]);

// 2. Services d'emails temporaires / jetables connus (Burner / Disposable)
const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'courriel.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'getairmail.com',
  'dispostable.com',
  'throwawaymail.com',
  'mohmal.com',
  'crazymailing.com',
  'mytemp.email',
  'generator.email',
  'burnermail.io',
  'fakemailgenerator.com',
  'emailondeck.com',
]);

// 3. Patterns de préfixes fictifs (ex: test, exemple, exemple2, test99, fake_user, bidon123, etc.)
const FICTITIOUS_LOCAL_PART_REGEX = /(^|[._-])(test|exemple|example|fake|bidon|sample|demo|fictif|temporaire|anonymous|azerty|qwerty|asdf|123456)/i;

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valide qu'une adresse email est authentique, valide et capable de recevoir des courriels.
 */
export async function validateEmailDeliverability(email: string): Promise<EmailValidationResult> {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Veuillez renseigner une adresse email.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const atIndex = cleanEmail.lastIndexOf('@');

  // Format de base avec '@'
  if (atIndex === -1 || atIndex === 0 || atIndex === cleanEmail.length - 1) {
    return { isValid: false, error: 'Format d\'adresse email invalide (ex: nom@domaine.com).' };
  }

  const localPart = cleanEmail.substring(0, atIndex);
  const domain = cleanEmail.substring(atIndex + 1);

  // Validation de la structure du domaine (doit contenir au moins un point et une extension valide)
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, error: 'Le domaine de l\'adresse email est invalide (ex: @gmail.com).' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, error: 'L\'extension du domaine (@... .' + tld + ') est invalide.' };
  }

  // Exception pour le domaine officiel configuré de la boutique
  const storeDomain = siteConfig.email?.split('@')[1]?.toLowerCase().trim();
  if (storeDomain && domain === storeDomain) {
    return { isValid: true };
  }

  // 1. Détection de préfixes manifestement fictifs (ex: exemple2, test123, fake_user)
  if (FICTITIOUS_LOCAL_PART_REGEX.test(localPart)) {
    return {
      isValid: false,
      error: 'Veuillez saisir votre véritable adresse email personnelle ou professionnelle.',
    };
  }

  // 2. Vérification des domaines réservés / génériques fictifs
  if (RESERVED_AND_GENERIC_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `Les adresses de test ou génériques (@${domain}) ne sont pas acceptées. Veuillez utiliser votre messagerie réelle (Gmail, Yahoo, etc.).`,
    };
  }

  // 3. Vérification des services d'emails jetables et temporaires
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `Les adresses emails temporaires (@${domain}) ne sont pas autorisées sur la plateforme.`,
    };
  }

  // 4. Vérification DNS MX en temps réel (résolution des serveurs de messagerie)
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
    );

    const mxPromise = resolveMx(domain);
    const records = await Promise.race([mxPromise, timeoutPromise]);

    if (!records || records.length === 0) {
      return {
        isValid: false,
        error: `Le domaine @${domain} n'a aucun serveur de messagerie configuré pour recevoir des emails.`,
      };
    }

    return { isValid: true };
  } catch (error: any) {
    if (error?.message === 'DNS_TIMEOUT') {
      // Si la requête DNS met trop de temps, on ne pénalise pas un utilisateur réel
      return { isValid: true };
    }

    if (error?.code === 'ENOTFOUND' || error?.code === 'ENODATA' || error?.code === 'NXDOMAIN') {
      return {
        isValid: false,
        error: `Le domaine @${domain} est introuvable ou ne peut pas recevoir d'emails.`,
      };
    }

    return { isValid: true };
  }
}
