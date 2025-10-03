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
   * Get translated title for notification type
   */
  private getTitleForType(
    type: NotificationType,
    language: 'vi' | 'en',
    data?: any,
  ): string {
    console.log(
      `[NotificationHelper.getTitleForType] Type: ${type}, Language: ${language}`,
    );

    const titleMap: Record<NotificationType, string> = {
      [NotificationType.task_assigned]: 'emailNotifications.taskAssigned',
      [NotificationType.task_updated]: 'emailNotifications.taskUpdated',
      [NotificationType.task_completed]: 'emailNotifications.taskCompleted',
      [NotificationType.task_due_soon]: 'emailNotifications.taskDueSoon',
      [NotificationType.task_overdue]: 'emailNotifications.taskOverdue',
      [NotificationType.comment_added]: 'emailNotifications.newComment',
      [NotificationType.mention]: 'emailNotifications.mention',
      [NotificationType.workspace_invite]: 'emailNotifications.workspaceInvite',
      [NotificationType.workspace_role_changed]:
        'emailNotifications.workspaceRoleChanged',
      [NotificationType.board_created]: 'emailNotifications.boardCreated',
      [NotificationType.task_status_changed]:
        'emailNotifications.taskStatusChanged',
      [NotificationType.task_priority_changed]:
        'emailNotifications.taskPriorityChanged',
      [NotificationType.task_tester_assigned]:
        'emailNotifications.testerAssigned',
      [NotificationType.task_reviewer_assigned]:
        'emailNotifications.reviewerAssigned',
    };

    const key = titleMap[type];
    console.log(`[NotificationHelper.getTitleForType] Key: ${key}`);

    if (!key) {
      console.log(
        `[NotificationHelper.getTitleForType] No key found, returning default`,
      );
      return 'Notification';
    }

    const result = this.emailTranslations.getEmailTranslation(
      key,
      {},
      language,
    );
    console.log(`[NotificationHelper.getTitleForType] Result: ${result}`);

    // Debug: Check if result is still a key (translation failed)
    if (result === key) {
      console.error(
        `[NotificationHelper.getTitleForType] Translation failed - result same as key: ${result}`,
      );
    }

    return result;
  }

  /**
   * Get translated message for notification type
   */
  private getTranslatedMessage(
    type: NotificationType,
    language: 'vi' | 'en',
    data?: any,
  ): string {
    console.log(
      `[NotificationHelper.getTranslatedMessage] Type: ${type}, Language: ${language}, Data:`,
      data,
    );

    const messageMap: Record<NotificationType, string> = {
      [NotificationType.task_assigned]:
        'emailNotifications.taskAssignedMessage',
      [NotificationType.task_updated]: 'emailNotifications.taskUpdatedMessage',
      [NotificationType.task_completed]:
        'emailNotifications.taskCompletedMessage',
      [NotificationType.task_due_soon]: 'emailNotifications.taskDueSoonMessage',
      [NotificationType.task_overdue]: 'emailNotifications.taskOverdueMessage',
      [NotificationType.comment_added]: 'emailNotifications.newCommentMessage',
      [NotificationType.mention]: 'emailNotifications.mentionMessage',
      [NotificationType.workspace_invite]:
        'emailNotifications.workspaceInviteMessage',
      [NotificationType.workspace_role_changed]:
        'emailNotifications.workspaceRoleChangedMessage',
      [NotificationType.board_created]:
        'emailNotifications.boardCreatedMessage',
      [NotificationType.task_status_changed]:
        'emailNotifications.taskStatusChangedMessage',
      [NotificationType.task_priority_changed]:
        'emailNotifications.taskPriorityChangedMessage',
      [NotificationType.task_tester_assigned]:
        'emailNotifications.testerAssignedMessage',
      [NotificationType.task_reviewer_assigned]:
        'emailNotifications.reviewerAssignedMessage',
    };

    const key = messageMap[type];
    console.log(`[NotificationHelper.getTranslatedMessage] Key: ${key}`);

    if (!key) {
      console.log(
        `[NotificationHelper.getTranslatedMessage] No key found, returning default`,
      );
      return 'Notification message';
    }

    // Get placeholders from data
    const placeholders = data || {};
    console.log(
      `[NotificationHelper.getTranslatedMessage] Placeholders:`,
      placeholders,
    );

    // Add change text for task_updated
    let translatedMessage = this.emailTranslations.getEmailTranslation(
      key,
      placeholders,
      language,
    );
    console.log(
      `[NotificationHelper.getTranslatedMessage] Translated message: ${translatedMessage}`,
    );

    if (type === NotificationType.task_updated && data?.changes) {
      const changes = data.changes;
      const changeText =
        changes && changes.length > 0 ? ` Changes: ${changes.join(', ')}` : '';
      translatedMessage += changeText;
      console.log(
        `[NotificationHelper.getTranslatedMessage] Added change text: ${changeText}`,
      );
    }

    console.log(
      `[NotificationHelper.getTranslatedMessage] Final message: ${translatedMessage}`,
    );

    // Debug: Check if result is still a key (translation failed)
    if (translatedMessage === key) {
      console.error(
        `[NotificationHelper.getTranslatedMessage] Translation failed - result same as key: ${translatedMessage}`,
      );
    }

    return translatedMessage;
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
    console.log(
      `[NotificationHelper.sendEmailNotification] Starting email notification for userId: ${userId}, type: ${type}`,
    );
    const emailStartTime = Date.now();

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

      // Re-translate title and message with user's language
      console.log(
        `[NotificationHelper.sendEmailNotification] User language: ${userLanguage}`,
      );
      const translatedTitle = this.getTitleForType(type, userLanguage, data);
      const translatedMessage = this.getTranslatedMessage(
        type,
        userLanguage,
        data,
      );
      console.log(
        `[NotificationHelper.sendEmailNotification] Translated title: ${translatedTitle}`,
      );
      console.log(
        `[NotificationHelper.sendEmailNotification] Translated message: ${translatedMessage}`,
      );

      // Create email content based on notification type
      const emailSubject = `WahnPlan Notification: ${translatedTitle}`;
      const emailHtml = await this.generateEmailTemplate(
        userName,
        translatedTitle,
        translatedMessage,
        type,
        data,
        userLanguage,
      );

      await this.emailService.sendNotificationEmail(
        user.email,
        emailSubject,
        emailHtml,
      );
      console.log(
        `[NotificationHelper.sendEmailNotification] Email sent successfully in ${Date.now() - emailStartTime}ms`,
      );
    } catch (error) {
      console.error(
        `[NotificationHelper.sendEmailNotification] Error sending email notification after ${Date.now() - emailStartTime}ms:`,
        error,
      );
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

      // Send email notifications to all target users (async, don't wait)
      for (const userId of targetUserIds) {
        console.log(
          `[NotificationHelper.createTaskNotification] Sending email to userId: ${userId}, type: ${type}, title: ${title}`,
        );
        this.sendEmailNotification(userId, type, title, message, {
          taskId,
          ...data,
        }).catch((error) => {
          console.error(
            `[NotificationHelper.createTaskNotification] Email notification error for userId ${userId}:`,
            error,
          );
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
      'emailNotifications.taskAssigned', // Pass key instead of translated text
      'emailNotifications.taskAssignedMessage', // Pass key instead of translated text
      assignedBy,
      {
        assigneeId,
        assignedBy,
        assigneeName,
        taskTitle: task.title,
        assignedByName,
      },
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
      'emailNotifications.taskUpdated', // Pass key instead of translated text
      'emailNotifications.taskUpdatedMessage', // Pass key instead of translated text
      updatedBy,
      {
        updatedBy,
        changes,
        taskTitle: task.title,
        updatedByName,
      },
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
      'emailNotifications.taskCompleted', // Pass key instead of translated text
      'emailNotifications.taskCompletedMessage', // Pass key instead of translated text
      completedBy,
      {
        completedBy,
        taskTitle: task.title,
        completedByName,
      },
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
      'emailNotifications.taskOverdue', // Pass key instead of translated text
      'emailNotifications.taskOverdueMessage', // Pass key instead of translated text
      undefined,
      {
        dueDate: task.dueDate,
        taskTitle: task.title,
        dueDateText,
      },
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
      'emailNotifications.newComment', // Pass key instead of translated text
      'emailNotifications.newCommentMessage', // Pass key instead of translated text
      commenterId,
      {
        commentId,
        commenterId,
        commenterName,
        taskTitle: task.title,
      },
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
      'emailNotifications.taskStatusChanged', // Pass key instead of translated text
      'emailNotifications.taskStatusChangedMessage', // Pass key instead of translated text
      changedBy,
      {
        oldStatusId,
        newStatusId,
        changedBy,
        taskTitle: task.title,
        statusChange,
        changedByName,
      },
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
      'emailNotifications.taskPriorityChanged', // Pass key instead of translated text
      'emailNotifications.taskPriorityChangedMessage', // Pass key instead of translated text
      changedBy,
      {
        oldPriorityId,
        newPriorityId,
        changedBy,
        taskTitle: task.title,
        priorityChange,
        changedByName,
      },
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
      'emailNotifications.testerAssigned', // Pass key instead of translated text
      'emailNotifications.testerAssignedMessage', // Pass key instead of translated text
      assignedBy,
      {
        testerId,
        assignedBy,
        testerName,
        taskTitle: task.title,
        assignedByName,
      },
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
      'emailNotifications.reviewerAssigned', // Pass key instead of translated text
      'emailNotifications.reviewerAssignedMessage', // Pass key instead of translated text
      assignedBy,
      {
        reviewerId,
        assignedBy,
        reviewerName,
        taskTitle: task.title,
        assignedByName,
      },
    );
  }
}
