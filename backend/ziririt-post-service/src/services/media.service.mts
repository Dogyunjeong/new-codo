import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { getAppConfig } from '../configs/app.config.mts';
import { MediaFile, MediaUploadRequest } from '../types/post.types.mts';

export class MediaService {
  private config = getAppConfig();

  async uploadImage(uploadRequest: MediaUploadRequest, userId: string): Promise<MediaFile> {
    const { file, fileName, mimeType, fileSize } = uploadRequest;

    // Validate file type
    if (!this.config.allowedImageTypes.includes(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}`);
    }

    // Generate unique file ID and paths
    const fileId = uuidv4();
    const fileExtension = this.getFileExtension(fileName);
    const uniqueFileName = `${fileId}${fileExtension}`;
    const filePath = path.join(this.config.mediaStoragePath, 'images', uniqueFileName);
    const thumbnailPath = path.join(this.config.mediaStoragePath, 'thumbnails', `thumb_${uniqueFileName}`);

    // Ensure directories exist
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });

    try {
      // Process and optimize image with Sharp
      const processedImage = await sharp(file)
        .resize(1920, 1920, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Create thumbnail
      const thumbnail = await sharp(file)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 75 })
        .toBuffer();

      // Save files
      await fs.writeFile(filePath, processedImage);
      await fs.writeFile(thumbnailPath, thumbnail);

      // Create media file record
      const mediaFile: MediaFile = {
        id: fileId,
        url: `/media/images/${uniqueFileName}`,
        type: 'image',
        thumbnailUrl: `/media/thumbnails/thumb_${uniqueFileName}`,
        fileName: fileName,
        fileSize: processedImage.length,
        mimeType: 'image/jpeg', // Standardized to JPEG after processing
      };

      return mediaFile;
    } catch (error) {
      // Clean up any created files on error
      try {
        await fs.unlink(filePath);
        await fs.unlink(thumbnailPath);
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError);
      }
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadVideo(uploadRequest: MediaUploadRequest, userId: string): Promise<MediaFile> {
    const { file, fileName, mimeType, fileSize } = uploadRequest;

    // Validate file type
    if (!this.config.allowedVideoTypes.includes(mimeType)) {
      throw new Error(`Unsupported video type: ${mimeType}`);
    }

    // Generate unique file ID and paths
    const fileId = uuidv4();
    const fileExtension = this.getFileExtension(fileName);
    const uniqueFileName = `${fileId}${fileExtension}`;
    const filePath = path.join(this.config.mediaStoragePath, 'videos', uniqueFileName);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    try {
      // Save video file (no processing for now, could add video compression later)
      await fs.writeFile(filePath, file);

      // For now, we'll generate a basic thumbnail placeholder
      // In a production setup, you'd use ffmpeg to extract a frame
      const thumbnailPath = await this.generateVideoThumbnail(filePath, fileId);

      // Create media file record
      const mediaFile: MediaFile = {
        id: fileId,
        url: `/media/videos/${uniqueFileName}`,
        type: 'video',
        thumbnailUrl: thumbnailPath ? `/media/thumbnails/thumb_${fileId}.jpg` : undefined,
        fileName: fileName,
        fileSize: fileSize,
        mimeType: mimeType,
      };

      return mediaFile;
    } catch (error) {
      // Clean up any created files on error
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up video file:', cleanupError);
      }
      throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    // This would typically include permission checks
    // For now, we'll implement basic file deletion
    const imagePath = path.join(this.config.mediaStoragePath, 'images', `${mediaId}.*`);
    const videoPath = path.join(this.config.mediaStoragePath, 'videos', `${mediaId}.*`);
    const thumbnailPath = path.join(this.config.mediaStoragePath, 'thumbnails', `thumb_${mediaId}.*`);

    try {
      // Try to delete all possible file formats
      const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];
      
      for (const ext of extensions) {
        try {
          await fs.unlink(path.join(this.config.mediaStoragePath, 'images', `${mediaId}${ext}`));
        } catch (error) {
          // File might not exist, continue
        }
        
        try {
          await fs.unlink(path.join(this.config.mediaStoragePath, 'videos', `${mediaId}${ext}`));
        } catch (error) {
          // File might not exist, continue
        }
        
        try {
          await fs.unlink(path.join(this.config.mediaStoragePath, 'thumbnails', `thumb_${mediaId}.jpg`));
        } catch (error) {
          // File might not exist, continue
        }
      }
    } catch (error) {
      throw new Error(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getFileExtension(fileName: string): string {
    return path.extname(fileName).toLowerCase();
  }

  private async generateVideoThumbnail(videoPath: string, fileId: string): Promise<string | null> {
    // Placeholder implementation - in production, use ffmpeg to extract frame
    // For now, we'll create a simple placeholder thumbnail
    try {
      const thumbnailPath = path.join(this.config.mediaStoragePath, 'thumbnails', `thumb_${fileId}.jpg`);
      
      // Create a simple placeholder image using Sharp
      const placeholder = await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 100, g: 100, b: 100 }
        }
      })
      .jpeg({ quality: 75 })
      .toBuffer();

      await fs.writeFile(thumbnailPath, placeholder);
      return thumbnailPath;
    } catch (error) {
      console.error('Failed to generate video thumbnail:', error);
      return null;
    }
  }

  async getMediaFile(mediaPath: string): Promise<Buffer> {
    const fullPath = path.join(this.config.mediaStoragePath, mediaPath);
    
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      throw new Error(`Media file not found: ${mediaPath}`);
    }
  }
}