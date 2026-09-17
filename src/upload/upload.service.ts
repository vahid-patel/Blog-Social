import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const streamifier = require('streamifier');

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp|gif)$/i)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF images are supported.',
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'blog-social/posts',
          resource_type: 'image',
          // Automatic optimization & resizing transformations:
          transformation: [
            {
              width: 1600,
              height: 1600,
              crop: 'limit', // Only downscale if larger than 1600px; never upscale
              quality: 'auto:good', // Optimal perceptual compression (70-90% size reduction)
              fetch_format: 'auto', // Deliver as WebP / AVIF to modern browsers
            },
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            return reject(
              new BadRequestException(error.message || 'Image upload to Cloudinary failed'),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
