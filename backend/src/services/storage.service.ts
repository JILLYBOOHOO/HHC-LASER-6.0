import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET, S3_BASE_URL, S3_PATHS } from '../config/aws';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from '../utils/logger';

export class StorageService {
  /**
   * Uploads a file buffer to S3 and returns the public URL.
   */
  async uploadFile(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<string> {
    const ext = path.extname(params.originalName).toLowerCase();
    const key = `${params.folder}/${uuidv4()}${ext}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        originalName: params.originalName,
      },
    }));

    const url = `${S3_BASE_URL}/${key}`;
    logger.info(`[S3] Uploaded: ${key}`);
    return url;
  }

  /**
   * Uploads a before/after treatment photo.
   */
  async uploadBeforeAfterPhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: S3_PATHS.BEFORE_AFTER });
  }

  /**
   * Uploads a profile photo.
   */
  async uploadProfilePhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: S3_PATHS.PROFILE_PHOTOS });
  }

  /**
   * Uploads a consent form PDF.
   */
  async uploadConsentForm(buffer: Buffer, originalName: string): Promise<string> {
    return this.uploadFile({
      buffer,
      originalName,
      mimeType: 'application/pdf',
      folder: S3_PATHS.CONSENT_FORMS,
    });
  }

  /**
   * Uploads a gallery image.
   */
  async uploadGalleryImage(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    return this.uploadFile({ buffer, originalName, mimeType, folder: S3_PATHS.GALLERY });
  }

  /**
   * Generates a pre-signed URL for private S3 objects (e.g., medical records).
   * URL expires in 1 hour by default.
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Deletes a file from S3 by its full URL or key.
   */
  async deleteFile(urlOrKey: string): Promise<void> {
    const key = urlOrKey.startsWith('http')
      ? urlOrKey.replace(`${S3_BASE_URL}/`, '')
      : urlOrKey;

    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    logger.info(`[S3] Deleted: ${key}`);
  }
}

export const storageService = new StorageService();
