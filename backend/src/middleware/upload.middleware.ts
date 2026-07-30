import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { AppError } from './error.middleware';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

function fileFilter(allowedTypes: string[]) {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`, 400));
    }
  };
}

// Store in memory temporarily; actual S3 upload is done in the service layer
const memoryStorage = multer.memoryStorage();

export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

export const uploadVideo = multer({
  storage: memoryStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: fileFilter(ALLOWED_VIDEO_TYPES),
});

export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
});

export const uploadAny = multer({
  storage: memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: fileFilter([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]),
});
