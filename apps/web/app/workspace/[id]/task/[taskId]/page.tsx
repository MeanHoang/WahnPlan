"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-request";
import { Task, TaskPriority, TaskInitiative, TaskStatus } from "@/types/task";
import { TaskHeader } from "@/components/task-detail/task-header";
import { TaskTitle } from "@/components/task-detail/task-title";
import { TaskAttributes } from "@/components/task-detail/task-attributes";
import { TaskDescription } from "@/components/task-detail/task-description";
import { TaskComments } from "@/components/task-detail/task-comments";

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
          "title",
          "taskStatusId",
          "taskInitiativeId",
          "taskPriorityId",
          "okr",
          "assigneeId",
          "reviewerId",
          "testerId",
          "isDone",
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
          "dueDate",
        ];

        if (allowedFields.includes(field)) {
          // Handle boolean fields
          if (field === "isDone") {
            updateData[field] = value === "true";
          } else {
            updateData[field] = value;
          }
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
      {/* Outer Wrapper */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <TaskHeader
          hasChanges={hasChanges}
          isUpdating={isUpdating}
          onBack={handleBackToBoard}
          onSave={handleSaveChanges}
        />

        {/* Task Details */}
        <div className="p-6 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl w-full flex flex-col items-center">
              {/* Title */}
            <TaskTitle
              task={task}
              pendingUpdates={pendingUpdates}
              onFieldChange={handleFieldChange}
            />

            {/* Task Attributes */}
            <TaskAttributes
              task={task}
              pendingUpdates={pendingUpdates}
              priorities={priorities || []}
              initiatives={initiatives || []}
              statuses={statuses || []}
              availableUsers={availableUsers}
              onFieldChange={handleFieldChange}
            />

            {/* Description Section */}
            <TaskDescription task={task} />

            {/* Comments Section */}
            <TaskComments taskId={taskId} />
          </div>
        </div>
      </div>
    </div>
  );
}
