// Board Request Types
export interface CreateBoardData {
  workspaceId: string;
  title: string;
  subtitle?: string;
}

export interface UpdateBoardData {
  workspaceId?: string;
  title?: string;
  subtitle?: string;
}
