"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Bell,
  CheckCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import {
  getStatusStyle,
  getTaskAttributeClasses,
} from "@/lib/task-attribute-helpers";
import { Task } from "@/types/task";

interface DeadlineManagerProps {
  boardId: string;
}

interface TaskWithDeadline extends Task {
  assignee?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  reviewer?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  tester?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
}

export function DeadlineManager({
  boardId,
}: DeadlineManagerProps): JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Fetch board with tasks
  const {
    data: boardData,
    loading,
    refetch,
  } = useFetchApi<any>(`/boards/${boardId}`);

  // Create notification API
  const { mutate: sendNotification } = useCreateApi<any, any>("/notifications");

  // Filter and categorize tasks
  const { overdue, dueSoon, dueLater } = useMemo(() => {
    if (!boardData?.tasks) return { overdue: [], dueSoon: [], dueLater: [] };

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Filter tasks that have due dates and are not done
    const tasksWithDeadlines = boardData.tasks.filter(
      (task: TaskWithDeadline) => task.dueDate && !task.isDone
    );

    return tasksWithDeadlines.reduce(
      (acc: any, task: TaskWithDeadline) => {
        const dueDate = new Date(task.dueDate!);

        if (dueDate < now) {
          acc.overdue.push(task);
        } else if (dueDate <= threeDaysFromNow) {
          acc.dueSoon.push(task);
        } else {
          acc.dueLater.push(task);
        }

        return acc;
      },
      {
        overdue: [] as TaskWithDeadline[],
        dueSoon: [] as TaskWithDeadline[],
        dueLater: [] as TaskWithDeadline[],
      }
    );
  }, [boardData]);

  const formatTimeRemaining = (dueDate: Date) => {
    const now = new Date();
    const diff = new Date(dueDate).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return `${Math.abs(days)} ${t("deadlineManager.daysOverdue")}`;
    } else if (days === 0) {
      return t("deadlineManager.dueToday");
    } else if (days === 1) {
      return t("deadlineManager.dueTomorrow");
    } else {
      return `${days} ${t("deadlineManager.daysRemaining")}`;
    }
  };

  const getPriorityColor = (dueDate: Date) => {
    const now = new Date();
    const diff = new Date(dueDate).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "destructive";
    if (days <= 1) return "destructive";
    if (days <= 3) return "secondary";
    return "default";
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = (tasks: TaskWithDeadline[]) => {
    const allTaskIds = tasks.map((task) => task.id);
    setSelectedTasks((prev) =>
      prev.length === allTaskIds.length ? [] : allTaskIds
    );
  };

  const handleTaskClick = (taskId: string) => {
    // Navigate to task detail page
    router.push(`/workspace/${boardData?.workspaceId}/task/${taskId}`);
  };

  const handleSendNotification = async (task: TaskWithDeadline) => {
    try {
      // Get all unique user IDs from task members, assignee, reviewer, tester
      const memberIds = task.taskMembers?.map((member) => member.userId) || [];
      const roleIds = [task.assigneeId, task.reviewerId, task.testerId].filter(
        Boolean
      );

      // Combine and deduplicate user IDs
      const allRecipients = [...new Set([...memberIds, ...roleIds])];

      for (const recipientId of allRecipients) {
        if (recipientId) {
          await sendNotification({
            userId: recipientId,
            type: "task_due_soon",
            title: t("deadlineManager.taskDeadlineReminder"),
            message: `${t("deadlineManager.task")} "${task.title}" ${t("deadlineManager.isDue")} ${formatTimeRemaining(task.dueDate!)}`,
            data: {
              taskId: task.id,
              boardId: task.boardId,
              dueDate: task.dueDate,
            },
          });
        }
      }

      toast({
        title: t("deadlineManager.notificationSent"),
        description: `${t("deadlineManager.deadlineReminderSent")} "${task.title}"`,
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("deadlineManager.failedToSendNotification"),
        variant: "destructive",
      });
    }
  };

  const handleBulkNotification = async () => {
    if (selectedTasks.length === 0) return;

    try {
      const tasksToNotify =
        boardData?.tasks?.filter((task: TaskWithDeadline) =>
          selectedTasks.includes(task.id)
        ) || [];

      for (const task of tasksToNotify) {
        await handleSendNotification(task);
      }

      setSelectedTasks([]);
      toast({
        title: t("deadlineManager.bulkNotificationSent"),
        description: `${t("deadlineManager.sentRemindersFor")} ${selectedTasks.length} ${t("deadlineManager.tasks")}`,
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("deadlineManager.failedToSendBulkNotifications"),
        variant: "destructive",
      });
    }
  };

  const renderTaskTable = (tasks: TaskWithDeadline[], title: string) => {
    if (tasks.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {tasks.length}
              </Badge>
            </div>
            {tasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(tasks)}
                className="text-xs"
              >
                {selectedTasks.length === tasks.length
                  ? t("deadlineManager.deselectAll")
                  : t("deadlineManager.selectAll")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-700 w-16">
                    {t("deadlineManager.select")}
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 w-64">
                    {t("deadlineManager.taskTitle")}
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 w-24">
                    {t("deadlineManager.members")}
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 w-28">
                    {t("deadlineManager.dueDate")}
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 w-32">
                    {t("deadlineManager.dueStatus")}
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 w-28">
                    {t("deadlineManager.taskStatus")}
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 w-24">
                    {t("deadlineManager.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`border-b hover:bg-gray-50 ${
                      selectedTasks.includes(task.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleSelectTask(task.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleTaskClick(task.id)}
                        className="font-medium text-left hover:text-blue-600 hover:underline transition-colors break-words"
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {task.taskMembers && task.taskMembers.length > 0 ? (
                          task.taskMembers.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-1"
                            >
                              {member.user.avatarUrl ? (
                                <img
                                  src={member.user.avatarUrl}
                                  alt={
                                    member.user.publicName ||
                                    member.user.fullname ||
                                    "User"
                                  }
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {(
                                      member.user.publicName ||
                                      member.user.fullname ||
                                      "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500">
                              {t("deadlineManager.noMembers")}
                            </span>
                          </div>
                        )}
                        {task.taskMembers && task.taskMembers.length > 3 && (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 ml-1">
                              +{task.taskMembers.length - 3}{" "}
                              {t("deadlineManager.more")}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : t("deadlineManager.noDueDate")}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={getPriorityColor(task.dueDate!) as any}>
                        {formatTimeRemaining(task.dueDate!)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {task.taskStatus ? (
                        <span
                          className={`${getTaskAttributeClasses()}`}
                          style={getStatusStyle(task.taskStatus)}
                        >
                          {task.taskStatus.title}
                        </span>
                      ) : (
                        <span
                          className={`${getTaskAttributeClasses()} bg-gray-100 text-gray-500`}
                        >
                          {t("deadlineManager.noStatus")}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendNotification(task)}
                        className="flex items-center gap-1"
                      >
                        <Bell className="h-4 w-4" />
                        {t("deadlineManager.notify")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {t("deadlineManager.loadingDeadlineTasks")}
          </p>
        </div>
      </div>
    );
  }

  const totalTasks = overdue.length + dueSoon.length + dueLater.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-600">
                  {t("deadlineManager.overdue")}
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {overdue.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-600">
                  {t("deadlineManager.dueSoon")}
                </p>
                <p className="text-2xl font-bold text-orange-700">
                  {dueSoon.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-600">
                  {t("deadlineManager.dueLater")}
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {dueLater.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("deadlineManager.total")}
                </p>
                <p className="text-2xl font-bold text-gray-700">{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-700">
                {selectedTasks.length} {t("deadlineManager.tasksSelected")}
              </p>
              <Button
                onClick={handleBulkNotification}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                {t("deadlineManager.sendBulkNotification")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Tables */}
      {renderTaskTable(overdue, t("deadlineManager.overdueTasks"))}
      {renderTaskTable(dueSoon, t("deadlineManager.dueSoonNext3Days"))}
      {renderTaskTable(dueLater, t("deadlineManager.dueLater"))}

      {totalTasks === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("deadlineManager.allCaughtUp")}
            </h3>
            <p className="text-gray-600">
              {t("deadlineManager.noTasksWithDeadlines")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
