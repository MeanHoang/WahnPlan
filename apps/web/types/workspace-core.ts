// Core Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  visibility: "public" | "private";
  icon?: string;
  notifyTaskDueSoon: boolean;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  boards: Board[];
  _count: {
    boards: number;
  };
}

export interface WorkspaceMember {
  id: string;
  role: "owner" | "manager" | "member" | "guest";
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  inviter?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
  };
}

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
  _count: {
    tasks: number;
    taskStatuses: number;
    taskPriorities: number;
    taskInitiatives: number;
  };
}
