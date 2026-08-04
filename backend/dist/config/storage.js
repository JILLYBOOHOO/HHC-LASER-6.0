"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_PATHS = exports.STORAGE_BUCKETS = void 0;
exports.bucketForFolder = bucketForFolder;
/** Supabase Storage bucket names */
exports.STORAGE_BUCKETS = {
    PUBLIC: 'hhc-public',
    PRIVATE: 'hhc-private',
};
/** Folder prefixes inside buckets (mirrors previous S3 layout) */
exports.STORAGE_PATHS = {
    BEFORE_AFTER: 'treatments/before-after',
    PREP_VIDEOS: 'content/prep-videos',
    PDF_GUIDES: 'content/pdf-guides',
    PROFILE_PHOTOS: 'users/profiles',
    CONSENT_FORMS: 'medical/consent-forms',
    GALLERY: 'public/gallery',
    MEDIA: 'cms/media',
};
function bucketForFolder(folder) {
    if (folder === exports.STORAGE_PATHS.CONSENT_FORMS) {
        return exports.STORAGE_BUCKETS.PRIVATE;
    }
    return exports.STORAGE_BUCKETS.PUBLIC;
}
//# sourceMappingURL=storage.js.map