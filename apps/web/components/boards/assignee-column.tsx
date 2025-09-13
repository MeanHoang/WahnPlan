"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/boards/task-card";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { Task } from "@/types/task";

interface AssigneeColumnProps {
  assignee: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  boardId: string;
  onTaskClick: (task: Task) => void;
}

export function AssigneeColumn({
  assignee,
  boardId,
  onTaskClick,
}: AssigneeColumnProps): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks for this assignee
  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useFetchApi<Task[]>("/tasks", {
    boardId,
    assigneeId: assignee.id,
  });

  useEffect(() => {
    if (tasksData) {
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setLoading(false);
    }
  }, [tasksData]);

  useEffect(() => {
    setLoading(tasksLoading);
  }, [tasksLoading]);

  const taskCount = Array.isArray(tasks) ? tasks.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-80 flex-shrink-0">
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {assignee.avatar && assignee.avatar.trim() !== "" ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = "none";
                    const nextElement = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <User
                className="h-4 w-4 text-blue-600"
                style={{
                  display:
                    assignee.avatar && assignee.avatar.trim() !== ""
                      ? "none"
                      : "flex",
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {assignee.name}
              </h3>
              {assignee.email && (
                <p className="text-xs text-gray-500">{assignee.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {taskCount}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-3 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : tasksError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">
              Failed to load tasks. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchTasks()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No tasks assigned</p>
          </div>
        ) : Array.isArray(tasks) ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">Error loading tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
