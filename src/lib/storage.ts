import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Adaptateur de stockage d'images unifié (Cloudflare R2 / AWS S3 avec fallback Local)
 */

interface UploadOptions {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string; // ex: 'products', 'trade', 'avatars'
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  storageProvider: 'cloudflare_r2' | 'local_filesystem';
}

function getR2Client(): { client: S3Client; bucket: string; publicDomain: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicDomain = process.env.R2_PUBLIC_DOMAIN?.trim()?.replace(/\/$/, '');

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket, publicDomain: publicDomain || `https://${bucket}.r2.cloudflarestorage.com` };
}

export async function uploadFileToStorage({
  buffer,
  fileName,
  mimeType,
  folder = 'products',
}: UploadOptions): Promise<UploadResult> {
  const r2Config = getR2Client();

  // 1. UPLOAD SUR CLOUDFLARE R2 (S3 COMPATIBLE) SI CONFIGURÉ
  if (r2Config) {
    try {
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: r2Config.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await r2Config.client.send(command);

      const publicUrl = `${r2Config.publicDomain}/${key}`;
      console.log(`✅ [R2 Storage] Image uploadée avec succès sur Cloudflare R2 : ${publicUrl}`);

      return {
        success: true,
        url: publicUrl,
        storageProvider: 'cloudflare_r2',
      };
    } catch (err: any) {
      console.error('❌ Erreur upload Cloudflare R2 :', err);
      return {
        success: false,
        error: `Erreur lors de l'envoi sur Cloudflare R2 : ${err.message}`,
        storageProvider: 'cloudflare_r2',
      };
    }
  }

  // 2. FALLBACK LOCAL (DÉVELOPPEMENT) DANS public/uploads/
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${fileName}`;
    return {
      success: true,
      url: publicUrl,
      storageProvider: 'local_filesystem',
    };
  } catch (err: any) {
    console.error('❌ Erreur upload local :', err);
    return {
      success: false,
      error: `Erreur d'écriture sur le disque local : ${err.message}`,
      storageProvider: 'local_filesystem',
    };
  }
}
