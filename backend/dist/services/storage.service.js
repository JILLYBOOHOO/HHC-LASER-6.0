"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
class StorageService {
    /**
     * Uploads a file buffer to S3 and returns the public URL.
     */
    async uploadFile(params) {
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
    /**
     * Uploads a before/after treatment photo.
     */
    async uploadBeforeAfterPhoto(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: aws_1.S3_PATHS.BEFORE_AFTER });
    }
    /**
     * Uploads a profile photo.
     */
    async uploadProfilePhoto(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: aws_1.S3_PATHS.PROFILE_PHOTOS });
    }
    /**
     * Uploads a consent form PDF.
     */
    async uploadConsentForm(buffer, originalName) {
        return this.uploadFile({
            buffer,
            originalName,
            mimeType: 'application/pdf',
            folder: aws_1.S3_PATHS.CONSENT_FORMS,
        });
    }
    /**
     * Uploads a gallery image.
     */
    async uploadGalleryImage(buffer, originalName, mimeType) {
        return this.uploadFile({ buffer, originalName, mimeType, folder: aws_1.S3_PATHS.GALLERY });
    }
    /**
     * Generates a pre-signed URL for private S3 objects (e.g., medical records).
     * URL expires in 1 hour by default.
     */
    async getPresignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: aws_1.S3_BUCKET, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, command, { expiresIn });
    }
    /**
     * Deletes a file from S3 by its full URL or key.
     */
    async deleteFile(urlOrKey) {
        const key = urlOrKey.startsWith('http')
            ? urlOrKey.replace(`${aws_1.S3_BASE_URL}/`, '')
            : urlOrKey;
        await aws_1.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: aws_1.S3_BUCKET, Key: key }));
        logger_1.logger.info(`[S3] Deleted: ${key}`);
    }
}
exports.StorageService = StorageService;
exports.storageService = new StorageService();
//# sourceMappingURL=storage.service.js.map