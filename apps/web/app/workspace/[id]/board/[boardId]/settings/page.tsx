"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useBoard } from "@/hooks/use-board-api";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useDeleteApi } from "@/hooks/use-delete-api";
import { Board } from "@/types/board-core";
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskStatus {
  id: string;
  title: string;
  color: string;
  position: number;
  _count: { tasks: number };
}

interface TaskPriority {
  id: string;
  name: string;
  color: string;
  position: number;
  _count: { tasks: number };
}

interface TaskInitiative {
  id: string;
  name: string;
  color: string;
  position: number;
  _count: { tasks: number };
}

// Sortable Item Component
function SortableItem({
  item,
  activeTab,
  onEdit,
  onDelete,
}: {
  item: TaskStatus | TaskPriority | TaskInitiative;
  activeTab: "status" | "priority" | "initiative";
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <div>
          <p className="font-medium">
            {activeTab === "status"
              ? (item as TaskStatus).title
              : (item as TaskPriority | TaskInitiative).name}
          </p>
          <p className="text-sm text-gray-500">{item._count.tasks} tasks</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function BoardSettingsPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [activeTab, setActiveTab] = useState<
    "status" | "priority" | "initiative"
  >("status");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    color: "#3B82F6",
  });

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
  const { mutate: createStatus, loading: createStatusLoading } = useCreateApi<
    any,
    TaskStatus
  >("/task-status", { onSuccess: () => refetchStatuses() });
  const { mutate: createPriority, loading: createPriorityLoading } =
    useCreateApi<any, TaskPriority>("/task-priority", {
      onSuccess: () => refetchPriorities(),
    });
  const { mutate: createInitiative, loading: createInitiativeLoading } =
    useCreateApi<any, TaskInitiative>("/task-initiative", {
      onSuccess: () => refetchInitiatives(),
    });

  // Update APIs - will be created dynamically with ID
  const updateStatus = async (data: any) => {
    const { mutate } = useUpdateApi<any, TaskStatus>(
      `/task-status/${editingItem.id}`
    );
    return mutate(data);
  };
  const updatePriority = async (data: any) => {
    const { mutate } = useUpdateApi<any, TaskPriority>(
      `/task-priority/${editingItem.id}`
    );
    return mutate(data);
  };
  const updateInitiative = async (data: any) => {
    const { mutate } = useUpdateApi<any, TaskInitiative>(
      `/task-initiative/${editingItem.id}`
    );
    return mutate(data);
  };

  // Delete APIs - using apiRequest directly
  const deleteStatus = async (id: string) => {
    const { apiRequest } = await import("@/lib/api-request");
    return apiRequest(`/task-status/${id}`, {
      method: "DELETE",
    });
  };
  const deletePriority = async (id: string) => {
    const { apiRequest } = await import("@/lib/api-request");
    return apiRequest(`/task-priority/${id}`, {
      method: "DELETE",
    });
  };
  const deleteInitiative = async (id: string) => {
    const { apiRequest } = await import("@/lib/api-request");
    return apiRequest(`/task-initiative/${id}`, {
      method: "DELETE",
    });
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
    setFormData({ title: "", name: "", color: "#3B82F6" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setDialogType("edit");
    setEditingItem(item);
    setFormData({
      title: item.title || item.name || "",
      name: item.name || item.title || "",
      color: item.color || "#3B82F6",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ title: "", name: "", color: "#3B82F6" });
  };

  const handleSubmit = async () => {
    try {
      const basePayload = {
        boardId,
        color: formData.color,
        position:
          activeTab === "status"
            ? taskStatuses?.length || 0
            : activeTab === "priority"
              ? taskPriorities?.length || 0
              : taskInitiatives?.length || 0,
      };

      if (dialogType === "create") {
        if (activeTab === "status") {
          await createStatus({ ...basePayload, title: formData.title });
        } else if (activeTab === "priority") {
          await createPriority({ ...basePayload, name: formData.name });
        } else {
          await createInitiative({ ...basePayload, name: formData.name });
        }
      } else {
        if (activeTab === "status") {
          await updateStatus({
            ...basePayload,
            title: formData.title,
          });
          refetchStatuses();
        } else if (activeTab === "priority") {
          await updatePriority({
            ...basePayload,
            name: formData.name,
          });
          refetchPriorities();
        } else {
          await updateInitiative({
            ...basePayload,
            name: formData.name,
          });
          refetchInitiatives();
        }
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      if (activeTab === "status") {
        await deleteStatus(item.id);
        refetchStatuses();
      } else if (activeTab === "priority") {
        await deletePriority(item.id);
        refetchPriorities();
      } else {
        await deleteInitiative(item.id);
        refetchInitiatives();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    let currentItems: (TaskStatus | TaskPriority | TaskInitiative)[] = [];
    if (activeTab === "status") {
      currentItems = taskStatuses || [];
    } else if (activeTab === "priority") {
      currentItems = taskPriorities || [];
    } else {
      currentItems = taskInitiatives || [];
    }

    const oldIndex = currentItems.findIndex((item) => item.id === active.id);
    const newIndex = currentItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newItems = arrayMove(currentItems, oldIndex, newIndex);

    // Update positions in the database
    try {
      const { apiRequest } = await import("@/lib/api-request");

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (!item) continue;

        const newPosition = i;

        if (item.position !== newPosition) {
          if (activeTab === "status") {
            await apiRequest(`/task-status/${item.id}`, {
              method: "PATCH",
              body: { position: newPosition },
            });
          } else if (activeTab === "priority") {
            await apiRequest(`/task-priority/${item.id}`, {
              method: "PATCH",
              body: { position: newPosition },
            });
          } else {
            await apiRequest(`/task-initiative/${item.id}`, {
              method: "PATCH",
              body: { position: newPosition },
            });
          }
        }
      }

      // Refetch data to get updated positions
      if (activeTab === "status") {
        refetchStatuses();
      } else if (activeTab === "priority") {
        refetchPriorities();
      } else {
        refetchInitiatives();
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

  const currentItems =
    activeTab === "status"
      ? taskStatuses || []
      : activeTab === "priority"
        ? taskPriorities || []
        : taskInitiatives || [];

  return (
    <DashboardLayout onSearch={(query: string) => {}} onCreateClick={() => {}}>
      <div className="px-12 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
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

        {/* Content */}
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogType === "create" ? "Create" : "Edit"}{" "}
                {activeTab === "status"
                  ? "Status"
                  : activeTab === "priority"
                    ? "Priority"
                    : "Initiative"}
              </DialogTitle>
              <DialogDescription>
                {dialogType === "create" ? "Add a new" : "Update the"}{" "}
                {activeTab === "status"
                  ? "task status"
                  : activeTab === "priority"
                    ? "task priority"
                    : "task initiative"}{" "}
                for this board.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  {activeTab === "status" ? "Status Name" : "Name"}
                </Label>
                <Input
                  id="name"
                  value={
                    activeTab === "status" ? formData.title : formData.name
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [activeTab === "status" ? "title" : "name"]:
                        e.target.value,
                    }))
                  }
                  placeholder={`Enter ${activeTab === "status" ? "status" : activeTab === "priority" ? "priority" : "initiative"} name`}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {dialogType === "create" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
