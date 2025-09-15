export interface Task {
  id: string;
  title: string;
  dueDate?: Date;
  taskStatusId?: string;
  taskInitiativeId?: string;
  taskPriorityId?: string;
  okr?: string;
  assigneeId?: string;
  reviewerId?: string;
  testerId?: string;
  isDone?: boolean;
  storyPoint?: number;
  sizeCard?: string;
  testCase?: string;
  goLive?: Date;
  devMr?: string;
  baId?: string;
  staging?: string;
  note?: string;
  createdById: string;
  createdTime: Date;
  sprint?: string;
  featureCategories?: string;
  sprintGoal?: string;
  descriptionJson?: any;
  descriptionPlain?: string;
  noteJson?: any;
  notePlain?: string;
  attachments?: any;
  createdAt: Date;
  updatedAt: Date;
  boardId: string;

  // Relations
  taskStatus?: TaskStatus;
  taskPriority?: TaskPriority;
  taskInitiative?: TaskInitiative;
  assignee?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  reviewer?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  tester?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  baUser?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  createdBy: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  taskMembers: TaskMember[];
  _count: {
    taskMembers: number;
    taskComments: number;
    taskHistory: number;
  };
}

export interface TaskStatus {
  id: string;
  title: string;
  color: string;
  position: number;
  boardId: string;
}

export interface TaskPriority {
  id: string;
  name: string;
  color: string;
  position: number;
  boardId: string;
}

export interface TaskInitiative {
  id: string;
  name: string;
  color: string;
  position: number;
  boardId: string;
}

export interface TaskMember {
  id: string;
  taskId: string;
  userId: string;
  position: number;
  user: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
