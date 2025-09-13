export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  boardId: string;
  taskStatusId: string;
  taskPriorityId?: string;
  taskInitiativeId?: string;
  position: number;

  // Relations
  taskStatus: TaskStatus;
  taskPriority?: TaskPriority;
  taskInitiative?: TaskInitiative;
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
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}
