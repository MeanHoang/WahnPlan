export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  COMMENT_ADDED = 'comment_added',
  MENTION = 'mention',
  WORKSPACE_INVITE = 'workspace_invite',
  WORKSPACE_ROLE_CHANGED = 'workspace_role_changed',
  BOARD_CREATED = 'board_created',
  TASK_STATUS_CHANGED = 'task_status_changed',
  TASK_PRIORITY_CHANGED = 'task_priority_changed',
  TASK_TESTER_ASSIGNED = 'task_tester_assigned',
  TASK_REVIEWER_ASSIGNED = 'task_reviewer_assigned',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    fullname: string | null;
    publicName: string | null;
    avatarUrl: string | null;
  };
}

export interface NotificationResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{
    type: NotificationType;
    _count: { id: number };
  }>;
  byStatus: Array<{
    status: NotificationStatus;
    _count: { id: number };
  }>;
}
