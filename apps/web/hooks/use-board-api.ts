import { useFetchApi } from "./use-fetch-api";
import { useCreateApi } from "./use-create-api";
import { useUpdateApi } from "./use-update-api";
import { useDeleteApi } from "./use-delete-api";
import { Board, BoardStats } from "@/types/board-core";
import { CreateBoardData, UpdateBoardData } from "@/types/board-requests";

// Hook for fetching boards by workspace
export function useBoards(workspaceId: string) {
  return useFetchApi<Board[]>(`/boards?workspaceId=${workspaceId}`);
}

// Hook for fetching a single board
export function useBoard(boardId: string) {
  return useFetchApi<Board>(`/boards/${boardId}`);
}

// Hook for fetching board statistics
export function useBoardStats(boardId: string) {
  return useFetchApi<BoardStats>(`/boards/${boardId}/stats`);
}

// Hook for creating a board
export function useCreateBoard() {
  return useCreateApi<CreateBoardData, Board>("/boards");
}

// Hook for updating a board
export function useUpdateBoard(boardId: string) {
  return useUpdateApi<UpdateBoardData, Board>(`/boards/${boardId}`);
}

// Hook for deleting a board
export function useDeleteBoard(boardId: string) {
  return useDeleteApi(`/boards/${boardId}`);
}
