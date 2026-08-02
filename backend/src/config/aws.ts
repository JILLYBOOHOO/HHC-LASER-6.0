import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
  } : {}),
});

export const S3_BUCKET = env.S3_BUCKET_NAME;
export const S3_BASE_URL = env.S3_BUCKET_URL;

export const S3_PATHS = {
  BEFORE_AFTER: 'treatments/before-after',
  PREP_VIDEOS: 'content/prep-videos',
  PDF_GUIDES: 'content/pdf-guides',
  PROFILE_PHOTOS: 'users/profiles',
  CONSENT_FORMS: 'medical/consent-forms',
  GALLERY: 'public/gallery',
} as const;
