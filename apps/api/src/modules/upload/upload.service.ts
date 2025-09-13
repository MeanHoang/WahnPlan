import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly allowedVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
  ];
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB
  private readonly maxVideoSize = 100 * 1024 * 1024; // 100MB

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string }> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      );
    }

    if (file.size > this.maxImageSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 10MB',
      );
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'wahnplan/avatars',
          public_id: `avatar_${userId}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          overwrite: true,
        },
      );

      // Update user avatar in database
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: result.secure_url },
      });

      return { url: result.secure_url };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  async deleteAvatar(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      try {
        // Delete from Cloudinary
        const publicId = `wahnplan/avatars/avatar_${userId}`;
        await cloudinary.uploader.destroy(publicId);

        // Update database
        await this.prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: null },
        });
      } catch (error) {
        console.error('Cloudinary delete error:', error);
        // Still update database even if Cloudinary delete fails
        await this.prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: null },
        });
      }
    }

    return { message: 'Avatar deleted successfully' };
  }

  async getAvatarUrl(userId: string): Promise<{ url: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    return { url: user?.avatarUrl || null };
  }

  // Upload video for boards/projects
  async uploadVideo(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'videos',
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.allowedVideoTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid video type. Only MP4, WebM, OGG, and AVI are allowed',
      );
    }

    if (file.size > this.maxVideoSize) {
      throw new BadRequestException(
        'Video size too large. Maximum size is 100MB',
      );
    }

    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: `wahnplan/${folder}`,
          resource_type: 'video',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
      );

      return { url: result.secure_url };
    } catch (error) {
      console.error('Cloudinary video upload error:', error);
      throw new BadRequestException('Failed to upload video');
    }
  }

  // Upload general files (documents, etc.)
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'files',
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB for general files
      throw new BadRequestException(
        'File size too large. Maximum size is 50MB',
      );
    }

    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: `wahnplan/${folder}`,
          resource_type: 'raw',
        },
      );

      return { url: result.secure_url };
    } catch (error) {
      console.error('Cloudinary file upload error:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  // Delete any file from Cloudinary
  async deleteFile(publicId: string): Promise<{ message: string }> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { message: 'File deleted successfully' };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }
}
