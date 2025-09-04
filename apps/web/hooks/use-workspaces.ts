import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useDeleteApi } from "@/hooks/use-delete-api";

// Types
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
  title: string;
  subtitle?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    tasks: number;
  };
}

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

// Workspace Hooks
export function useWorkspaces() {
  return useFetchApi<Workspace[]>("/workspaces");
}

export function useWorkspace(id: string) {
  return useFetchApi<Workspace>(`/workspaces/${id}`);
}

export function useCreateWorkspace() {
  return useCreateApi<CreateWorkspaceData, Workspace>("/workspaces");
}

export function useUpdateWorkspace(id: string) {
  return useUpdateApi<UpdateWorkspaceData, Workspace>(`/workspaces/${id}`);
}

export function useDeleteWorkspace(id: string) {
  return useDeleteApi(`/workspaces/${id}`);
}

// Member Management Hooks
export function useWorkspaceMembers(workspaceId: string) {
  return useFetchApi<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
}

export function useInviteMember(workspaceId: string) {
  return useCreateApi<InviteMemberData, WorkspaceMember>(
    `/workspaces/${workspaceId}/members/invite`
  );
}

export function useUpdateMemberRole(workspaceId: string, memberId: string) {
  return useUpdateApi<UpdateMemberRoleData, WorkspaceMember>(
    `/workspaces/${workspaceId}/members/${memberId}/role`
  );
}

export function useRemoveMember(workspaceId: string, memberId: string) {
  return useDeleteApi(`/workspaces/${workspaceId}/members/${memberId}`);
}

export function useLeaveWorkspace(workspaceId: string) {
  return useCreateApi<void, { message: string }>(
    `/workspaces/${workspaceId}/leave`
  );
}

// Stats Hook
export function useWorkspaceStats(workspaceId: string) {
  return useFetchApi<{
    memberCount: number;
    boardCount: number;
    taskCount: number;
  }>(`/workspaces/${workspaceId}/stats`);
}
