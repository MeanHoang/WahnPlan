"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateApi } from "@/hooks/use-create-api";
import { CreateBoardData } from "@/types/board-requests";
import { Board } from "@/types/board-core";

interface CreateBoardModalProps {
  workspaceId: string;
  onBoardCreated?: () => void;
  trigger?: React.ReactElement;
}

interface BoardFormData {
  title: string;
  subtitle: string;
}

export function CreateBoardModal({
  workspaceId,
  onBoardCreated,
  trigger,
}: CreateBoardModalProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BoardFormData>({
    title: "",
    subtitle: "",
  });
  const { toast } = useToast();
  const { mutate: createBoard, loading } = useCreateApi<CreateBoardData, Board>(
    "/boards"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Board title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const board = await createBoard({
        workspaceId,
        title: formData.title,
        subtitle: formData.subtitle || undefined,
      });
      toast({
        title: "Success",
        description: `Board "${board.title}" created successfully`,
      });

      // Reset form
      setFormData({
        title: "",
        subtitle: "",
      });

      setOpen(false);
      onBoardCreated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create board. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof BoardFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create Board
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Board Title *</Label>
            <Input
              id="title"
              placeholder="Enter board title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              placeholder="Describe your board (optional)"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              rows={3}
            />
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
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
