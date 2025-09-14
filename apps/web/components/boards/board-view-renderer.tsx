"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusColumn } from "@/components/boards/status-column";
import { AssigneeColumn } from "@/components/boards/assignee-column";
import { TaskTableView } from "@/components/boards/task-table-view";
import { TaskFilterBar } from "@/components/boards/task-filter-bar";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useAuth } from "@/contexts/auth-context";

interface BoardViewRendererProps {
  view: string;
  boardId: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  initiatives: TaskInitiative[];
  assignees: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  currentUserId?: string;
  onTaskClick: (task: Task) => void;
  onAddTask: (id: string) => void;
  onToggleFilters?: (toggleFn: () => void) => void;
}

export function BoardViewRenderer({
  view,
  boardId,
  statuses,
  priorities,
  initiatives,
  assignees,
  currentUserId,
  onTaskClick,
  onAddTask,
  onToggleFilters,
}: BoardViewRendererProps): JSX.Element {
  const { user } = useAuth();

  // Advanced filters state
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
  const [selectedPriorityIds, setSelectedPriorityIds] = useState<string[]>([]);
  const [selectedInitiativeIds, setSelectedInitiativeIds] = useState<string[]>(
    []
  );
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Set the toggle function for parent component (only once)
  useEffect(() => {
    if (onToggleFilters) {
      onToggleFilters(toggleFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Build query parameters for filtered tasks
  const buildTasksQuery = (additionalParams: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    params.set("boardId", boardId);

    if (selectedStatusIds.length > 0) {
      params.set("taskStatusIds", selectedStatusIds.join(","));
    }
    if (selectedPriorityIds.length > 0) {
      params.set("taskPriorityIds", selectedPriorityIds.join(","));
    }
    if (selectedInitiativeIds.length > 0) {
      params.set("taskInitiativeIds", selectedInitiativeIds.join(","));
    }

    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `/tasks?${params.toString()}`;
  };

  // Fetch current user's tasks for Mine view using auth context
  const { data: userTasks, loading: userTasksLoading } = useFetchApi<Task[]>(
    user?.id ? buildTasksQuery({ assigneeId: user.id }) : buildTasksQuery()
  );

  const handleFiltersChange = (filters: {
    statusIds: string[];
    priorityIds: string[];
    initiativeIds: string[];
  }) => {
    setSelectedStatusIds(filters.statusIds);
    setSelectedPriorityIds(filters.priorityIds);
    setSelectedInitiativeIds(filters.initiativeIds);
  };
  const renderView = () => {
    switch (view) {
      case "by-status":
        return (
          <>
            {statuses.map((status) => (
              <StatusColumn
                key={status.id}
                status={status}
                boardId={boardId}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
                selectedStatusIds={selectedStatusIds}
                selectedPriorityIds={selectedPriorityIds}
                selectedInitiativeIds={selectedInitiativeIds}
              />
            ))}
          </>
        );

      case "by-assignee":
        return (
          <>
            {assignees.map((assignee) => (
              <AssigneeColumn
                key={assignee.id}
                assignee={assignee}
                boardId={boardId}
                onTaskClick={onTaskClick}
              />
            ))}
          </>
        );

      case "mine":
        // Show current user's tasks in table view
        if (userTasksLoading) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your tasks...</p>
              </div>
            </div>
          );
        }
        return (
          <TaskTableView tasks={userTasks || []} onTaskClick={onTaskClick} />
        );

      case "by-priority":
        // TODO: Implement priority-based view
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Priority view coming soon</p>
          </div>
        );

      case "by-initiative":
        // TODO: Implement initiative-based view
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Initiative view coming soon</p>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Unknown view type</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Filter Bar */}
      {showFilters && (
        <TaskFilterBar
          statuses={statuses}
          priorities={priorities}
          initiatives={initiatives}
          selectedStatusIds={selectedStatusIds}
          selectedPriorityIds={selectedPriorityIds}
          selectedInitiativeIds={selectedInitiativeIds}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {/* Board Content */}
      <div className="flex-1 flex flex-col">
        {view === "mine" ? (
          // Full width for table view
          <div className="flex-1 p-6">{renderView()}</div>
        ) : (
          // Horizontal scroll for column views - scrollbar always visible at bottom
          <div
            className="flex-1 p-6 overflow-x-auto overflow-y-auto board-scroll-container"
            style={{ scrollbarGutter: "stable" }}
          >
            <div
              className="flex gap-6"
              style={{ alignItems: "flex-start", minWidth: "max-content" }}
            >
              {renderView()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
