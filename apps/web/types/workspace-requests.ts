// Workspace Request/Response Types
export interface CreateWorkspaceData {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  icon?: string;
  notifyTaskDueSoon?: boolean;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  visibility?: "public" | "private";
  icon?: string;
  notifyTaskDueSoon?: boolean;
}

export interface InviteMemberData {
  email: string;
  role?: "owner" | "manager" | "member" | "guest";
  message?: string;
}

export interface UpdateMemberRoleData {
  role: "owner" | "manager" | "member" | "guest";
}

export interface WorkspaceStats {
  memberCount: number;
  boardCount: number;
  taskCount: number;
}
