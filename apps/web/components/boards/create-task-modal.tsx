"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
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
import { useTranslation } from "@/contexts/language-context";
import { TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  statusId: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  initiatives: TaskInitiative[];
  assignees: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  presetAssigneeId?: string;
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
  assignees,
  presetAssigneeId,
  onSuccess,
}: CreateTaskModalProps): JSX.Element {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    statusId: statusId,
    priorityId: "",
    initiativeId: "",
    assigneeId: presetAssigneeId || "",
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
        assigneeId: presetAssigneeId || "",
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("modals.createTask.failedToCreateTask"),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        statusId,
        assigneeId: presetAssigneeId || "",
      }));
    }
  }, [isOpen, statusId, presetAssigneeId]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: t("modals.createTask.validationError"),
        description: t("modals.createTask.taskTitleRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.statusId) {
      toast({
        title: t("modals.createTask.validationError"),
        description: t("modals.createTask.selectStatusRequired"),
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
      assigneeId: formData.assigneeId || null,
    };

    await createTask(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("modals.createTask.title")}</DialogTitle>
          <DialogDescription>
            {presetAssigneeId
              ? t("modals.createTask.descriptionForAssignee")
              : t("modals.createTask.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">{t("modals.createTask.titleLabel")} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={t("modals.createTask.enterTaskTitle")}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">{t("modals.createTask.status")}</Label>
            <Select
              value={formData.statusId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, statusId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("modals.createTask.selectStatus")}
                />
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
            <Label htmlFor="priority">{t("modals.createTask.priority")}</Label>
            <Select
              value={formData.priorityId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, priorityId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("modals.createTask.selectPriority")}
                />
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
            <Label htmlFor="initiative">
              {t("modals.createTask.initiative")}
            </Label>
            <Select
              value={formData.initiativeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, initiativeId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("modals.createTask.selectInitiative")}
                />
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

          {/* Assignee */}
          <div>
            <Label htmlFor="assignee">{t("modals.createTask.assignee")}</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, assigneeId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("modals.createTask.selectAssignee")}
                />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        {assignee.avatar && assignee.avatar.trim() !== "" ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const nextElement = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <User
                          className="h-3 w-3 text-blue-600"
                          style={{
                            display:
                              assignee.avatar && assignee.avatar.trim() !== ""
                                ? "none"
                                : "flex",
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{assignee.name}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("modals.createTask.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
          >
            {loading
              ? t("modals.createTask.creating")
              : t("modals.createTask.createTask")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
