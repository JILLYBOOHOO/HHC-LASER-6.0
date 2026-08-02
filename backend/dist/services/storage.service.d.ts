export declare class StorageService {
    /**
     * Uploads a file buffer to S3 and returns the public URL.
     */
    uploadFile(params: {
        buffer: Buffer;
        originalName: string;
        mimeType: string;
        folder: string;
    }): Promise<string>;
    /**
     * Uploads a before/after treatment photo.
     */
    uploadBeforeAfterPhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    /**
     * Uploads a profile photo.
     */
    uploadProfilePhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    /**
     * Uploads a consent form PDF.
     */
    uploadConsentForm(buffer: Buffer, originalName: string): Promise<string>;
    /**
     * Uploads a gallery image.
     */
    uploadGalleryImage(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    /**
     * Generates a pre-signed URL for private S3 objects (e.g., medical records).
     * URL expires in 1 hour by default.
     */
    getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
    /**
     * Deletes a file from S3 by its full URL or key.
     */
    deleteFile(urlOrKey: string): Promise<void>;
}
export declare const storageService: StorageService;
//# sourceMappingURL=storage.service.d.ts.map