import { useState, useCallback } from "react";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { Task } from "@/types/task";
import { useUpdateApi } from "./use-update-api";
import { useToast } from "./use-toast";

interface UseTaskDragDropProps {
  onTaskMove?: (
    taskId: string,
    newStatusId: string,
    originalTask: Task
  ) => void;
  onTaskMoveStart?: (task: Task) => void;
  onTaskMoveEnd?: () => void;
  onTaskMoveError?: (
    taskId: string,
    originalStatusId: string,
    error: any
  ) => void;
}

export function useTaskDragDrop({
  onTaskMove,
  onTaskMoveStart,
  onTaskMoveEnd,
  onTaskMoveError,
}: UseTaskDragDropProps = {}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const { mutate: updateTask, loading: isUpdating } = useUpdateApi<
    { taskStatusId: string },
    Task
  >("/tasks", {
    onSuccess: () => {
      console.log("Task status updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update task status:", error);
    },
  });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const taskData = active.data.current as { task: Task };

      if (taskData?.task) {
        setActiveTask(taskData.task);
        onTaskMoveStart?.(taskData.task);
      }
    },
    [onTaskMoveStart]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
    // Could highlight drop zones or show preview
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveTask(null);

      if (!over) return;

      const taskData = active.data.current as { task: Task };
      const statusId = over.id as string;

      if (!taskData?.task) return;

      // Check if task is being moved to a different status
      if (taskData.task.taskStatusId === statusId) {
        return; // No change needed
      }

      const originalTask = { ...taskData.task };
      const originalStatusId = originalTask.taskStatusId || "";

      try {
        // Optimistic update - call callback immediately with original task for rollback
        onTaskMove?.(taskData.task.id, statusId, originalTask);

        // Update task status via API (fire and forget)
        updateTask(
          { taskStatusId: statusId },
          {
            endpoint: `/tasks/${taskData.task.id}`,
            method: "PATCH",
          }
        );

        // Show success toast immediately for better UX
        toast({
          title: "Task moved successfully",
          description: `Task moved to new status`,
        });

        // Don't call onTaskMoveEnd to avoid refresh - let optimistic update handle it
      } catch (error) {
        console.error("Failed to move task:", error);

        // Rollback optimistic update
        onTaskMoveError?.(taskData.task.id, originalStatusId, error);

        toast({
          title: "Failed to move task",
          description: "Task moved back to original position",
          variant: "destructive",
        });
      }
    },
    [onTaskMove, onTaskMoveError, updateTask, toast]
  );

  return {
    activeTask,
    isUpdating,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
