"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { useCreateApi } from "@/hooks/use-create-api";
import { CreateWorkspaceData } from "@/types/workspace-requests";
import { Workspace } from "@/types/workspace-core";
import { IconPicker } from "@/components/ui/icon-picker";

interface CreateWorkspaceModalProps {
  onWorkspaceCreated?: () => void;
}

interface WorkspaceFormData {
  name: string;
  description: string;
  visibility: "public" | "private";
  icon: string;
}

export function CreateWorkspaceModal({
  onWorkspaceCreated,
}: CreateWorkspaceModalProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<WorkspaceFormData>({
    name: "",
    description: "",
    visibility: "private",
    icon: "",
  });
  const { toast } = useToast();
  const { t } = useTranslation();
  const { mutate: createWorkspace, loading } = useCreateApi<
    CreateWorkspaceData,
    Workspace
  >("/workspaces");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: t("common.error"),
        description: t("modals.createWorkspace.workspaceNameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const workspace = await createWorkspace(formData);
      toast({
        title: t("common.success"),
        description: `Workspace "${workspace.name}" ${t("modals.createWorkspace.workspaceCreatedSuccess")}`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        visibility: "private",
        icon: "",
      });

      setOpen(false);
      onWorkspaceCreated?.();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("modals.createWorkspace.failedToCreateWorkspace"),
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof WorkspaceFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          {t("common.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("modals.createWorkspace.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("modals.createWorkspace.workspaceName")} *
            </Label>
            <Input
              id="name"
              placeholder={t("modals.createWorkspace.enterWorkspaceName")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("modals.createWorkspace.description")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("modals.createWorkspace.describeWorkspace")}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Workspace Icon</Label>
            <IconPicker
              selectedIcon={formData.icon}
              onIconSelect={(iconName) => handleInputChange("icon", iconName)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">
              {t("modals.createWorkspace.visibility")}
            </Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "public" | "private") =>
                handleInputChange("visibility", value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("modals.createWorkspace.selectVisibility")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  {t("modals.createWorkspace.private")}
                </SelectItem>
                <SelectItem value="public">
                  {t("modals.createWorkspace.public")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t("modals.createWorkspace.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("modals.createWorkspace.creating")
                : t("modals.createWorkspace.createWorkspace")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
