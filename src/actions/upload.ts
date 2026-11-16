'use server';

import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { uploadFileToStorage } from '@/lib/storage';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  // WEBP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true;
  // AVIF / HEIF: ftyp
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') return true;

  return false;
}

/**
 * Upload d'images de produits pour les administrateurs
 */
export async function uploadProductImageAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return { success: false, error: 'Non autorisé' };
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'Aucun fichier fourni' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Format d\'image non supporté. Formats acceptés : JPG, PNG, WEBP, AVIF.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'L\'image est trop volumineuse (maximum 10 Mo).',
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidImageMagicBytes(buffer)) {
      return {
        success: false,
        error: 'Contenu binaire de fichier invalide ou corrompu (signature d\'image non reconnue).',
      };
    }

    const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `prod-${timestamp}-${random}.${extension}`;

    const uploadResult = await uploadFileToStorage({
      buffer,
      fileName,
      mimeType: file.type,
      folder: 'products',
    });

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Échec du téléversement vers le stockage.',
      };
    }

    return {
      success: true,
      url: uploadResult.url,
      fileName: file.name,
      storageProvider: uploadResult.storageProvider,
    };
  } catch (error: any) {
    console.error('Erreur upload image produit:', error);
    return {
      success: false,
      error: error?.message || 'Une erreur est survenue lors du téléversement de l\'image.',
    };
  }
}


