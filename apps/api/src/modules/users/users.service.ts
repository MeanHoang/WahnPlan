import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

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
}
