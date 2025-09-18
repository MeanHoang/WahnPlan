import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@Query() query: NotificationQueryDto, @Req() req: any) {
    return this.notificationsService.findAll(req.user.id, query);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.notificationsService.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Patch('mark-all-read')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationsService.update(
      id,
      updateNotificationDto,
      req.user.id,
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch(':id/unread')
  markAsUnread(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsUnread(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.remove(id, req.user.id);
  }

  // Admin endpoints for creating notifications for other users
  @Post('bulk')
  createBulk(@Body() notifications: CreateNotificationDto[]) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw new BadRequestException(
        'Notifications array is required and cannot be empty',
      );
    }

    if (notifications.length > 100) {
      throw new BadRequestException(
        'Cannot create more than 100 notifications at once',
      );
    }

    return this.notificationsService.createBulkNotifications(notifications);
  }

  // Helper endpoint for creating task-related notifications
  @Post('task')
  createTaskNotification(
    @Body()
    body: {
      userId: string;
      type: string;
      title: string;
      message: string;
      data?: any;
    },
  ) {
    return this.notificationsService.createTaskNotification(
      body.userId,
      body.type,
      body.title,
      body.message,
      body.data,
    );
  }
}
