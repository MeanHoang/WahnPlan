import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const totalUsers = await this.prisma.user.count();
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalWorkspaces = await this.prisma.workspace.count();
    const totalTasks = await this.prisma.task.count();
    const completedTasksThisMonth = await this.prisma.task.count({
      where: {
        isDone: true,
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return {
      totalUsers,
      newUsersThisMonth,
      totalWorkspaces,
      totalTasks,
      completedTasksThisMonth,
    };
  }

  async getUserGrowth() {
    // Lấy dữ liệu user growth trong 30 ngày qua
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowthData = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const growthByDate = userGrowthData.reduce(
      (acc, user) => {
        const date = user.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill missing dates with 0
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        value: growthByDate[dateStr] || 0,
      });
    }

    return chartData;
  }

  async getTaskDistribution() {
    // Lấy phân bố task theo status
    const taskStatuses = await this.prisma.taskStatus.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const statusDistribution = taskStatuses.reduce(
      (acc, status) => {
        acc[status.title] = status._count.tasks;
        return acc;
      },
      {} as Record<string, number>,
    );

    return statusDistribution;
  }

  async getTaskPriorityDistribution() {
    // Lấy phân bố task theo priority
    const taskPriorities = await this.prisma.taskPriority.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const priorityDistribution = taskPriorities.reduce(
      (acc, priority) => {
        acc[priority.name] = priority._count.tasks;
        return acc;
      },
      {} as Record<string, number>,
    );

    return priorityDistribution;
  }

  async getTaskInitiativeDistribution() {
    // Lấy phân bố task theo initiative
    const taskInitiatives = await this.prisma.taskInitiative.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const initiativeDistribution = taskInitiatives.reduce(
      (acc, initiative) => {
        acc[initiative.name] = initiative._count.tasks;
        return acc;
      },
      {} as Record<string, number>,
    );

    return initiativeDistribution;
  }

  async getRecentActivities() {
    // Lấy các hoạt động gần đây từ task history và notifications
    const recentTaskHistory = await this.prisma.taskHistory.findMany({
      take: 10,
      orderBy: {
        changedAt: 'desc',
      },
      include: {
        changedBy: {
          select: {
            publicName: true,
            fullname: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    });

    const recentNotifications = await this.prisma.notification.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format task history activities
    const taskActivities = recentTaskHistory.map((history) => ({
      title: `Task updated: ${history.task.title}`,
      user:
        history.changedBy.publicName || history.changedBy.fullname || 'Unknown',
      timestamp: history.changedAt,
      status: 'Updated',
    }));

    // Format notification activities
    const notificationActivities = recentNotifications.map((notification) => ({
      title: notification.title,
      user: 'System',
      timestamp: notification.createdAt,
      status: notification.type.replace('_', ' '),
    }));

    // Combine and sort by timestamp
    const allActivities = [...taskActivities, ...notificationActivities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    return allActivities;
  }

  async getWorkspaceStats() {
    const workspaces = await this.prisma.workspace.findMany({
      include: {
        _count: {
          select: {
            members: true,
            boards: true,
          },
        },
      },
    });

    const totalMembers = workspaces.reduce(
      (sum, ws) => sum + ws._count.members,
      0,
    );
    const avgMembersPerWorkspace =
      workspaces.length > 0 ? totalMembers / workspaces.length : 0;

    return {
      totalWorkspaces: workspaces.length,
      totalMembers,
      avgMembersPerWorkspace: Math.round(avgMembersPerWorkspace * 10) / 10,
      workspaces: workspaces.map((ws) => ({
        id: ws.id,
        name: ws.name,
        description: ws.description,
        memberCount: ws._count.members,
        boardCount: ws._count.boards,
        createdAt: ws.createdAt,
      })),
    };
  }

  async getTaskCompletionTrend() {
    // Lấy xu hướng hoàn thành task trong 30 ngày qua
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTasks = await this.prisma.task.findMany({
      where: {
        isDone: true,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    // Group by date
    const completionByDate = completedTasks.reduce(
      (acc, task) => {
        const date = task.updatedAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill missing dates with 0
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        value: completionByDate[dateStr] || 0,
      });
    }

    return chartData;
  }
}
