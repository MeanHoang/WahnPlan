import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.usersService.getStats(req.user.id);
  }

  @Get('recent-activities')
  async getRecentActivities(@Req() req: any) {
    return this.usersService.getRecentActivities(req.user.id);
  }

  @Get('workspace-summary')
  async getWorkspaceSummary(@Req() req: any) {
    return this.usersService.getWorkspaceSummary(req.user.id);
  }

  @Get()
  async getAllUsers(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
    @Query('search') search: string = '',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 5;
    return this.usersService.getAllUsers(pageNum, limitNum, search);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get('export')
  async exportUsers(@Res() res: Response) {
    const csvData = await this.usersService.exportUsers();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csvData);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `import-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'text/csv' ||
          file.originalname.endsWith('.csv')
        ) {
          callback(null, true);
        } else {
          callback(new Error('Only CSV files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.importUsers(file);
  }
}
