"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_PATHS = exports.S3_BASE_URL = exports.S3_BUCKET = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("./env");
exports.s3Client = new client_s3_1.S3Client({
    region: env_1.env.AWS_REGION,
    ...(env_1.env.AWS_ACCESS_KEY_ID && env_1.env.AWS_SECRET_ACCESS_KEY ? {
        credentials: {
            accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
        }
    } : {}),
});
exports.S3_BUCKET = env_1.env.S3_BUCKET_NAME;
exports.S3_BASE_URL = env_1.env.S3_BUCKET_URL;
exports.S3_PATHS = {
    BEFORE_AFTER: 'treatments/before-after',
    PREP_VIDEOS: 'content/prep-videos',
    PDF_GUIDES: 'content/pdf-guides',
    PROFILE_PHOTOS: 'users/profiles',
    CONSENT_FORMS: 'medical/consent-forms',
    GALLERY: 'public/gallery',
};
//# sourceMappingURL=aws.js.map