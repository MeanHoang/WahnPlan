import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import csv from 'csv-parser';
import * as fs from 'fs';
import { promisify } from 'util';
import { createReadStream } from 'fs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        jobTitle: true,
        organization: true,
        location: true,
        avatarUrl: true,
        emailVerify: true,
        language: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(id: string, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        jobTitle: true,
        organization: true,
        location: true,
        avatarUrl: true,
        emailVerify: true,
        language: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });
  }

  async getStats(userId: string) {
    const [
      // User's workspaces
      userWorkspaces,
      // Total tasks assigned to user
      assignedTasks,
      // Tasks completed by user
      completedTasks,
      // Overdue tasks
      overdueTasks,
      // Notifications stats
      notificationStats,
      // Recent activities count
      recentActivitiesCount,
    ] = await Promise.all([
      this.prisma.workspaceMember.count({
        where: { userId },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          isDone: true,
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: {
            lt: new Date(),
          },
          isDone: false,
        },
      }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { id: true },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Calculate completion rate
    const completionRate =
      assignedTasks > 0
        ? Math.round((completedTasks / assignedTasks) * 100)
        : 0;

    return {
      workspaces: userWorkspaces,
      assignedTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      notifications: {
        total: notificationStats.reduce((sum, item) => sum + item._count.id, 0),
        byType: notificationStats,
      },
      recentActivities: recentActivitiesCount,
    };
  }

  async getRecentActivities(userId: string) {
    const activities = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        isRead: true,
        data: true,
      },
    });

    return activities;
  }

  async getWorkspaceSummary(userId: string) {
    const workspaces = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            description: true,
            visibility: true,
            icon: true,
            createdAt: true,
            _count: {
              select: {
                boards: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get task counts for each workspace
    const workspaceStats = await Promise.all(
      workspaces.map(async (member) => {
        const taskCount = await this.prisma.task.count({
          where: {
            assigneeId: userId,
            board: {
              workspaceId: member.workspace.id,
            },
          },
        });

        const completedTaskCount = await this.prisma.task.count({
          where: {
            assigneeId: userId,
            isDone: true,
            board: {
              workspaceId: member.workspace.id,
            },
          },
        });

        return {
          ...member.workspace,
          role: member.role,
          myTasks: taskCount,
          myCompletedTasks: completedTaskCount,
        };
      }),
    );

    return workspaceStats;
  }

  async getAllUsers(page: number = 1, limit: number = 5, search: string = '') {
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { fullname: { contains: search, mode: 'insensitive' as const } },
            { publicName: { contains: search, mode: 'insensitive' as const } },
            {
              organization: { contains: search, mode: 'insensitive' as const },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullname: true,
          publicName: true,
          jobTitle: true,
          organization: true,
          location: true,
          avatarUrl: true,
          emailVerify: true,
          enable: true,
          language: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async updateUser(id: string, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        jobTitle: true,
        organization: true,
        location: true,
        avatarUrl: true,
        emailVerify: true,
        enable: true,
        language: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
      },
    });

    return { message: 'User deleted successfully', user };
  }

  async exportUsers(): Promise<string> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        jobTitle: true,
        organization: true,
        location: true,
        avatarUrl: true,
        emailVerify: true,
        enable: true,
        language: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Create CSV headers
    const headers = [
      'ID',
      'Email',
      'Full Name',
      'Public Name',
      'Job Title',
      'Organization',
      'Location',
      'Avatar URL',
      'Email Verified',
      'Enabled',
      'Language',
      'Timezone',
      'Created At',
      'Updated At',
    ];

    // Create CSV rows
    const rows = users.map((user) => [
      user.id,
      user.email,
      user.fullname || '',
      user.publicName || '',
      user.jobTitle || '',
      user.organization || '',
      user.location || '',
      user.avatarUrl || '',
      user.emailVerify ? 'true' : 'false',
      user.enable ? 'true' : 'false',
      user.language || '',
      user.timezone || '',
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  async importUsers(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported');
    }

    if (!file.path) {
      throw new BadRequestException('File path is missing');
    }

    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      errors: [] as any[],
    };

    try {
      const users: any[] = [];

      // Parse CSV file (only editable fields)
      await new Promise((resolve, reject) => {
        createReadStream(file.path)
          .pipe(
            csv({
              headers: [
                'email',
                'fullname',
                'publicName',
                'jobTitle',
                'organization',
                'location',
                'emailVerify',
                'enable',
                'language',
                'timezone',
              ],
            }),
          )
          .on('data', (data: any) => users.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      results.total = users.length;

      // Process each user
      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        const rowNumber = i + 2; // +2 because CSV is 1-indexed and we have headers

        try {
          // Validate required fields
          if (!userData.email) {
            throw new Error('Email is required');
          }

          // Check if user already exists
          const existingUser = await this.prisma.user.findUnique({
            where: { email: userData.email },
          });

          if (existingUser) {
            results.skipped++;
            results.errors.push({
              row: rowNumber,
              message: `User with email ${userData.email} already exists`,
            });
            continue;
          }

          // Prepare user data (excluding non-editable fields)
          const newUserData = {
            email: userData.email,
            fullname: userData.fullname || null,
            publicName: userData.publicName || null,
            jobTitle: userData.jobTitle || null,
            organization: userData.organization || null,
            location: userData.location || null,
            // avatarUrl: NOT IMPORTED - will be set to null by default
            emailVerify:
              userData.emailVerify === 'true' || userData.emailVerify === true,
            enable: userData.enable === 'true' || userData.enable === true,
            language: userData.language || 'en',
            timezone: userData.timezone || 'UTC',
            // Note: We don't import passwordHash, avatarUrl, createdAt, updatedAt for security/consistency reasons
            passwordHash: 'imported-user-needs-password-reset', // Placeholder
          };

          // Create user
          await this.prisma.user.create({
            data: newUserData,
          });

          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            message: error.message || 'Unknown error occurred',
          });
        }
      }

      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return results;
    } catch (error) {
      // Clean up uploaded file in case of error
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(
        `Failed to process CSV file: ${error.message}`,
      );
    }
  }
}
