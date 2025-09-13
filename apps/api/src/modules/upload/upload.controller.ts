import {
  Controller,
  Post,
  Delete,
  Get,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.uploadAvatar(file, req.user.id);
  }

  @Delete('avatar')
  async deleteAvatar(@Req() req: any) {
    return this.uploadService.deleteAvatar(req.user.id);
  }

  @Get('avatar')
  async getAvatar(@Req() req: any) {
    return this.uploadService.getAvatarUrl(req.user.id);
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.uploadVideo(file, req.user.id, folder);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.uploadFile(file, req.user.id, folder);
  }

  @Delete('file')
  async deleteFile(@Body('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }
    return this.uploadService.deleteFile(publicId);
  }
}
