"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { Task, TaskStatus, PaginatedResponse } from "@/types/task";

interface DateRange {
  from?: Date;
  to?: Date;
}
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useTranslation } from "@/contexts/language-context";

interface StatusColumnProps {
  status: TaskStatus;
  boardId: string;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (statusId: string) => void;
  selectedStatusIds?: string[];
  selectedPriorityIds?: string[];
  selectedInitiativeIds?: string[];
  selectedAssigneeIds?: string[];
  selectedReviewerIds?: string[];
  selectedBaIds?: string[];
  selectedMemberIds?: string[];
  selectedDueDateRange?: DateRange;
  selectedCreatedAtRange?: DateRange;
  refreshTrigger?: number; // Add refresh trigger prop
  onTaskMove?: (
    taskId: string,
    newStatusId: string,
    originalTask: Task
  ) => void;
  onTaskMoveError?: (
    taskId: string,
    originalStatusId: string,
    error: any
  ) => void;
  onRegisterHandlers?: (handlers: {
    onTaskMove: (
      taskId: string,
      newStatusId: string,
      originalTask: Task
    ) => void;
    onTaskMoveError: (
      taskId: string,
      originalStatusId: string,
      error: any
    ) => void;
  }) => void;
}

export function StatusColumn({
  status,
  boardId,
  onTaskClick,
  onAddTask,
  selectedStatusIds = [],
  selectedPriorityIds = [],
  selectedInitiativeIds = [],
  selectedAssigneeIds = [],
  selectedReviewerIds = [],
  selectedBaIds = [],
  selectedMemberIds = [],
  selectedDueDateRange,
  selectedCreatedAtRange,
  refreshTrigger,
  onTaskMove,
  onTaskMoveError,
  onRegisterHandlers,
}: StatusColumnProps): JSX.Element {
  const { t } = useTranslation();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const TASKS_PER_PAGE = 5;

  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  // Build query parameters with advanced filters
  const buildQueryParams = () => {
    const params: any = {
      boardId,
      taskStatusId: status.id,
      page: currentPage,
      limit: TASKS_PER_PAGE,
    };

    // Add advanced filters if they don't conflict with status filter
    if (selectedPriorityIds.length > 0) {
      params.taskPriorityIds = selectedPriorityIds.join(",");
    }
    if (selectedInitiativeIds.length > 0) {
      params.taskInitiativeIds = selectedInitiativeIds.join(",");
    }
    if (selectedAssigneeIds.length > 0) {
      params.assigneeIds = selectedAssigneeIds.join(",");
    }
    if (selectedReviewerIds.length > 0) {
      params.reviewerIds = selectedReviewerIds.join(",");
    }
    if (selectedBaIds.length > 0) {
      params.baIds = selectedBaIds.join(",");
    }
    if (selectedMemberIds.length > 0) {
      params.memberIds = selectedMemberIds.join(",");
    }

    // Add due date range filters
    if (selectedDueDateRange?.from) {
      params.dueDateFrom =
        selectedDueDateRange.from.toISOString().split("T")[0] || "";
    }
    if (selectedDueDateRange?.to) {
      params.dueDateTo =
        selectedDueDateRange.to.toISOString().split("T")[0] || "";
    }

    // Add created date range filters
    if (selectedCreatedAtRange?.from) {
      params.createdAtFrom =
        selectedCreatedAtRange.from.toISOString().split("T")[0] || "";
    }
    if (selectedCreatedAtRange?.to) {
      params.createdAtTo =
        selectedCreatedAtRange.to.toISOString().split("T")[0] || "";
    }

    return params;
  };

  const {
    data: tasksResponse,
    loading,
    refetch,
  } = useFetchApi<PaginatedResponse<Task>>("/tasks", buildQueryParams());

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllTasks([]);
  }, [
    selectedPriorityIds,
    selectedInitiativeIds,
    selectedAssigneeIds,
    selectedReviewerIds,
    selectedBaIds,
    selectedMemberIds,
    selectedDueDateRange,
    selectedCreatedAtRange,
  ]);

  // Refetch data when refreshTrigger changes (e.g., after task move)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refetch();
      setCurrentPage(1);
      setAllTasks([]);
    }
  }, [refreshTrigger, refetch]);

  // Update allTasks when new data comes in
  useEffect(() => {
    if (tasksResponse) {
      if (currentPage === 1) {
        // First page - replace all tasks
        setAllTasks(tasksResponse.data);
      } else {
        // Subsequent pages - append to existing tasks, avoiding duplicates
        setAllTasks((prev) => {
          const existingIds = new Set(prev.map((task) => task.id));
          const newTasks = tasksResponse.data.filter(
            (task) => !existingIds.has(task.id)
          );
          return [...prev, ...newTasks];
        });
      }
      setPagination(tasksResponse.pagination);
    }
  }, [tasksResponse, currentPage]);

  // Handle optimistic task moves - this will be called by parent component
  const handleOptimisticMove = useCallback(
    (taskId: string, newStatusId: string, originalTask: Task) => {
      // If task is moving TO this column
      if (newStatusId === status.id) {
        setAllTasks((prev) => {
          // Check if task already exists in this column (shouldn't happen)
          const existingIndex = prev.findIndex((task) => task.id === taskId);
          if (existingIndex !== -1) {
            return prev; // Already exists, don't add
          }

          // Add the task with updated status
          const updatedTask = { ...originalTask, taskStatusId: newStatusId };
          return [updatedTask, ...prev];
        });
      }
      // If task is moving FROM this column
      else if (originalTask.taskStatusId === status.id) {
        setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
    },
    [status.id]
  );

  const handleMoveError = useCallback(
    (taskId: string, originalStatusId: string, error: any) => {
      // If task should rollback TO this column
      if (originalStatusId === status.id) {
        setAllTasks((prev) => {
          // Check if task already exists (shouldn't happen after error)
          const existingIndex = prev.findIndex((task) => task.id === taskId);
          if (existingIndex !== -1) {
            return prev; // Already exists
          }

          // For rollback, we'll trigger a refetch to ensure consistency
          refetch();
          return prev;
        });
      }
      // If task should be removed from this column (rollback from here)
      else if (status.id !== originalStatusId) {
        setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
    },
    [status.id, refetch]
  );

  // Register handlers with parent component
  useEffect(() => {
    if (onRegisterHandlers) {
      onRegisterHandlers({
        onTaskMove: handleOptimisticMove,
        onTaskMoveError: handleMoveError,
      });
    }
  }, [handleOptimisticMove, handleMoveError, onRegisterHandlers]);

  const hasMoreTasks = pagination?.hasNext || false;
  const remainingTasks = pagination ? pagination.total - allTasks.length : 0;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-white rounded-lg border flex-none basis-[300px] transition-all duration-200 ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
      }`}
      style={{ width: 300, minWidth: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="font-semibold text-gray-900">{status.title}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {pagination?.total || 0}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex flex-col p-4 space-y-3 min-h-0 flex-1">
        {/* Visible Tasks */}
        {allTasks.map((task, index) => (
          <TaskCard
            key={`${task.id}-${index}`}
            task={task}
            onClick={onTaskClick}
          />
        ))}

        {/* Load More Button */}
        {hasMoreTasks && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={loading}
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            {loading
              ? t("common.loading")
              : `${t("common.loadMore")} ${Math.min(remainingTasks, TASKS_PER_PAGE)}`}
          </Button>
        )}

        {/* Add Task Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50"
          onClick={() => onAddTask?.(status.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("common.newTask")}
        </Button>
      </div>
    </div>
  );
}
