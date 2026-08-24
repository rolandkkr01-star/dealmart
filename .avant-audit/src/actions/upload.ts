'use server';

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { requireAdmin, getCurrentUser } from '@/lib/auth';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

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

    // Définir le dossier de destination dans public/uploads/products
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Nom de fichier unique et sécurisé
    const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `prod-${timestamp}-${random}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/products/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      fileName: file.name,
    };
  } catch (error: any) {
    console.error('Erreur upload image:', error);
    return {
      success: false,
      error: error?.message || 'Une erreur est survenue lors du téléversement de l\'image.',
    };
  }
}
