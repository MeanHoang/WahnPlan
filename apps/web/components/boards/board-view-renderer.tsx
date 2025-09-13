"use client";

import { StatusColumn } from "@/components/boards/status-column";
import { AssigneeColumn } from "@/components/boards/assignee-column";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

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
        // Show only current user's tasks
        const currentUser = assignees.find((a) => a.id === currentUserId);
        if (!currentUser) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">No user information available</p>
            </div>
          );
        }
        return (
          <AssigneeColumn
            assignee={currentUser}
            boardId={boardId}
            onTaskClick={onTaskClick}
          />
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
    <div className="flex-1 p-6 bg-gray-50">
      <div
        className="flex gap-6 overflow-x-auto pb-4 h-full"
        style={{ alignItems: "flex-start" }}
      >
        {renderView()}
      </div>
    </div>
  );
}
