export enum GCS_FILE_PATHS {
  WORD_SOUNDS = 'word-sounds',
}

export interface GCSUploadOptions {
  bucketName: string;
  fileName: string;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export interface UploadedMediaFile {
  originalUrl?: string;
  type: MediaType;
  gcsUrl?: string;
  uploadedGCSKey?: string;
}
