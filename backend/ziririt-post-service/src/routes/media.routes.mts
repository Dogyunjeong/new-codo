import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { MediaService } from '../services/media.service.mjs';
import { MediaUploadRequest } from '../types/post.types.mjs';

const mediaService = new MediaService();

// Auth middleware - simplified for now
async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  if (!token) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
  
  // Mock implementation - replace with real JWT verification
  (request as any).user = { userId: 'mock-user-id' };
}

export const mediaRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Upload media file
  fastify.post('/upload', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const currentUser = (request as any).user;

        // Handle multipart form data
        const data = await request.file();
        if (!data) {
          return reply.code(400).send({ error: 'No file uploaded' });
        }

        // Get file data
        const fileBuffer = await data.toBuffer();
        const fileName = data.filename;
        const mimeType = data.mimetype;
        const fileSize = fileBuffer.length;

        // Create upload request
        const uploadRequest: MediaUploadRequest = {
          file: fileBuffer,
          fileName,
          mimeType,
          fileSize,
        };

        // Upload based on file type
        let mediaFile;
        if (mimeType.startsWith('image/')) {
          mediaFile = await mediaService.uploadImage(uploadRequest, currentUser.userId);
        } else if (mimeType.startsWith('video/')) {
          mediaFile = await mediaService.uploadVideo(uploadRequest, currentUser.userId);
        } else {
          return reply.code(400).send({ error: 'Unsupported file type' });
        }

        return reply.code(201).send({ mediaFile });
      } catch (error) {
        request.log.error('Media upload error:', error);
        return reply.code(500).send({ 
          error: 'Failed to upload media',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Serve media files
  fastify.get<{ Params: { type: string, filename: string } }>('/:type/:filename', {
    handler: async (request, reply) => {
      try {
        const { type, filename } = request.params;
        
        // Validate media type
        if (!['images', 'videos', 'thumbnails'].includes(type)) {
          return reply.code(404).send({ error: 'Invalid media type' });
        }

        const mediaPath = `${type}/${filename}`;
        const fileBuffer = await mediaService.getMediaFile(mediaPath);

        // Set appropriate content type
        let contentType = 'application/octet-stream';
        if (type === 'images' || type === 'thumbnails') {
          contentType = 'image/jpeg'; // Most images are converted to JPEG
        } else if (type === 'videos') {
          const ext = filename.split('.').pop()?.toLowerCase();
          if (ext === 'mp4') contentType = 'video/mp4';
          else if (ext === 'mov') contentType = 'video/quicktime';
        }

        reply.type(contentType);
        reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        return reply.send(fileBuffer);
      } catch (error) {
        request.log.error('Serve media error:', error);
        return reply.code(404).send({ error: 'Media file not found' });
      }
    },
  });

  // Delete media file
  fastify.delete<{ Params: { mediaId: string } }>('/:mediaId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { mediaId } = request.params;
        const currentUser = (request as any).user;

        await mediaService.deleteMedia(mediaId, currentUser.userId);
        
        return reply.code(200).send({ message: 'Media deleted successfully' });
      } catch (error) {
        request.log.error('Delete media error:', error);
        return reply.code(500).send({ 
          error: 'Failed to delete media',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  done();
};