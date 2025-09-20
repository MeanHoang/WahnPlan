"use client";

import {
  MessageCircle,
  Calendar,
  User,
  GripVertical,
  CheckCircle,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority, TaskInitiative } from "@/types/task";
import {
  getPriorityStyle,
  getInitiativeStyle,
  getTaskAttributeClasses,
  getDueDateBackgroundClasses,
} from "@/lib/task-attribute-helpers";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `task-${task.id}`,
      data: {
        task,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-2xl border-2 p-5 shadow-sm transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
        isDragging
          ? "border-blue-400 shadow-xl opacity-50 bg-white"
          : getDueDateBackgroundClasses(task.dueDate, task.isDone) +
            " hover:shadow-lg"
      }`}
      onClick={() => onClick?.(task)}
    >
      {/* Drag handle - small area in top right */}
      <div
        className="absolute top-2 right-2 w-6 h-6 cursor-grab active:cursor-grabbing z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()} // Prevent click event from bubbling
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-5 flex-1">
          {task.title}
        </h3>
        {task.isDone && (
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {task.taskPriority && (
          <span
            className={getTaskAttributeClasses()}
            style={getPriorityStyle(task.taskPriority)}
          >
            {task.taskPriority.name}
          </span>
        )}
        {task.taskInitiative && (
          <span
            className={getTaskAttributeClasses()}
            style={getInitiativeStyle(task.taskInitiative)}
          >
            {task.taskInitiative.name}
          </span>
        )}
      </div>

      {/* Date */}
      {task.dueDate && (
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex items-center gap-1.5">
          {task.taskMembers.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-semibold text-blue-700 border border-blue-200 shadow-sm"
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
                  className="w-7 h-7 rounded-full border border-blue-200"
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
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border border-gray-200 shadow-sm">
              +{task.taskMembers.length - 3}
            </div>
          )}
        </div>

        {/* Comments */}
        {task._count.taskComments > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
            <MessageCircle className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{task._count.taskComments}</span>
          </div>
        )}
      </div>
    </div>
  );
}
