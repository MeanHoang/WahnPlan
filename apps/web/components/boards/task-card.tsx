"use client";

import { MessageCircle, Calendar, User } from "lucide-react";
import { Task, TaskPriority, TaskInitiative } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps): JSX.Element {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getPriorityColor = (priority?: TaskPriority) => {
    if (!priority) return "bg-gray-100 text-gray-800";

    switch (priority.name.toLowerCase()) {
      case "high":
        return "bg-pink-100 text-pink-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitiativeColor = (initiative?: TaskInitiative) => {
    if (!initiative) return "bg-gray-100 text-gray-800";

    switch (initiative.name.toLowerCase()) {
      case "improvement":
        return "bg-yellow-100 text-yellow-800";
      case "tech debt":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(task)}
    >
      {/* Title */}
      <h3 className="font-medium text-gray-900 mb-3 line-clamp-2 text-sm leading-5">
        {task.title}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {task.taskPriority && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.taskPriority)}`}
          >
            {task.taskPriority.name}
          </span>
        )}
        {task.taskInitiative && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getInitiativeColor(task.taskInitiative)}`}
          >
            {task.taskInitiative.name}
          </span>
        )}
      </div>

      {/* Date */}
      {task.dueDate && (
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex items-center gap-1">
          {task.taskMembers.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
              title={
                member.user.publicName ||
                member.user.fullname ||
                member.user.email
              }
            >
              {member.user.avatarUrl ? (
                <img
                  src={member.user.avatarUrl}
                  alt={
                    member.user.publicName ||
                    member.user.fullname ||
                    member.user.email
                  }
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                (
                  member.user.publicName ||
                  member.user.fullname ||
                  member.user.email
                )
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>
          ))}
          {task.taskMembers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              +{task.taskMembers.length - 3}
            </div>
          )}
        </div>

        {/* Comments */}
        {task._count.taskComments > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MessageCircle className="h-3 w-3" />
            <span>{task._count.taskComments}</span>
          </div>
        )}
      </div>
    </div>
  );
}
