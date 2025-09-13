"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useBoard } from "@/hooks/use-board-api";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { SortableItem } from "@/components/boards/sortable-item";
import { TaskAttributeDialog } from "@/components/boards/task-attribute-dialog";
import { Board } from "@/types/board-core";
import {
  TaskAttribute,
  TaskAttributeType,
  TaskStatus,
  TaskPriority,
  TaskInitiative,
} from "@/types/task-attributes";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function BoardSettingsPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<TaskAttribute | null>(null);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: boardData, loading: boardLoading } = useBoard(boardId);

  // Fetch APIs
  const {
    data: taskStatuses,
    loading: statusLoading,
    refetch: refetchStatuses,
  } = useFetchApi<TaskStatus[]>(`/task-status?boardId=${boardId}`);
  const {
    data: taskPriorities,
    loading: priorityLoading,
    refetch: refetchPriorities,
  } = useFetchApi<TaskPriority[]>(`/task-priority?boardId=${boardId}`);
  const {
    data: taskInitiatives,
    loading: initiativeLoading,
    refetch: refetchInitiatives,
  } = useFetchApi<TaskInitiative[]>(`/task-initiative?boardId=${boardId}`);

  // Create APIs
  const { mutate: createStatus } = useCreateApi<any, TaskStatus>(
    "/task-status",
    {
      onSuccess: () => refetchStatuses(),
    }
  );
  const { mutate: createPriority } = useCreateApi<any, TaskPriority>(
    "/task-priority",
    {
      onSuccess: () => refetchPriorities(),
    }
  );
  const { mutate: createInitiative } = useCreateApi<any, TaskInitiative>(
    "/task-initiative",
    {
      onSuccess: () => refetchInitiatives(),
    }
  );

  const [activeTab, setActiveTab] = useState<TaskAttributeType>("status");

  // Helper functions
  const getCurrentItems = () => {
    switch (activeTab) {
      case "status":
        return taskStatuses || [];
      case "priority":
        return taskPriorities || [];
      case "initiative":
        return taskInitiatives || [];
      default:
        return [];
    }
  };

  const getCurrentLength = () => {
    return getCurrentItems().length;
  };

  // API functions
  const updateItem = async (id: string, data: any) => {
    const { apiRequest } = await import("@/lib/api-request");
    const basePayload = { boardId, color: data.color };

    let endpoint = "";
    let payload = {};

    switch (activeTab) {
      case "status":
        endpoint = `/task-status/${id}`;
        payload = { ...basePayload, title: data.title };
        break;
      case "priority":
        endpoint = `/task-priority/${id}`;
        payload = { ...basePayload, name: data.name };
        break;
      case "initiative":
        endpoint = `/task-initiative/${id}`;
        payload = { ...basePayload, name: data.name };
        break;
    }

    const result = await apiRequest(endpoint, {
      method: "PATCH",
      body: payload,
    });

    // Refetch data
    switch (activeTab) {
      case "status":
        refetchStatuses();
        break;
      case "priority":
        refetchPriorities();
        break;
      case "initiative":
        refetchInitiatives();
        break;
    }

    return result;
  };

  const deleteItem = async (id: string) => {
    const { apiRequest } = await import("@/lib/api-request");

    let endpoint = "";
    switch (activeTab) {
      case "status":
        endpoint = `/task-status/${id}`;
        break;
      case "priority":
        endpoint = `/task-priority/${id}`;
        break;
      case "initiative":
        endpoint = `/task-initiative/${id}`;
        break;
    }

    const result = await apiRequest(endpoint, {
      method: "DELETE",
    });

    // Refetch data
    switch (activeTab) {
      case "status":
        refetchStatuses();
        break;
      case "priority":
        refetchPriorities();
        break;
      case "initiative":
        refetchInitiatives();
        break;
    }

    return result;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (boardData) {
      setBoard(boardData);
    }
  }, [boardData]);

  const handleBackToBoard = () => {
    router.push(`/workspace/${workspaceId}/board/${boardId}`);
  };

  const openCreateDialog = () => {
    setDialogType("create");
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: TaskAttribute) => {
    setDialogType("edit");
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (data: {
    title?: string;
    name?: string;
    color: string;
  }) => {
    try {
      if (dialogType === "create") {
        const basePayload = {
          boardId,
          color: data.color,
          position: getCurrentLength(),
        };

        switch (activeTab) {
          case "status":
            await createStatus({ ...basePayload, title: data.title });
            break;
          case "priority":
            await createPriority({ ...basePayload, name: data.name });
            break;
          case "initiative":
            await createInitiative({ ...basePayload, name: data.name });
            break;
        }
      } else if (editingItem) {
        await updateItem(editingItem.id, data);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = async (item: TaskAttribute) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItem(item.id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentItems = getCurrentItems();
    const oldIndex = currentItems.findIndex((item) => item.id === active.id);
    const newIndex = currentItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newItems = arrayMove(currentItems as any[], oldIndex, newIndex);

    // Update positions in the database
    try {
      const { apiRequest } = await import("@/lib/api-request");

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (!item) continue;

        const newPosition = i;
        if (item.position !== newPosition) {
          const endpoint =
            activeTab === "status"
              ? `/task-status/${item.id}`
              : activeTab === "priority"
                ? `/task-priority/${item.id}`
                : `/task-initiative/${item.id}`;

          await apiRequest(endpoint, {
            method: "PATCH",
            body: { position: newPosition },
          });
        }
      }

      // Refetch data
      switch (activeTab) {
        case "status":
          refetchStatuses();
          break;
        case "priority":
          refetchPriorities();
          break;
        case "initiative":
          refetchInitiatives();
          break;
      }
    } catch (error) {
      console.error("Error updating positions:", error);
    }
  };

  if (
    authLoading ||
    boardLoading ||
    statusLoading ||
    priorityLoading ||
    initiativeLoading
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !board) {
    return <></>;
  }

  const currentItems = getCurrentItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToBoard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-700">
                Board Settings
              </h1>
              <p className="text-gray-600 mt-1">{board.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "status" ? "default" : "outline"}
            onClick={() => setActiveTab("status")}
          >
            Task Statuses
          </Button>
          <Button
            variant={activeTab === "priority" ? "default" : "outline"}
            onClick={() => setActiveTab("priority")}
          >
            Task Priorities
          </Button>
          <Button
            variant={activeTab === "initiative" ? "default" : "outline"}
            onClick={() => setActiveTab("initiative")}
          >
            Task Initiatives
          </Button>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {activeTab === "status" && "Task Statuses"}
                  {activeTab === "priority" && "Task Priorities"}
                  {activeTab === "initiative" && "Task Initiatives"}
                </CardTitle>
                <CardDescription>
                  Manage{" "}
                  {activeTab === "status"
                    ? "statuses"
                    : activeTab === "priority"
                      ? "priorities"
                      : "initiatives"}{" "}
                  for tasks in this board
                </CardDescription>
              </div>
              <Button
                onClick={openCreateDialog}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add{" "}
                {activeTab === "status"
                  ? "Status"
                  : activeTab === "priority"
                    ? "Priority"
                    : "Initiative"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {currentItems.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                      onEdit={openEditDialog}
                      onDelete={handleDelete}
                    />
                  ))}
                  {currentItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No{" "}
                      {activeTab === "status"
                        ? "statuses"
                        : activeTab === "priority"
                          ? "priorities"
                          : "initiatives"}{" "}
                      found. Create your first one above.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <TaskAttributeDialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          activeTab={activeTab}
          dialogType={dialogType}
          editingItem={editingItem}
        />
      </div>
    </div>
  );
}
