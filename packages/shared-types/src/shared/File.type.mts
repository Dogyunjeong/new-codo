export enum GCS_FILE_PATHS {
  WORD_SOUNDS = 'word-sounds',
}

export interface GCSUploadOptions {
  bucketName: string;
  fileName: string;
}

export interface UploadedMediaFile {
  originalUrl?: string;
  gcsUrl?: string;
  uploadedGCSKey?: string;
}
