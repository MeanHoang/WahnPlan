"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateApi } from "@/hooks/use-create-api";
import { useToast } from "@/hooks/use-toast";
import { TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  statusId: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  initiatives: TaskInitiative[];
  onSuccess?: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  boardId,
  statusId,
  statuses,
  priorities,
  initiatives,
  onSuccess,
}: CreateTaskModalProps): JSX.Element {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    statusId: statusId,
    priorityId: "",
    initiativeId: "",
  });

  const { mutate: createTask, loading } = useCreateApi<any, any>("/tasks", {
    onSuccess: () => {
      onSuccess?.();
      onClose();
      setFormData({
        title: "",
        statusId: statusId,
        priorityId: "",
        initiativeId: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, statusId }));
    }
  }, [isOpen, statusId]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.statusId) {
      toast({
        title: "Validation Error",
        description: "Please select a status for the task.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: formData.title,
      boardId,
      taskStatusId: formData.statusId,
      taskPriorityId: formData.priorityId || null,
      taskInitiativeId: formData.initiativeId || null,
    };

    await createTask(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to this board.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.statusId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, statusId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priorityId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, priorityId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      {priority.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initiative */}
          <div>
            <Label htmlFor="initiative">Initiative</Label>
            <Select
              value={formData.initiativeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, initiativeId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select initiative" />
              </SelectTrigger>
              <SelectContent>
                {initiatives.map((initiative) => (
                  <SelectItem key={initiative.id} value={initiative.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: initiative.color }}
                      />
                      {initiative.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
          >
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
