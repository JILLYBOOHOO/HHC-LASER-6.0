import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET, S3_BASE_URL } from '../config/aws';
import { STORAGE_BUCKETS, STORAGE_PATHS, bucketForFolder } from '../config/storage';
import { getSupabaseAdmin, isSupabaseStorageEnabled } from '../config/supabase';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from '../utils/logger';

export class StorageService {
  private bucketsReady = false;

  /** Create public/private buckets if they do not exist yet */
  async ensureBuckets(): Promise<void> {
    if (!isSupabaseStorageEnabled() || this.bucketsReady) return;

    const admin = getSupabaseAdmin();
    const { data: existing, error: listError } = await admin.storage.listBuckets();
    if (listError) {
      logger.warn('[Storage] Could not list buckets:', listError.message);
      return;
    }

    const names = new Set((existing || []).map((b) => b.name));
    const desired = [
      { id: STORAGE_BUCKETS.PUBLIC, public: true },
      { id: STORAGE_BUCKETS.PRIVATE, public: false },
    ];

    for (const bucket of desired) {
      if (names.has(bucket.id)) continue;
      const { error } = await admin.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: 52_428_800, // 50MB
        allowedMimeTypes: undefined,
      });
      if (error && !error.message.toLowerCase().includes('already exists')) {
        logger.warn(`[Storage] Failed to create bucket ${bucket.id}:`, error.message);
      } else {
        logger.info(`[Storage] Ensured bucket: ${bucket.id} (public=${bucket.public})`);
      }
    }

    this.bucketsReady = true;
  }

  /**
   * Uploads a file and returns a publicly accessible URL (or signed URL for private buckets).
   */
  async uploadFile(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<string> {
    if (isSupabaseStorageEnabled()) {
      return this.uploadToSupabase(params);
    }
    return this.uploadToS3(params);
  }

  private async uploadToSupabase(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<string> {
    await this.ensureBuckets();

    const ext = path.extname(params.originalName).toLowerCase() || '';
    const objectPath = `${params.folder}/${uuidv4()}${ext}`;
    const bucket = bucketForFolder(params.folder);
    const admin = getSupabaseAdmin();

    const { error } = await admin.storage.from(bucket).upload(objectPath, params.buffer, {
      contentType: params.mimeType,
      upsert: false,
      cacheControl: '3600',
    });

    if (error) {
      logger.error('[Storage] Supabase upload failed:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    if (bucket === STORAGE_BUCKETS.PRIVATE) {
      const { data, error: signError } = await admin.storage
        .from(bucket)
        .createSignedUrl(objectPath, 60 * 60 * 24 * 365); // 1 year for stored reference
      if (signError || !data?.signedUrl) {
        // Fall back to a stable object path marker; use getPresignedUrl later
        const url = `${env.SUPABASE_URL}/storage/v1/object/sign/${bucket}/${objectPath}`;
        logger.info(`[Storage] Uploaded private object: ${bucket}/${objectPath}`);
        return url;
      }
      logger.info(`[Storage] Uploaded private: ${bucket}/${objectPath}`);
      return data.signedUrl;
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(objectPath);
    logger.info(`[Storage] Uploaded public: ${bucket}/${objectPath}`);
    return data.publicUrl;
  }

  private async uploadToS3(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<string> {
    const ext = path.extname(params.originalName).toLowerCase();
    const key = `${params.folder}/${uuidv4()}${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: params.buffer,
        ContentType: params.mimeType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          originalName: params.originalName,
        },
      })
    );

    const url = `${S3_BASE_URL}/${key}`;
    logger.info(`[S3] Uploaded: ${key}`);
    return url;
  }

  async uploadBeforeAfterPhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: STORAGE_PATHS.BEFORE_AFTER });
  }

  async uploadProfilePhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: STORAGE_PATHS.PROFILE_PHOTOS });
  }

  async uploadConsentForm(buffer: Buffer, originalName: string): Promise<string> {
    return this.uploadFile({
      buffer,
      originalName,
      mimeType: 'application/pdf',
      folder: STORAGE_PATHS.CONSENT_FORMS,
    });
  }

  async uploadGalleryImage(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: STORAGE_PATHS.GALLERY });
  }

  async uploadMediaAsset(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: STORAGE_PATHS.MEDIA });
  }

  /**
   * Generates a time-limited URL for private objects.
   */
  async getPresignedUrl(keyOrUrl: string, expiresIn = 3600): Promise<string> {
    if (isSupabaseStorageEnabled()) {
      const { bucket, objectPath } = this.parseSupabaseLocation(keyOrUrl);
      const { data, error } = await getSupabaseAdmin()
        .storage.from(bucket)
        .createSignedUrl(objectPath, expiresIn);
      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to create signed URL');
      }
      return data.signedUrl;
    }

    const key = keyOrUrl.startsWith('http')
      ? keyOrUrl.replace(`${S3_BASE_URL}/`, '')
      : keyOrUrl;
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async deleteFile(urlOrKey: string): Promise<void> {
    if (isSupabaseStorageEnabled() && (urlOrKey.includes('supabase') || urlOrKey.includes('/storage/'))) {
      const { bucket, objectPath } = this.parseSupabaseLocation(urlOrKey);
      const { error } = await getSupabaseAdmin().storage.from(bucket).remove([objectPath]);
      if (error) {
        logger.warn(`[Storage] Delete failed for ${bucket}/${objectPath}:`, error.message);
        return;
      }
      logger.info(`[Storage] Deleted: ${bucket}/${objectPath}`);
      return;
    }

    const key = urlOrKey.startsWith('http')
      ? urlOrKey.replace(`${S3_BASE_URL}/`, '')
      : urlOrKey;
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    logger.info(`[S3] Deleted: ${key}`);
  }

  private parseSupabaseLocation(urlOrKey: string): { bucket: string; objectPath: string } {
    // public:  .../storage/v1/object/public/<bucket>/<path>
    // signed:  .../storage/v1/object/sign/<bucket>/<path>?token=...
    // raw:     <bucket>/<path>
    try {
      if (urlOrKey.startsWith('http')) {
        const u = new URL(urlOrKey);
        const parts = u.pathname.split('/').filter(Boolean);
        const objectIdx = parts.indexOf('object');
        if (objectIdx >= 0 && parts[objectIdx + 1] && parts[objectIdx + 2]) {
          const bucket = parts[objectIdx + 2];
          const objectPath = decodeURIComponent(parts.slice(objectIdx + 3).join('/'));
          return { bucket, objectPath };
        }
      }
    } catch {
      // fall through
    }

    const slash = urlOrKey.indexOf('/');
    if (slash > 0) {
      return {
        bucket: urlOrKey.slice(0, slash),
        objectPath: urlOrKey.slice(slash + 1),
      };
    }

    return { bucket: STORAGE_BUCKETS.PUBLIC, objectPath: urlOrKey };
  }
}

export const storageService = new StorageService();
