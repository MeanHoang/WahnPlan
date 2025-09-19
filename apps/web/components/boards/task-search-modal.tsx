"use client";

import { useState, useEffect } from "react";
import { Search, X, Calendar, User, Flag, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/task";
import { apiRequest } from "@/lib/api-request";
import { useTranslation } from "@/contexts/language-context";
import {
  getPriorityStyle,
  getStatusStyle,
  getInitiativeStyle,
  getTaskAttributeClasses,
} from "@/lib/task-attribute-helpers";

interface TaskSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onTaskClick: (task: Task) => void;
}

export function TaskSearchModal({
  isOpen,
  onClose,
  boardId,
  onTaskClick,
}: TaskSearchModalProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { t } = useTranslation();

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTasks([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, boardId]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const data = await apiRequest<{ data: Task[] }>("/tasks", {
        query: {
          boardId,
          search: query,
        },
      });
      setTasks(data.data || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      setTasks([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    onTaskClick(task);
    onClose();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("taskSearch.title")}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("taskSearch.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                {t("taskSearch.searching")}
              </span>
            </div>
          )}

          {!loading &&
            searchQuery.trim() &&
            hasSearched &&
            tasks.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t("taskSearch.noTasksFound")} "{searchQuery}"
                </p>
              </div>
            )}

          {!loading && searchQuery.trim() && tasks.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {t("taskSearch.foundTasks")} {tasks.length}{" "}
                {tasks.length !== 1
                  ? t("taskSearch.tasks")
                  : t("taskSearch.task")}
              </p>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {task.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.taskStatus && (
                          <span
                            className={getTaskAttributeClasses()}
                            style={getStatusStyle(task.taskStatus)}
                          >
                            {task.taskStatus.title}
                          </span>
                        )}

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

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t("taskSearch.due")} {formatDate(task.dueDate)}
                          </div>
                        )}

                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee.publicName ||
                              task.assignee.fullname ||
                              task.assignee.email}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("taskSearch.created")} {formatDate(task.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchQuery.trim() && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {t("taskSearch.startTypingToSearch")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            {t("taskSearch.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
