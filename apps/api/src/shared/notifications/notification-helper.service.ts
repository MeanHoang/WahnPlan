import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { NotificationType } from '@prisma/client';
import { EmailTranslationsService } from './email-translations.service';

@Injectable()
export class NotificationHelperService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private emailTranslations: EmailTranslationsService,
  ) {}

  /**
   * Get all members related to a task (assignee, reviewer, tester, BA, task members)
   */
  async getTaskRelatedMembers(taskId: string): Promise<string[]> {
    // Get task with all related members
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        taskMembers: true,
        assignee: true,
        reviewer: true,
        tester: true,
        baUser: true,
        createdBy: true,
      },
    });

    if (!task) return [];

    const memberIds = new Set<string>();

    // Add task members first (they should always be notified)
    task.taskMembers.forEach((member) => {
      memberIds.add(member.userId);
    });

    // Add other related users if they're not already in task members
    if (task.assignee) memberIds.add(task.assignee.id);
    if (task.reviewer) memberIds.add(task.reviewer.id);
    if (task.tester) memberIds.add(task.tester.id);
    if (task.baUser) memberIds.add(task.baUser.id);
    if (task.createdBy) memberIds.add(task.createdBy.id);

    return Array.from(memberIds);
  }

  /**
   * Send email notification to user
   */
  async sendEmailNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          publicName: true,
          fullname: true,
          language: true,
        },
      });

      if (!user || !user.email) return;

      const userName = user.publicName || user.fullname || 'User';
      const userLanguage = (user.language as 'vi' | 'en') || 'en';

      // Create email content based on notification type
      const emailSubject = `WahnPlan Notification: ${title}`;
      const emailHtml = await this.generateEmailTemplate(
        userName,
        title,
        message,
        type,
        data,
        userLanguage,
      );

      await this.emailService.sendNotificationEmail(
        user.email,
        emailSubject,
        emailHtml,
      );
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Generate HTML email template for notifications
   */
  private async generateEmailTemplate(
    userName: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: any,
    language: 'vi' | 'en' = 'en',
  ): Promise<string> {
    let taskUrl = '';
    if (data?.taskId) {
      // Get workspace ID from task through board relationship
      const task = await this.prisma.task.findUnique({
        where: { id: data.taskId },
        include: {
          board: {
            include: {
              workspace: true,
            },
          },
        },
      });

      if (task?.board?.workspace) {
        taskUrl = `${process.env.FRONTEND_URL}/workspace/${task.board.workspace.id}/task/${data.taskId}`;
      }
    }

    const viewTaskText = this.emailTranslations.getEmailTranslation(
      'emailNotifications.viewTask',
      {},
      language,
    );

    const greeting = this.emailTranslations.getEmailTranslation(
      'emailNotifications.greeting',
      { userName },
      language,
    );

    const bestRegards = this.emailTranslations.getEmailTranslation(
      'emailNotifications.bestRegards',
      {},
      language,
    );

    const teamName = this.emailTranslations.getEmailTranslation(
      'emailNotifications.wahnPlanTeam',
      {},
      language,
    );

    const actionButton = taskUrl
      ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          ${viewTaskText}
        </a>
      </div>
    `
      : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">WahnPlan</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">${greeting}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin: 0 0 10px 0;">${title}</h3>
            <p style="color: #666; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          
          ${actionButton}
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              ${bestRegards},<br>
              ${teamName}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create notifications for task-related members
   */
  async createTaskNotification(
    taskId: string,
    type: NotificationType,
    title: string,
    message: string,
    excludeUserId?: string, // Don't notify the user who performed the action
    data?: any,
  ): Promise<void> {
    try {
      const memberIds = await this.getTaskRelatedMembers(taskId);

      // Filter out the user who performed the action
      const targetUserIds = excludeUserId
        ? memberIds.filter((id) => id !== excludeUserId)
        : memberIds;

      if (targetUserIds.length === 0) return;

      // Create notifications for all target users
      const notifications = targetUserIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        data: {
          taskId,
          ...data,
        },
      }));

      await this.notificationsService.createBulkNotifications(notifications);

      // Send email notifications to all target users
      for (const userId of targetUserIds) {
        await this.sendEmailNotification(userId, type, title, message, {
          taskId,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  }

  /**
   * Create task assigned notification
   */
  async notifyTaskAssigned(
    taskId: string,
    assigneeId: string,
    assignedBy: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    if (!task) return;

    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
      select: { publicName: true, fullname: true, email: true },
    });

    const assignedByUser = await this.prisma.user.findUnique({
      where: { id: assignedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    const assigneeName =
      assignee?.publicName ||
      assignee?.fullname ||
      assignee?.email ||
      'Unknown';
    const assignedByName =
      assignedByUser?.publicName ||
      assignedByUser?.fullname ||
      assignedByUser?.email ||
      'Unknown';

    await this.createTaskNotification(
      taskId,
      NotificationType.task_assigned,
      this.emailTranslations.getTranslation('emailNotifications.taskAssigned'),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.taskAssignedMessage',
        {
          assigneeName,
          taskTitle: task.title,
          assignedByName,
        },
      ),
      assignedBy,
      { assigneeId, assignedBy },
    );
  }

  /**
   * Create task updated notification
   */
  async notifyTaskUpdated(
    taskId: string,
    updatedBy: string,
    changes?: string[],
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    if (!task) return;

    const updatedByUser = await this.prisma.user.findUnique({
      where: { id: updatedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    const updatedByName =
      updatedByUser?.publicName ||
      updatedByUser?.fullname ||
      updatedByUser?.email ||
      'Unknown';

    const changeText =
      changes && changes.length > 0 ? ` Changes: ${changes.join(', ')}` : '';

    await this.createTaskNotification(
      taskId,
      NotificationType.task_updated,
      this.emailTranslations.getTranslation('emailNotifications.taskUpdated'),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.taskUpdatedMessage',
        {
          taskTitle: task.title,
          updatedByName,
        },
      ) + changeText,
      updatedBy,
      { updatedBy, changes },
    );
  }

  /**
   * Create task completed notification
   */
  async notifyTaskCompleted(
    taskId: string,
    completedBy: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    if (!task) return;

    const completedByUser = await this.prisma.user.findUnique({
      where: { id: completedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    const completedByName =
      completedByUser?.publicName ||
      completedByUser?.fullname ||
      completedByUser?.email ||
      'Unknown';

    await this.createTaskNotification(
      taskId,
      NotificationType.task_completed,
      this.emailTranslations.getTranslation('emailNotifications.taskCompleted'),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.taskCompletedMessage',
        {
          taskTitle: task.title,
          completedByName,
        },
      ),
      completedBy,
      { completedBy },
    );
  }

  /**
   * Create task overdue notification
   */
  async notifyTaskOverdue(taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, dueDate: true },
    });

    if (!task) return;

    const dueDateText = task.dueDate
      ? ` (due: ${new Date(task.dueDate).toLocaleDateString()})`
      : '';

    await this.createTaskNotification(
      taskId,
      NotificationType.task_overdue,
      this.emailTranslations.getTranslation('emailNotifications.taskOverdue'),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.taskOverdueMessage',
        {
          taskTitle: task.title,
          dueDate: dueDateText,
        },
      ),
      undefined,
      { dueDate: task.dueDate },
    );
  }

  /**
   * Create comment added notification
   */
  async notifyCommentAdded(
    taskId: string,
    commentId: string,
    commenterId: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    const commenter = await this.prisma.user.findUnique({
      where: { id: commenterId },
      select: { publicName: true, fullname: true, email: true },
    });

    if (!task || !commenter) return;

    const commenterName =
      commenter.publicName ||
      commenter.fullname ||
      commenter.email ||
      'Unknown';

    await this.createTaskNotification(
      taskId,
      NotificationType.comment_added,
      this.emailTranslations.getTranslation('emailNotifications.newComment'),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.newCommentMessage',
        {
          commenterName,
          taskTitle: task.title,
        },
      ),
      commenterId,
      { commentId, commenterId },
    );
  }

  /**
   * Create task status changed notification
   */
  async notifyTaskStatusChanged(
    taskId: string,
    oldStatusId: string | null,
    newStatusId: string,
    changedBy: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    const [oldStatus, newStatus] = await Promise.all([
      oldStatusId
        ? this.prisma.taskStatus.findUnique({
            where: { id: oldStatusId },
            select: { title: true },
          })
        : null,
      this.prisma.taskStatus.findUnique({
        where: { id: newStatusId },
        select: { title: true },
      }),
    ]);

    const changedByUser = await this.prisma.user.findUnique({
      where: { id: changedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    if (!task || !newStatus || !changedByUser) return;

    const changedByName =
      changedByUser.publicName ||
      changedByUser.fullname ||
      changedByUser.email ||
      'Unknown';
    const statusChange = oldStatus
      ? ` from "${oldStatus.title}" to "${newStatus.title}"`
      : ` to "${newStatus.title}"`;

    await this.createTaskNotification(
      taskId,
      NotificationType.task_status_changed,
      this.emailTranslations.getTranslation(
        'emailNotifications.taskStatusChanged',
      ),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.taskStatusChangedMessage',
        {
          taskTitle: task.title,
          statusChange,
          changedByName,
        },
      ),
      changedBy,
      { oldStatusId, newStatusId, changedBy },
    );
  }

  /**
   * Create task priority changed notification
   */
  async notifyTaskPriorityChanged(
    taskId: string,
    oldPriorityId: string | null,
    newPriorityId: string,
    changedBy: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    const [oldPriority, newPriority] = await Promise.all([
      oldPriorityId
        ? this.prisma.taskPriority.findUnique({
            where: { id: oldPriorityId },
            select: { name: true },
          })
        : null,
      this.prisma.taskPriority.findUnique({
        where: { id: newPriorityId },
        select: { name: true },
      }),
    ]);

    const changedByUser = await this.prisma.user.findUnique({
      where: { id: changedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    if (!task || !newPriority || !changedByUser) return;

    const changedByName =
      changedByUser.publicName ||
      changedByUser.fullname ||
      changedByUser.email ||
      'Unknown';
    const priorityChange = oldPriority
      ? ` from "${oldPriority.name}" to "${newPriority.name}"`
      : ` to "${newPriority.name}"`;

    await this.createTaskNotification(
      taskId,
      NotificationType.task_priority_changed,
      this.emailTranslations.getTranslation(
        'emailNotifications.taskPriorityChanged',
      ),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.taskPriorityChangedMessage',
        {
          taskTitle: task.title,
          priorityChange,
          changedByName,
        },
      ),
      changedBy,
      { oldPriorityId, newPriorityId, changedBy },
    );
  }

  /**
   * Create task tester assigned notification
   */
  async notifyTaskTesterAssigned(
    taskId: string,
    testerId: string,
    assignedBy: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    const tester = await this.prisma.user.findUnique({
      where: { id: testerId },
      select: { publicName: true, fullname: true, email: true },
    });

    const assignedByUser = await this.prisma.user.findUnique({
      where: { id: assignedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    if (!task || !tester || !assignedByUser) return;

    const testerName =
      tester.publicName || tester.fullname || tester.email || 'Unknown';
    const assignedByName =
      assignedByUser.publicName ||
      assignedByUser.fullname ||
      assignedByUser.email ||
      'Unknown';

    await this.createTaskNotification(
      taskId,
      NotificationType.task_tester_assigned,
      this.emailTranslations.getTranslation(
        'emailNotifications.testerAssigned',
      ),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.testerAssignedMessage',
        {
          testerName,
          taskTitle: task.title,
          assignedByName,
        },
      ),
      assignedBy,
      { testerId, assignedBy },
    );
  }

  /**
   * Create task reviewer assigned notification
   */
  async notifyTaskReviewerAssigned(
    taskId: string,
    reviewerId: string,
    assignedBy: string,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { publicName: true, fullname: true, email: true },
    });

    const assignedByUser = await this.prisma.user.findUnique({
      where: { id: assignedBy },
      select: { publicName: true, fullname: true, email: true },
    });

    if (!task || !reviewer || !assignedByUser) return;

    const reviewerName =
      reviewer.publicName || reviewer.fullname || reviewer.email || 'Unknown';
    const assignedByName =
      assignedByUser.publicName ||
      assignedByUser.fullname ||
      assignedByUser.email ||
      'Unknown';

    await this.createTaskNotification(
      taskId,
      NotificationType.task_reviewer_assigned,
      this.emailTranslations.getTranslation(
        'emailNotifications.reviewerAssigned',
      ),
      this.emailTranslations.getEmailTranslation(
        'emailNotifications.reviewerAssignedMessage',
        {
          reviewerName,
          taskTitle: task.title,
          assignedByName,
        },
      ),
      assignedBy,
      { reviewerId, assignedBy },
    );
  }
}
