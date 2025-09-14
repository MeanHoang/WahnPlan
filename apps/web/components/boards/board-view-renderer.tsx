"use client";

import { StatusColumn } from "@/components/boards/status-column";
import { AssigneeColumn } from "@/components/boards/assignee-column";
import { TaskTableView } from "@/components/boards/task-table-view";
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
}: BoardViewRendererProps): JSX.Element {
  const { user } = useAuth();

  // Fetch current user's tasks for Mine view using auth context
  const { data: userTasks, loading: userTasksLoading } = useFetchApi<Task[]>(
    user?.id
      ? `/tasks?boardId=${boardId}&assigneeId=${user.id}`
      : "/tasks?boardId="
  );
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
    <div className="flex-1 p-6 bg-gray-50 flex flex-col">
      {view === "mine" ? (
        // Full width for table view
        <div className="flex-1">{renderView()}</div>
      ) : (
        // Horizontal scroll for column views
        <div
          className="flex gap-6 overflow-x-auto flex-1"
          style={{ alignItems: "flex-start" }}
        >
          {renderView()}
        </div>
      )}
    </div>
  );
}
