"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAny = exports.uploadDocument = exports.uploadVideo = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const error_middleware_1 = require("./error.middleware");
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
function fileFilter(allowedTypes) {
    return (_req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new error_middleware_1.AppError(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`, 400));
        }
    };
}
// Store in memory temporarily; actual S3 upload is done in the service layer
const memoryStorage = multer_1.default.memoryStorage();
exports.uploadImage = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});
exports.uploadVideo = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: fileFilter(ALLOWED_VIDEO_TYPES),
});
exports.uploadDocument = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: fileFilter(ALLOWED_DOC_TYPES),
});
exports.uploadAny = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: fileFilter([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]),
});
//# sourceMappingURL=upload.middleware.js.map