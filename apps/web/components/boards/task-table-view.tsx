"use client";

import { useState } from "react";
import {
  MessageCircle,
  Calendar,
  User,
  Flag,
  Target,
  FileText,
} from "lucide-react";
import { Task, TaskPriority, TaskInitiative, TaskStatus } from "@/types/task";

interface TaskTableViewProps {
  tasks: Task[] | { data: Task[]; pagination: any };
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
}

export function TaskTableView({
  tasks,
  onTaskClick,
  onAddTask,
}: TaskTableViewProps): JSX.Element {
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Extract tasks array from response
  const tasksArray = Array.isArray(tasks) ? tasks : tasks?.data || [];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatDueDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getPriorityStyle = (priority?: TaskPriority) => {
    if (!priority) return { backgroundColor: "#f3f4f6", color: "#1f2937" };

    // Use hex color directly from API response
    const hexColor = priority.color;

    // Ensure hex color is valid
    if (!hexColor || !hexColor.startsWith("#")) {
      return { backgroundColor: "#f3f4f6", color: "#1f2937" };
    }

    const backgroundColor = hexColor + "20"; // Add 20% opacity
    const textColor = hexColor;

    return { backgroundColor, color: textColor };
  };

  const getStatusStyle = (status?: TaskStatus) => {
    if (!status) return { backgroundColor: "#f3f4f6", color: "#1f2937" };

    // Use hex color directly from API response
    const hexColor = status.color;

    // Ensure hex color is valid
    if (!hexColor || !hexColor.startsWith("#")) {
      return { backgroundColor: "#f3f4f6", color: "#1f2937" };
    }

    const backgroundColor = hexColor + "20"; // Add 20% opacity
    const textColor = hexColor;

    return { backgroundColor, color: textColor };
  };

  const getInitiativeStyle = (initiative?: TaskInitiative) => {
    if (!initiative) return { backgroundColor: "#f3f4f6", color: "#1f2937" };

    // Use hex color directly from API response
    const hexColor = initiative.color;

    // Ensure hex color is valid
    if (!hexColor || !hexColor.startsWith("#")) {
      return { backgroundColor: "#f3f4f6", color: "#1f2937" };
    }

    const backgroundColor = hexColor + "20"; // Add 20% opacity
    const textColor = hexColor;

    return { backgroundColor, color: textColor };
  };

  const getStatusDotStyle = (status?: TaskStatus) => {
    if (!status) return { backgroundColor: "#6b7280" };

    // Use hex color directly from API response for status dot
    const hexColor = status.color;

    // Ensure hex color is valid
    if (!hexColor || !hexColor.startsWith("#")) {
      return { backgroundColor: "#6b7280" };
    }

    return { backgroundColor: hexColor };
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTasks = [...tasksArray].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "dueDate":
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case "priority":
        aValue = a.taskPriority?.name || "";
        bValue = b.taskPriority?.name || "";
        break;
      case "status":
        aValue = a.taskStatus?.title || "";
        bValue = b.taskStatus?.title || "";
        break;
      case "initiative":
        aValue = a.taskInitiative?.name || "";
        bValue = b.taskInitiative?.name || "";
        break;
      case "sizeCard":
        aValue = a.sizeCard || "";
        bValue = b.sizeCard || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-700">
          <div
            className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("title")}
          >
            <FileText className="h-4 w-4" />
            Task name
            {sortField === "title" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("createdAt")}
          >
            <Calendar className="h-4 w-4" />
            Created time
            {sortField === "createdAt" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Members
          </div>
          <div
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("sizeCard")}
          >
            <FileText className="h-4 w-4" />
            Size card
            {sortField === "sizeCard" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("priority")}
          >
            <Flag className="h-4 w-4" />
            Priority
            {sortField === "priority" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("initiative")}
          >
            <Target className="h-4 w-4" />
            Initiative
            {sortField === "initiative" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("status")}
          >
            <Target className="h-4 w-4" />
            Status
            {sortField === "status" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("dueDate")}
          >
            <Calendar className="h-4 w-4" />
            Due date
            {sortField === "dueDate" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {sortedTasks.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">You don't have any assigned tasks yet.</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onTaskClick(task)}
            >
              {/* Task Name */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  {task._count.taskComments > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <MessageCircle className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {task._count.taskComments}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Created Time */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                {formatDate(task.createdAt)}
              </div>

              {/* Members */}
              <div className="col-span-2 flex items-center gap-1">
                {task.taskMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-semibold text-blue-700 border border-blue-200 shadow-sm"
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
                        className="w-6 h-6 rounded-full border border-blue-200"
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border border-gray-200 shadow-sm">
                    +{task.taskMembers.length - 3}
                  </div>
                )}
              </div>

              {/* Size Card */}
              <div className="col-span-1 flex items-center text-sm text-gray-600">
                {task.sizeCard || "-"}
              </div>

              {/* Priority */}
              <div className="col-span-1 flex items-center">
                {task.taskPriority ? (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={getPriorityStyle(task.taskPriority)}
                  >
                    {task.taskPriority.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Initiative */}
              <div className="col-span-1 flex items-center">
                {task.taskInitiative ? (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={getInitiativeStyle(task.taskInitiative)}
                  >
                    {task.taskInitiative.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center">
                {task.taskStatus ? (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    style={getStatusStyle(task.taskStatus)}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={getStatusDotStyle(task.taskStatus)}
                    ></div>
                    {task.taskStatus.title}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Due Date */}
              <div className="col-span-1 flex items-center text-sm text-gray-600">
                {task.dueDate ? formatDueDate(task.dueDate) : "-"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
