"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const storage_1 = require("../config/storage");
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
class StorageService {
    constructor() {
        this.bucketsReady = false;
    }
    /** Create public/private buckets if they do not exist yet */
    async ensureBuckets() {
        if (!(0, supabase_1.isSupabaseStorageEnabled)() || this.bucketsReady)
            return;
        const admin = (0, supabase_1.getSupabaseAdmin)();
        const { data: existing, error: listError } = await admin.storage.listBuckets();
        if (listError) {
            logger_1.logger.warn('[Storage] Could not list buckets:', listError.message);
            return;
        }
        const names = new Set((existing || []).map((b) => b.name));
        const desired = [
            { id: storage_1.STORAGE_BUCKETS.PUBLIC, public: true },
            { id: storage_1.STORAGE_BUCKETS.PRIVATE, public: false },
        ];
        for (const bucket of desired) {
            if (names.has(bucket.id))
                continue;
            const { error } = await admin.storage.createBucket(bucket.id, {
                public: bucket.public,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: undefined,
            });
            if (error && !error.message.toLowerCase().includes('already exists')) {
                logger_1.logger.warn(`[Storage] Failed to create bucket ${bucket.id}:`, error.message);
            }
            else {
                logger_1.logger.info(`[Storage] Ensured bucket: ${bucket.id} (public=${bucket.public})`);
            }
        }
        this.bucketsReady = true;
    }
    /**
     * Uploads a file and returns a publicly accessible URL (or signed URL for private buckets).
     */
    async uploadFile(params) {
        if ((0, supabase_1.isSupabaseStorageEnabled)()) {
            return this.uploadToSupabase(params);
        }
        return this.uploadToS3(params);
    }
    async uploadToSupabase(params) {
        await this.ensureBuckets();
        const ext = path_1.default.extname(params.originalName).toLowerCase() || '';
        const objectPath = `${params.folder}/${(0, uuid_1.v4)()}${ext}`;
        const bucket = (0, storage_1.bucketForFolder)(params.folder);
        const admin = (0, supabase_1.getSupabaseAdmin)();
        const { error } = await admin.storage.from(bucket).upload(objectPath, params.buffer, {
            contentType: params.mimeType,
            upsert: false,
            cacheControl: '3600',
        });
        if (error) {
            logger_1.logger.error('[Storage] Supabase upload failed:', error);
            throw new Error(`Storage upload failed: ${error.message}`);
        }
        if (bucket === storage_1.STORAGE_BUCKETS.PRIVATE) {
            const { data, error: signError } = await admin.storage
                .from(bucket)
                .createSignedUrl(objectPath, 60 * 60 * 24 * 365); // 1 year for stored reference
            if (signError || !data?.signedUrl) {
                // Fall back to a stable object path marker; use getPresignedUrl later
                const url = `${env_1.env.SUPABASE_URL}/storage/v1/object/sign/${bucket}/${objectPath}`;
                logger_1.logger.info(`[Storage] Uploaded private object: ${bucket}/${objectPath}`);
                return url;
            }
            logger_1.logger.info(`[Storage] Uploaded private: ${bucket}/${objectPath}`);
            return data.signedUrl;
        }
        const { data } = admin.storage.from(bucket).getPublicUrl(objectPath);
        logger_1.logger.info(`[Storage] Uploaded public: ${bucket}/${objectPath}`);
        return data.publicUrl;
    }
    async uploadToS3(params) {
        const ext = path_1.default.extname(params.originalName).toLowerCase();
        const key = `${params.folder}/${(0, uuid_1.v4)()}${ext}`;
        await aws_1.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: aws_1.S3_BUCKET,
            Key: key,
            Body: params.buffer,
            ContentType: params.mimeType,
            ServerSideEncryption: 'AES256',
            Metadata: {
                originalName: params.originalName,
            },
        }));
        const url = `${aws_1.S3_BASE_URL}/${key}`;
        logger_1.logger.info(`[S3] Uploaded: ${key}`);
        return url;
    }
    async uploadBeforeAfterPhoto(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: storage_1.STORAGE_PATHS.BEFORE_AFTER });
    }
    async uploadProfilePhoto(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: storage_1.STORAGE_PATHS.PROFILE_PHOTOS });
    }
    async uploadConsentForm(buffer, originalName) {
        return this.uploadFile({
            buffer,
            originalName,
            mimeType: 'application/pdf',
            folder: storage_1.STORAGE_PATHS.CONSENT_FORMS,
        });
    }
    async uploadGalleryImage(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: storage_1.STORAGE_PATHS.GALLERY });
    }
    async uploadMediaAsset(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: storage_1.STORAGE_PATHS.MEDIA });
    }
    /**
     * Generates a time-limited URL for private objects.
     */
    async getPresignedUrl(keyOrUrl, expiresIn = 3600) {
        if ((0, supabase_1.isSupabaseStorageEnabled)()) {
            const { bucket, objectPath } = this.parseSupabaseLocation(keyOrUrl);
            const { data, error } = await (0, supabase_1.getSupabaseAdmin)()
                .storage.from(bucket)
                .createSignedUrl(objectPath, expiresIn);
            if (error || !data?.signedUrl) {
                throw new Error(error?.message || 'Failed to create signed URL');
            }
            return data.signedUrl;
        }
        const key = keyOrUrl.startsWith('http')
            ? keyOrUrl.replace(`${aws_1.S3_BASE_URL}/`, '')
            : keyOrUrl;
        const command = new client_s3_1.GetObjectCommand({ Bucket: aws_1.S3_BUCKET, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, command, { expiresIn });
    }
    async deleteFile(urlOrKey) {
        if ((0, supabase_1.isSupabaseStorageEnabled)() && (urlOrKey.includes('supabase') || urlOrKey.includes('/storage/'))) {
            const { bucket, objectPath } = this.parseSupabaseLocation(urlOrKey);
            const { error } = await (0, supabase_1.getSupabaseAdmin)().storage.from(bucket).remove([objectPath]);
            if (error) {
                logger_1.logger.warn(`[Storage] Delete failed for ${bucket}/${objectPath}:`, error.message);
                return;
            }
            logger_1.logger.info(`[Storage] Deleted: ${bucket}/${objectPath}`);
            return;
        }
        const key = urlOrKey.startsWith('http')
            ? urlOrKey.replace(`${aws_1.S3_BASE_URL}/`, '')
            : urlOrKey;
        await aws_1.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: aws_1.S3_BUCKET, Key: key }));
        logger_1.logger.info(`[S3] Deleted: ${key}`);
    }
    parseSupabaseLocation(urlOrKey) {
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
        }
        catch {
            // fall through
        }
        const slash = urlOrKey.indexOf('/');
        if (slash > 0) {
            return {
                bucket: urlOrKey.slice(0, slash),
                objectPath: urlOrKey.slice(slash + 1),
            };
        }
        return { bucket: storage_1.STORAGE_BUCKETS.PUBLIC, objectPath: urlOrKey };
    }
}
exports.StorageService = StorageService;
exports.storageService = new StorageService();
//# sourceMappingURL=storage.service.js.map