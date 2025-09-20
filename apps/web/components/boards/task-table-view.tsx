"use client";

import { useState, useEffect } from "react";
import { useFetchApi } from "@/hooks/use-fetch-api";
import {
  MessageCircle,
  Calendar,
  User,
  Flag,
  Target,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Task, TaskPriority, TaskInitiative, TaskStatus } from "@/types/task";
import { useTranslation } from "@/contexts/language-context";

interface DateRange {
  from?: Date;
  to?: Date;
}
import {
  getPriorityStyle,
  getStatusStyle,
  getInitiativeStyle,
  getStatusDotStyle,
  getTaskAttributeClasses,
  getStatusDotClasses,
  getDueDateTableRowClasses,
} from "@/lib/task-attribute-helpers";

interface TaskTableViewProps {
  tasks: Task[] | { data: Task[]; pagination: any };
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
  boardId?: string;
  filters?: {
    statusIds: string[];
    priorityIds: string[];
    initiativeIds: string[];
    assigneeIds: string[];
    reviewerIds: string[];
    baIds: string[];
    memberIds: string[];
    dueDateRange?: DateRange;
    createdAtRange?: DateRange;
  };
}

export function TaskTableView({
  tasks,
  onTaskClick,
  onAddTask,
  boardId,
  filters,
}: TaskTableViewProps): JSX.Element {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const TASKS_PER_PAGE = 5;

  // Build query parameters for paginated tasks
  const buildTasksQuery = (page: number) => {
    const params = new URLSearchParams();

    if (boardId) {
      params.set("boardId", boardId);
    }

    if (filters?.statusIds && filters.statusIds.length > 0) {
      params.set("taskStatusIds", filters.statusIds.join(","));
    }
    if (filters?.priorityIds && filters.priorityIds.length > 0) {
      params.set("taskPriorityIds", filters.priorityIds.join(","));
    }
    if (filters?.initiativeIds && filters.initiativeIds.length > 0) {
      params.set("taskInitiativeIds", filters.initiativeIds.join(","));
    }
    if (filters?.assigneeIds && filters.assigneeIds.length > 0) {
      params.set("assigneeIds", filters.assigneeIds.join(","));
    }
    if (filters?.reviewerIds && filters.reviewerIds.length > 0) {
      params.set("reviewerIds", filters.reviewerIds.join(","));
    }
    if (filters?.baIds && filters.baIds.length > 0) {
      params.set("baIds", filters.baIds.join(","));
    }
    if (filters?.memberIds && filters.memberIds.length > 0) {
      params.set("memberIds", filters.memberIds.join(","));
    }

    // Add due date range filters
    if (filters?.dueDateRange?.from) {
      params.set(
        "dueDateFrom",
        filters.dueDateRange.from.toISOString().split("T")[0] || ""
      );
    }
    if (filters?.dueDateRange?.to) {
      params.set(
        "dueDateTo",
        filters.dueDateRange.to.toISOString().split("T")[0] || ""
      );
    }

    // Add created date range filters
    if (filters?.createdAtRange?.from) {
      params.set(
        "createdAtFrom",
        filters.createdAtRange.from.toISOString().split("T")[0] || ""
      );
    }
    if (filters?.createdAtRange?.to) {
      params.set(
        "createdAtTo",
        filters.createdAtRange.to.toISOString().split("T")[0] || ""
      );
    }

    params.set("page", page.toString());
    params.set("limit", TASKS_PER_PAGE.toString());

    // Add sorting parameters
    if (sortField && sortDirection) {
      params.set("sortBy", sortField);
      params.set("sortOrder", sortDirection);
    }

    return `/tasks?${params.toString()}`;
  };

  // Fetch tasks with pagination
  const { data: paginatedTasks, loading: fetchLoading } = useFetchApi<{
    data: Task[];
    pagination: any;
  }>(filters && boardId ? buildTasksQuery(currentPage) : "");

  // Reset tasks when filters, boardId, or sorting change
  useEffect(() => {
    setAllTasks([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [filters, boardId, sortField, sortDirection]);

  // Update tasks when new data comes in
  useEffect(() => {
    if (paginatedTasks) {
      if (currentPage === 1) {
        setAllTasks(paginatedTasks.data);
      } else {
        // Avoid duplicates by filtering out existing task IDs
        setAllTasks((prev) => {
          const existingIds = new Set(prev.map((task) => task.id));
          const newTasks = paginatedTasks.data.filter(
            (task) => !existingIds.has(task.id)
          );
          return [...prev, ...newTasks];
        });
      }

      // Check if there are more pages
      const totalPages = Math.ceil(
        paginatedTasks.pagination.total / TASKS_PER_PAGE
      );

      // Also check if we received fewer tasks than expected (end of data)
      const receivedTasksCount = paginatedTasks.data.length;
      setHasMore(
        currentPage < totalPages && receivedTasksCount === TASKS_PER_PAGE
      );
      setLoading(false);
    }
  }, [paginatedTasks, currentPage]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Use allTasks for display, fallback to props tasks
  const tasksArray =
    allTasks.length > 0
      ? allTasks
      : Array.isArray(tasks)
        ? tasks
        : tasks?.data || [];

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

  const handleSort = (field: string) => {
    // Map frontend field names to backend field names
    const backendFieldMap: { [key: string]: string } = {
      createdAt: "createdAt", // Frontend uses createdAt, backend expects createdAt (mapped in buildOrderBy)
      title: "title",
      dueDate: "dueDate",
      priority: "priority",
      status: "status",
      initiative: "initiative",
      sizeCard: "sizeCard",
    };

    const backendField = backendFieldMap[field] || field;

    if (sortField === backendField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(backendField);
      setSortDirection("asc");
    }
  };

  // No client-side sorting needed - server handles sorting
  const sortedTasks = tasksArray;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto w-full max-h-[calc(100vh-200px)]">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4 px-6 py-4 text-sm font-semibold text-gray-700 w-full">
          <div
            className="flex-1 min-w-[300px] flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("title")}
          >
            <FileText className="h-4 w-4" />
            {t("taskTable.taskName")}
            {sortField === "title" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="w-[220px] flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("createdAt")}
          >
            <Calendar className="h-4 w-4" />
            {t("taskTable.createdTime")}
            {sortField === "createdAt" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div className="w-[180px] flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("taskTable.members")}
          </div>
          <div
            className="w-[100px] flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("sizeCard")}
          >
            <FileText className="h-4 w-4" />
            {t("taskTable.sizeCard")}
            {sortField === "sizeCard" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="w-[100px] flex items-center justify-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("priority")}
          >
            <Flag className="h-4 w-4" />
            {t("taskTable.priority")}
            {sortField === "priority" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="w-[120px] flex items-center justify-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("initiative")}
          >
            <Target className="h-4 w-4" />
            {t("taskTable.initiative")}
            {sortField === "initiative" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="w-[100px] flex items-center justify-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("status")}
          >
            <Target className="h-4 w-4" />
            {t("taskTable.status")}
            {sortField === "status" && (
              <span className="text-xs">
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div
            className="w-[120px] flex items-center gap-2 cursor-pointer hover:text-gray-900"
            onClick={() => handleSort("dueDate")}
          >
            <Calendar className="h-4 w-4" />
            {t("taskTable.dueDate")}
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
            <p className="text-lg font-medium">{t("taskTable.noTasksFound")}</p>
            <p className="text-sm">{t("taskTable.noAssignedTasks")}</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors w-full ${getDueDateTableRowClasses(task.dueDate, task.isDone)}`}
              onClick={() => onTaskClick(task)}
            >
              {/* Task Name */}
              <div className="flex-1 min-w-[300px] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate flex-1">
                      {task.title}
                    </p>
                    {task.isDone && (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
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
              <div className="w-[220px] flex items-center text-sm text-gray-600">
                {formatDate(task.createdAt)}
              </div>

              {/* Members */}
              <div className="w-[180px] flex items-center gap-1">
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
              <div className="w-[100px] flex items-center text-sm text-gray-600">
                {task.sizeCard || "-"}
              </div>

              {/* Priority */}
              <div className="w-[100px] flex items-center justify-center">
                {task.taskPriority ? (
                  <span
                    className={getTaskAttributeClasses()}
                    style={getPriorityStyle(task.taskPriority)}
                  >
                    {task.taskPriority.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Initiative */}
              <div className="w-[120px] flex items-center justify-center">
                {task.taskInitiative ? (
                  <span
                    className={getTaskAttributeClasses()}
                    style={getInitiativeStyle(task.taskInitiative)}
                  >
                    {task.taskInitiative.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Status */}
              <div className="w-[100px] flex items-center justify-center">
                {task.taskStatus ? (
                  <span
                    className={`${getTaskAttributeClasses()} flex items-center gap-1`}
                    style={getStatusStyle(task.taskStatus)}
                  >
                    <div
                      className={getStatusDotClasses()}
                      style={getStatusDotStyle(task.taskStatus)}
                    ></div>
                    {task.taskStatus.title}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Due Date */}
              <div className="w-[120px] flex items-center text-sm text-gray-600">
                {task.dueDate ? formatDueDate(task.dueDate) : "-"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && tasksArray.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleLoadMore}
            disabled={loading || fetchLoading}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || fetchLoading
              ? t("common.loading")
              : t("common.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
