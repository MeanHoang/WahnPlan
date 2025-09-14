"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { StatusColumn } from "@/components/boards/status-column";
import { AssigneeColumn } from "@/components/boards/assignee-column";
import { TaskTableView } from "@/components/boards/task-table-view";
import { TaskFilterBar } from "@/components/boards/task-filter-bar";
import { TaskCard } from "@/components/boards/task-card";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface DateRange {
  from?: Date;
  to?: Date;
}
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useAuth } from "@/contexts/auth-context";
import { useTaskDragDrop } from "@/hooks/use-task-drag-drop";

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

  // Drag and drop functionality
  const {
    activeTask,
    isUpdating,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useTaskDragDrop({
    onTaskMove: (taskId, newStatusId) => {
      // This will be called for optimistic updates
      console.log(`Task ${taskId} moved to status ${newStatusId}`);
    },
    onTaskMoveEnd: () => {
      // Trigger refresh of all columns after task move
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  // Advanced filters state
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
  const [selectedPriorityIds, setSelectedPriorityIds] = useState<string[]>([]);
  const [selectedInitiativeIds, setSelectedInitiativeIds] = useState<string[]>(
    []
  );
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [selectedBaIds, setSelectedBaIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedDueDateRange, setSelectedDueDateRange] = useState<DateRange>();
  const [selectedCreatedAtRange, setSelectedCreatedAtRange] =
    useState<DateRange>();
  const [showFilters, setShowFilters] = useState(false);

  // Refresh trigger for columns
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    if (selectedAssigneeIds.length > 0) {
      params.set("assigneeIds", selectedAssigneeIds.join(","));
    }
    if (selectedReviewerIds.length > 0) {
      params.set("reviewerIds", selectedReviewerIds.join(","));
    }
    if (selectedBaIds.length > 0) {
      params.set("baIds", selectedBaIds.join(","));
    }
    if (selectedMemberIds.length > 0) {
      params.set("memberIds", selectedMemberIds.join(","));
    }

    // Add due date range filters
    if (selectedDueDateRange?.from) {
      params.set(
        "dueDateFrom",
        selectedDueDateRange.from.toISOString().split("T")[0] || ""
      );
    }
    if (selectedDueDateRange?.to) {
      params.set(
        "dueDateTo",
        selectedDueDateRange.to.toISOString().split("T")[0] || ""
      );
    }

    // Add created date range filters
    if (selectedCreatedAtRange?.from) {
      params.set(
        "createdAtFrom",
        selectedCreatedAtRange.from.toISOString().split("T")[0] || ""
      );
    }
    if (selectedCreatedAtRange?.to) {
      params.set(
        "createdAtTo",
        selectedCreatedAtRange.to.toISOString().split("T")[0] || ""
      );
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
    assigneeIds: string[];
    reviewerIds: string[];
    baIds: string[];
    memberIds: string[];
    dueDateRange?: DateRange;
    createdAtRange?: DateRange;
  }) => {
    setSelectedStatusIds(filters.statusIds);
    setSelectedPriorityIds(filters.priorityIds);
    setSelectedInitiativeIds(filters.initiativeIds);
    setSelectedAssigneeIds(filters.assigneeIds);
    setSelectedReviewerIds(filters.reviewerIds);
    setSelectedBaIds(filters.baIds);
    setSelectedMemberIds(filters.memberIds);
    setSelectedDueDateRange(filters.dueDateRange);
    setSelectedCreatedAtRange(filters.createdAtRange);
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
                selectedAssigneeIds={selectedAssigneeIds}
                selectedReviewerIds={selectedReviewerIds}
                selectedBaIds={selectedBaIds}
                selectedMemberIds={selectedMemberIds}
                selectedDueDateRange={selectedDueDateRange}
                selectedCreatedAtRange={selectedCreatedAtRange}
                refreshTrigger={refreshTrigger}
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
                onAddTask={onAddTask}
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

      case "table":
        return (
          <TaskTableView
            tasks={[]}
            onTaskClick={onTaskClick}
            boardId={boardId}
            filters={{
              statusIds: selectedStatusIds,
              priorityIds: selectedPriorityIds,
              initiativeIds: selectedInitiativeIds,
              assigneeIds: selectedAssigneeIds,
              reviewerIds: selectedReviewerIds,
              baIds: selectedBaIds,
              memberIds: selectedMemberIds,
              dueDateRange: selectedDueDateRange,
              createdAtRange: selectedCreatedAtRange,
            }}
          />
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
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
        {/* Filter Bar */}
        {showFilters && (
          <TaskFilterBar
            statuses={statuses}
            priorities={priorities}
            initiatives={initiatives}
            assignees={assignees}
            selectedStatusIds={selectedStatusIds}
            selectedPriorityIds={selectedPriorityIds}
            selectedInitiativeIds={selectedInitiativeIds}
            selectedAssigneeIds={selectedAssigneeIds}
            selectedReviewerIds={selectedReviewerIds}
            selectedBaIds={selectedBaIds}
            selectedMemberIds={selectedMemberIds}
            selectedDueDateRange={selectedDueDateRange}
            selectedCreatedAtRange={selectedCreatedAtRange}
            onFiltersChange={handleFiltersChange}
          />
        )}

        {/* Board Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {view === "mine" ? (
            // Full width for table view
            <div className="flex-1 p-6 overflow-auto">{renderView()}</div>
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

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
