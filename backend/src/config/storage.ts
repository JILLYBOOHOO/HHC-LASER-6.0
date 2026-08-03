/** Supabase Storage bucket names */
export const STORAGE_BUCKETS = {
  PUBLIC: 'hhc-public',
  PRIVATE: 'hhc-private',
} as const;

/** Folder prefixes inside buckets (mirrors previous S3 layout) */
export const STORAGE_PATHS = {
  BEFORE_AFTER: 'treatments/before-after',
  PREP_VIDEOS: 'content/prep-videos',
  PDF_GUIDES: 'content/pdf-guides',
  PROFILE_PHOTOS: 'users/profiles',
  CONSENT_FORMS: 'medical/consent-forms',
  GALLERY: 'public/gallery',
  MEDIA: 'cms/media',
} as const;

export type StorageFolder = (typeof STORAGE_PATHS)[keyof typeof STORAGE_PATHS];

export function bucketForFolder(folder: string): string {
  if (folder === STORAGE_PATHS.CONSENT_FORMS) {
    return STORAGE_BUCKETS.PRIVATE;
  }
  return STORAGE_BUCKETS.PUBLIC;
}
