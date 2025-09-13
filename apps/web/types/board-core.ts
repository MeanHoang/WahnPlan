// Board Core Types
export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  subtitle?: string;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
  };
  taskStatuses: TaskStatus[];
  taskPriorities: TaskPriority[];
  taskInitiatives: TaskInitiative[];
  tasks: Task[];
  _count: {
    tasks: number;
    taskStatuses: number;
    taskPriorities: number;
    taskInitiatives: number;
  };
}

export interface TaskStatus {
  id: string;
  boardId: string;
  title: string;
  position: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPriority {
  id: string;
  boardId: string;
  name: string;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInitiative {
  id: string;
  boardId: string;
  name: string;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  dueDate?: string;
  taskStatusId?: string;
  taskInitiativeId?: string;
  taskPriorityId?: string;
  okr?: string;
  assigneeId?: string;
  reviewerId?: string;
  storyPoint?: number;
  sizeCard?: string;
  testCase?: string;
  goLive?: string;
  devMr?: string;
  baId?: string;
  staging?: string;
  note?: string;
  createdById: string;
  createdTime: string;
  sprint?: string;
  featureCategories?: string;
  sprintGoal?: string;
  descriptionJson?: any;
  descriptionPlain?: string;
  noteJson?: any;
  notePlain?: string;
  attachments?: any;
  createdAt: string;
  updatedAt: string;
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
  taskStatus?: TaskStatus;
  taskPriority?: TaskPriority;
  taskInitiative?: TaskInitiative;
  _count: {
    taskMembers: number;
    taskComments: number;
  };
}

export interface BoardStats {
  taskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  statusCount: number;
  priorityCount: number;
  initiativeCount: number;
}
