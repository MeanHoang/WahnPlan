"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteApi } from "@/hooks/use-delete-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { useRouter } from "next/navigation";
import { Task } from "@/types/task";

interface DeleteTaskDialogProps {
  task: Task;
  onTaskDeleted?: () => void;
}

export function DeleteTaskDialog({
  task,
  onTaskDeleted,
}: DeleteTaskDialogProps): JSX.Element {
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deleteTask } = useDeleteApi(`/tasks/${task.id}`);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask();
      toast({
        title: t("common.success"),
        description: t("task.delete.deletedSuccessfully"),
      });
      setIsOpen(false);
      onTaskDeleted?.();
      // Redirect to board page after successful deletion
      router.back();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: t("common.error"),
        description: t("task.delete.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {t("task.delete.deleteTask")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t("task.delete.deleteTask")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t("task.delete.warningMessage")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("task.delete.deleteTask")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
