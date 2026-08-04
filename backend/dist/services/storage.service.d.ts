export declare class StorageService {
    private bucketsReady;
    /** Create public/private buckets if they do not exist yet */
    ensureBuckets(): Promise<void>;
    /**
     * Uploads a file and returns a publicly accessible URL (or signed URL for private buckets).
     */
    uploadFile(params: {
        buffer: Buffer;
        originalName: string;
        mimeType: string;
        folder: string;
    }): Promise<string>;
    private uploadToSupabase;
    private uploadToS3;
    uploadBeforeAfterPhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    uploadProfilePhoto(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    uploadConsentForm(buffer: Buffer, originalName: string): Promise<string>;
    uploadGalleryImage(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    uploadMediaAsset(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    /**
     * Generates a time-limited URL for private objects.
     */
    getPresignedUrl(keyOrUrl: string, expiresIn?: number): Promise<string>;
    deleteFile(urlOrKey: string): Promise<void>;
    private parseSupabaseLocation;
}
export declare const storageService: StorageService;
//# sourceMappingURL=storage.service.d.ts.map