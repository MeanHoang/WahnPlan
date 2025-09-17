import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    // Validate that the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return notification;
  }

  async findAll(userId: string, query: NotificationQueryDto = {}) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId,
    };

    if (query.type) {
      whereClause.type = query.type;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.search) {
      whereClause.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          message: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await this.prisma.notification.count({
      where: whereClause,
    });

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy) {
      switch (query.sortBy) {
        case 'title':
          orderBy = { title: query.sortOrder || 'asc' };
          break;
        case 'type':
          orderBy = { type: query.sortOrder || 'asc' };
          break;
        case 'status':
          orderBy = { status: query.sortOrder || 'asc' };
          break;
        case 'createdAt':
          orderBy = { createdAt: query.sortOrder || 'desc' };
          break;
        case 'readAt':
          orderBy = { readAt: query.sortOrder || 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    // Get paginated notifications
    const notifications = await this.prisma.notification.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId: string,
  ) {
    // Check if notification exists and belongs to user
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNotification) {
      throw new NotFoundException('Notification not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (updateNotificationDto.status !== undefined) {
      updateData.status = updateNotificationDto.status;
    }

    if (updateNotificationDto.isRead !== undefined) {
      updateData.isRead = updateNotificationDto.isRead;
      if (updateNotificationDto.isRead && !existingNotification.isRead) {
        updateData.readAt = new Date();
      } else if (!updateNotificationDto.isRead) {
        updateData.readAt = null;
      }
    }

    const notification = await this.prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    return this.update(id, { isRead: true }, userId);
  }

  async markAsUnread(id: string, userId: string) {
    return this.update(id, { isRead: false }, userId);
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  }

  async remove(id: string, userId: string) {
    // Check if notification exists and belongs to user
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async getStats(userId: string) {
    const [total, unread, byType, byStatus] = await Promise.all([
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          id: true,
        },
      }),
      this.prisma.notification.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      total,
      unread,
      byType,
      byStatus,
    };
  }

  // Helper method to create notifications for specific events
  async createTaskNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
  ) {
    return this.create({
      userId,
      type: type as any,
      title,
      message,
      data,
    });
  }

  // Helper method to create notifications for multiple users
  async createBulkNotifications(notifications: CreateNotificationDto[]) {
    const validUsers = await this.prisma.user.findMany({
      where: {
        id: {
          in: notifications.map((n) => n.userId),
        },
      },
      select: { id: true },
    });

    const validUserIds = validUsers.map((u) => u.id);
    const validNotifications = notifications.filter((n) =>
      validUserIds.includes(n.userId),
    );

    if (validNotifications.length === 0) {
      return { message: 'No valid notifications to create', count: 0 };
    }

    const result = await this.prisma.notification.createMany({
      data: validNotifications,
    });

    return {
      message: `${result.count} notifications created`,
      count: result.count,
    };
  }
}
