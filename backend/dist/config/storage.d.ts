/** Supabase Storage bucket names */
export declare const STORAGE_BUCKETS: {
    readonly PUBLIC: "hhc-public";
    readonly PRIVATE: "hhc-private";
};
/** Folder prefixes inside buckets (mirrors previous S3 layout) */
export declare const STORAGE_PATHS: {
    readonly BEFORE_AFTER: "treatments/before-after";
    readonly PREP_VIDEOS: "content/prep-videos";
    readonly PDF_GUIDES: "content/pdf-guides";
    readonly PROFILE_PHOTOS: "users/profiles";
    readonly CONSENT_FORMS: "medical/consent-forms";
    readonly GALLERY: "public/gallery";
    readonly MEDIA: "cms/media";
};
export type StorageFolder = (typeof STORAGE_PATHS)[keyof typeof STORAGE_PATHS];
export declare function bucketForFolder(folder: string): string;
//# sourceMappingURL=storage.d.ts.map