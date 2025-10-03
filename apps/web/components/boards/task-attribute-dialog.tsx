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
import { useTranslation } from "@/contexts/language-context";
import { TaskAttribute, TaskAttributeType } from "@/types/task-attributes";

interface TaskAttributeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    name?: string;
    color: string;
  }) => Promise<void>;
  activeTab: TaskAttributeType;
  dialogType: "create" | "edit";
  editingItem?: TaskAttribute | null;
}

export function TaskAttributeDialog({
  isOpen,
  onClose,
  onSubmit,
  activeTab,
  dialogType,
  editingItem,
}: TaskAttributeDialogProps): JSX.Element {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: (editingItem as any).title || "",
        name: (editingItem as any).name || "",
        color: editingItem.color || "#3B82F6",
      });
    } else {
      setFormData({
        title: "",
        name: "",
        color: "#3B82F6",
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const getFieldName = () => {
    return activeTab === "status" ? "title" : "name";
  };

  const getFieldValue = () => {
    return activeTab === "status" ? formData.title : formData.name;
  };

  const getFieldLabel = () => {
    return activeTab === "status"
      ? t("taskAttributeDialog.statusName")
      : t("taskAttributeDialog.name");
  };

  const getPlaceholder = () => {
    const type =
      activeTab === "status"
        ? "status"
        : activeTab === "priority"
          ? "priority"
          : "initiative";
    return t(
      `taskAttributeDialog.enter${type.charAt(0).toUpperCase() + type.slice(1)}Name`
    );
  };

  const getDialogTitle = () => {
    const type =
      activeTab === "status"
        ? t("taskAttributesManager.status")
        : activeTab === "priority"
          ? t("taskAttributesManager.priority")
          : t("taskAttributesManager.initiative");
    return `${dialogType === "create" ? t("taskAttributeDialog.create") : t("taskAttributeDialog.edit")} ${type}`;
  };

  const getDialogDescription = () => {
    const type =
      activeTab === "status"
        ? t("taskAttributesManager.taskStatuses").toLowerCase()
        : activeTab === "priority"
          ? t("taskAttributesManager.taskPriorities").toLowerCase()
          : t("taskAttributesManager.taskInitiatives").toLowerCase();
    return `${dialogType === "create" ? t("taskAttributeDialog.addNew") : t("taskAttributeDialog.updateThe")} ${type} ${t("taskAttributeDialog.forThisBoard")}.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{getFieldLabel()}</Label>
            <Input
              id="name"
              value={getFieldValue()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [getFieldName()]: e.target.value,
                }))
              }
              placeholder={getPlaceholder()}
            />
          </div>
          <div>
            <Label htmlFor="color">{t("taskAttributeDialog.color")}</Label>
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
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>
            {dialogType === "create"
              ? t("taskAttributeDialog.create")
              : t("taskAttributeDialog.update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
