"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useBoard } from "@/hooks/use-board-api";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useToast } from "@/hooks/use-toast";
import { StatusColumn } from "@/components/boards/status-column";
import { CreateTaskModal } from "@/components/boards/create-task-modal";
import { Board } from "@/types/board-core";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

export default function BoardDetailPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");

  const { data: boardData, loading: boardLoading } = useBoard(boardId);

  // Tasks are now fetched by individual columns

  // Fetch statuses
  const {
    data: statuses,
    loading: statusesLoading,
    error: statusesError,
    refetch: refetchStatuses,
  } = useFetchApi<TaskStatus[]>("/task-status", { boardId });

  // Fetch priorities
  const {
    data: priorities,
    loading: prioritiesLoading,
    error: prioritiesError,
  } = useFetchApi<TaskPriority[]>("/task-priority", { boardId });

  // Fetch initiatives
  const {
    data: initiatives,
    loading: initiativesLoading,
    error: initiativesError,
  } = useFetchApi<TaskInitiative[]>("/task-initiative", { boardId });

  // Tasks are now managed by individual columns

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (boardData) {
      setBoard(boardData);
    }
  }, [boardData]);

  // Error handling is now managed by individual columns

  useEffect(() => {
    if (statusesError) {
      toast({
        title: "Error",
        description: "Failed to load task statuses. Please try again.",
        variant: "destructive",
      });
    }
  }, [statusesError, toast]);

  useEffect(() => {
    if (prioritiesError) {
      toast({
        title: "Error",
        description: "Failed to load task priorities. Please try again.",
        variant: "destructive",
      });
    }
  }, [prioritiesError, toast]);

  useEffect(() => {
    if (initiativesError) {
      toast({
        title: "Error",
        description: "Failed to load task initiatives. Please try again.",
        variant: "destructive",
      });
    }
  }, [initiativesError, toast]);

  const handleBackToBoards = () => {
    router.push(`/workspace/${workspaceId}/boards`);
  };

  const handleTaskClick = (task: Task) => {
    // TODO: Open task detail modal or navigate to task page
    console.log("Task clicked:", task);
  };

  const handleAddTask = (statusId: string) => {
    setSelectedStatusId(statusId);
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // TODO: Refresh individual columns when task is created
    toast({
      title: "Success",
      description: "Task created successfully!",
      variant: "default",
    });
  };

  if (
    authLoading ||
    boardLoading ||
    statusesLoading ||
    prioritiesLoading ||
    initiativesLoading
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !board) {
    return <></>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToBoards}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                {board.title}
              </h1>
              {board.subtitle && (
                <p className="text-gray-600 mt-1">{board.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/workspace/${workspaceId}/board/${boardId}/settings`
                )
              }
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 bg-gray-50">
        <div
          className="flex gap-6 overflow-x-auto pb-4 h-full"
          style={{ alignItems: "flex-start" }}
        >
          {statuses?.map((status) => (
            <StatusColumn
              key={status.id}
              status={status}
              boardId={boardId}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        boardId={boardId}
        statusId={selectedStatusId}
        statuses={statuses || []}
        priorities={priorities || []}
        initiatives={initiatives || []}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
