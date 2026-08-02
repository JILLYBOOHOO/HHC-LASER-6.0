import { S3Client } from '@aws-sdk/client-s3';
export declare const s3Client: S3Client;
export declare const S3_BUCKET: string;
export declare const S3_BASE_URL: string;
export declare const S3_PATHS: {
    readonly BEFORE_AFTER: "treatments/before-after";
    readonly PREP_VIDEOS: "content/prep-videos";
    readonly PDF_GUIDES: "content/pdf-guides";
    readonly PROFILE_PHOTOS: "users/profiles";
    readonly CONSENT_FORMS: "medical/consent-forms";
    readonly GALLERY: "public/gallery";
};
//# sourceMappingURL=aws.d.ts.map