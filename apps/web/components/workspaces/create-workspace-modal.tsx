"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import {
  useCreateWorkspace,
  CreateWorkspaceData,
  Workspace,
} from "@/hooks/use-workspaces";

interface CreateWorkspaceModalProps {
  onWorkspaceCreated?: () => void;
}

interface WorkspaceFormData extends CreateWorkspaceData {
  name: string;
  description: string;
  visibility: "public" | "private";
  icon: string;
  notifyTaskDueSoon: boolean;
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
    notifyTaskDueSoon: true,
  });
  const { toast } = useToast();
  const { mutate: createWorkspace, loading } = useCreateWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Workspace name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const workspace = await createWorkspace(formData);
      toast({
        title: "Success",
        description: `Workspace "${workspace.name}" created successfully`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        visibility: "private",
        icon: "",
        notifyTaskDueSoon: true,
      });

      setOpen(false);
      onWorkspaceCreated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    field: keyof WorkspaceFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              placeholder="Enter workspace name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your workspace (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "public" | "private") =>
                handleInputChange("visibility", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Optional)</Label>
            <Input
              id="icon"
              placeholder="Enter icon URL or emoji"
              value={formData.icon}
              onChange={(e) => handleInputChange("icon", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notifyTaskDueSoon"
              checked={formData.notifyTaskDueSoon}
              onChange={(e) =>
                handleInputChange("notifyTaskDueSoon", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="notifyTaskDueSoon" className="text-sm">
              Notify when tasks are due soon
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
