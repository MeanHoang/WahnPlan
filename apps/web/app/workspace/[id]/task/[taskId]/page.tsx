"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Flag,
  Target,
  FileText,
  Code,
  CheckSquare,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-request";
import { Task } from "@/types/task";
import { TaskAttributeRow } from "@/components/task-detail/task-attribute-row";
import { TaskPriority, TaskInitiative, TaskStatus } from "@/types/task";
import { ColoredSelect } from "@/components/task-detail/colored-select";
import { UserSelector } from "@/components/task-detail/user-selector";

export default function TaskDetailPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, string>>(
    {}
  );

  // Update API hook
  const { mutate: updateTask, loading: isUpdating } = useUpdateApi<
    Partial<Task>,
    Task
  >(`/tasks/${taskId}`, {
    onSuccess: (updatedTask) => {
      setTask(updatedTask);
      setPendingUpdates({});
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Update task members API hook - we'll handle this manually
  // since the reorder endpoint has issues

  // Fetch task details
  const {
    data: taskData,
    loading: taskLoading,
    error: taskError,
  } = useFetchApi<Task>(`/tasks/${taskId}`);

  // Fetch select options - only fetch when we have task data and boardId
  const { data: priorities } = useFetchApi<Array<TaskPriority>>(
    taskData?.boardId
      ? `/task-priority?boardId=${taskData.boardId}`
      : "/task-priority?boardId="
  );
  const { data: initiatives } = useFetchApi<Array<TaskInitiative>>(
    taskData?.boardId
      ? `/task-initiative?boardId=${taskData.boardId}`
      : "/task-initiative?boardId="
  );
  const { data: statuses } = useFetchApi<Array<TaskStatus>>(
    taskData?.boardId
      ? `/task-status?boardId=${taskData.boardId}`
      : "/task-status?boardId="
  );

  // Fetch workspace members for user selection
  const { data: workspaceMembers } = useFetchApi<Array<any>>(
    workspaceId ? `/workspaces/${workspaceId}/members` : "/workspaces//members"
  );

  // Transform workspace members to user format
  const availableUsers =
    workspaceMembers?.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      fullname: member.user.fullname,
      publicName: member.user.publicName,
      avatarUrl: member.user.avatarUrl,
    })) || [];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (taskData) {
      setTask(taskData);
    }
  }, [taskData]);

  useEffect(() => {
    if (taskError) {
      toast({
        title: "Error",
        description: "Failed to load task details. Please try again.",
        variant: "destructive",
      });
    }
  }, [taskError, toast]);

  const handleBackToBoard = () => {
    // Go back to the previous page or board
    router.back();
  };

  const handleFieldChange = (field: string, value: string) => {
    setPendingUpdates((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!task || isUpdating || !hasChanges) return;

    try {
      // Prepare update data - only include fields that are allowed by the API
      const updateData: any = {};
      let hasMemberUpdates = false;
      let memberIds: string[] = [];

      Object.entries(pendingUpdates).forEach(([field, value]) => {
        // Handle members separately
        if (field === "memberIds") {
          hasMemberUpdates = true;
          memberIds = value ? value.split(",") : [];
          return;
        }

        // Only include fields that exist in the CreateTaskDto
        const allowedFields = [
          "taskStatusId",
          "taskInitiativeId",
          "taskPriorityId",
          "okr",
          "assigneeId",
          "reviewerId",
          "storyPoint",
          "sizeCard",
          "testCase",
          "goLive",
          "devMr",
          "baId",
          "staging",
          "note",
          "sprint",
          "featureCategories",
          "sprintGoal",
          "descriptionJson",
          "descriptionPlain",
          "noteJson",
          "notePlain",
          "attachments",
        ];

        if (allowedFields.includes(field)) {
          updateData[field] = value;
        }
      });

      // Update task fields first
      if (Object.keys(updateData).length > 0) {
        await updateTask(updateData);
      }

      // Update members separately if needed
      if (hasMemberUpdates) {
        try {
          // First, get current task members to delete them
          const currentMembers = task.taskMembers || [];

          // Delete existing task members
          for (const member of currentMembers) {
            await apiRequest(`/task-members/${member.id}`, {
              method: "DELETE",
            });
          }

          // Create new task members
          for (let i = 0; i < memberIds.length; i++) {
            await apiRequest("/task-members", {
              method: "POST",
              body: {
                taskId: taskId,
                userId: memberIds[i],
                position: i,
              },
            });
          }

          toast({
            title: "Success",
            description: "Task members updated successfully",
          });
        } catch (error) {
          console.error("Failed to update task members:", error);
          toast({
            title: "Error",
            description: "Failed to update task members",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // Error handling is done in the useUpdateApi hook
      console.error("Failed to update task:", error);
    }
  };

  if (authLoading || taskLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!user || !task) {
    return <></>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToBoard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          {hasChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
        {/* Large Title */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
        </div>
      </div>

      {/* Task Details */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-1">
            {/* Due Date */}
            <TaskAttributeRow
              icon={<Calendar className="h-5 w-5 text-gray-400" />}
              label="Due date"
            >
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  // TODO: Handle date update
                }}
              />
            </TaskAttributeRow>

            {/* Priority */}
            <TaskAttributeRow
              icon={<Flag className="h-5 w-5 text-gray-400" />}
              label="Priority"
            >
              <ColoredSelect
                value={
                  pendingUpdates.taskPriorityId || task.taskPriority?.id || ""
                }
                onChange={(value) => {
                  handleFieldChange("taskPriorityId", value);
                }}
                options={priorities || []}
                placeholder="Empty"
              />
            </TaskAttributeRow>

            {/* Initiative */}
            <TaskAttributeRow
              icon={<Target className="h-5 w-5 text-gray-400" />}
              label="Initiative"
            >
              <ColoredSelect
                value={
                  pendingUpdates.taskInitiativeId ||
                  task.taskInitiative?.id ||
                  ""
                }
                onChange={(value) => {
                  handleFieldChange("taskInitiativeId", value);
                }}
                options={initiatives || []}
                placeholder="Empty"
              />
            </TaskAttributeRow>

            {/* OKR */}
            <TaskAttributeRow
              icon={<FileText className="h-5 w-5 text-gray-400" />}
              label="OKR"
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                value={task.okr || ""}
                onChange={(e) => {
                  // TODO: Handle OKR update
                }}
              />
            </TaskAttributeRow>

            {/* Status */}
            <TaskAttributeRow
              icon={<Flag className="h-5 w-5 text-gray-400" />}
              label="Status"
            >
              <ColoredSelect
                value={pendingUpdates.taskStatusId || task.taskStatus?.id || ""}
                onChange={(value) => {
                  handleFieldChange("taskStatusId", value);
                }}
                options={
                  statuses?.map((status) => ({
                    id: status.id,
                    name: status.title,
                    color: status.color,
                  })) || []
                }
                placeholder="Empty"
              />
            </TaskAttributeRow>

            {/* Developer */}
            <TaskAttributeRow
              icon={<Code className="h-5 w-5 text-gray-400" />}
              label="Developer"
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                onChange={(e) => {
                  // TODO: Handle developer update
                }}
              />
            </TaskAttributeRow>

            {/* Assignee */}
            <TaskAttributeRow
              icon={<User className="h-5 w-5 text-gray-400" />}
              label="Assignee"
            >
              <UserSelector
                value={pendingUpdates.assigneeId || task.assignee?.id || ""}
                onChange={(value) => {
                  handleFieldChange("assigneeId", value as string);
                }}
                users={availableUsers}
                placeholder="Select assignee"
                multiple={false}
              />
            </TaskAttributeRow>

            {/* Members */}
            <TaskAttributeRow
              icon={<Users className="h-5 w-5 text-gray-400" />}
              label="Members"
            >
              <UserSelector
                value={
                  pendingUpdates.memberIds?.split(",") ||
                  task.taskMembers?.map((member) => member.user.id) ||
                  []
                }
                onChange={(value) => {
                  handleFieldChange(
                    "memberIds",
                    Array.isArray(value) ? value.join(",") : (value as string)
                  );
                }}
                users={availableUsers}
                placeholder="Select members"
                multiple={true}
              />
            </TaskAttributeRow>

            {/* Figma */}
            <TaskAttributeRow
              icon={<FileText className="h-5 w-5 text-gray-400" />}
              label="Figma"
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                onChange={(e) => {
                  // TODO: Handle figma update
                }}
              />
            </TaskAttributeRow>

            {/* Reviewer */}
            <TaskAttributeRow
              icon={<User className="h-5 w-5 text-gray-400" />}
              label="Reviewer"
            >
              <UserSelector
                value={pendingUpdates.reviewerId || task.reviewer?.id || ""}
                onChange={(value) => {
                  handleFieldChange("reviewerId", value as string);
                }}
                users={availableUsers}
                placeholder="Select reviewer"
                multiple={false}
              />
            </TaskAttributeRow>

            {/* Story Points */}
            <TaskAttributeRow
              icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
              label="Story points"
            >
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                value={task.storyPoint || ""}
                onChange={(e) => {
                  // TODO: Handle story points update
                }}
              />
            </TaskAttributeRow>

            {/* DEV | Development */}
            <TaskAttributeRow
              icon={<Code className="h-5 w-5 text-gray-400" />}
              label="DEV|Development"
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                value={task.devMr || ""}
                onChange={(e) => {
                  // TODO: Handle dev MR update
                }}
              />
            </TaskAttributeRow>

            {/* Size Card */}
            <TaskAttributeRow
              icon={<FileText className="h-5 w-5 text-gray-400" />}
              label="Size card"
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                value={task.sizeCard || ""}
                onChange={(e) => {
                  // TODO: Handle size card update
                }}
              />
            </TaskAttributeRow>

            {/* Test Case */}
            <TaskAttributeRow
              icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
              label="Test case"
            >
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                placeholder="Empty"
                value={task.testCase || ""}
                onChange={(e) => {
                  // TODO: Handle test case update
                }}
              />
            </TaskAttributeRow>

            {/* Go-live */}
            <TaskAttributeRow
              icon={<Play className="h-5 w-5 text-gray-400" />}
              label="Go-live"
            >
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={
                  task.goLive
                    ? new Date(task.goLive).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  // TODO: Handle go-live date update
                }}
              />
            </TaskAttributeRow>
          </div>

          {/* Description Section */}
          {(task.descriptionPlain || task.notePlain) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Description
              </h3>
              {task.descriptionPlain && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {task.descriptionPlain}
                  </p>
                </div>
              )}
              {task.notePlain && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {task.notePlain}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
