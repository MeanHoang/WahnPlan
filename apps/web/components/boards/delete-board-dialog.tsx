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
import { Input } from "@/components/ui/input";
import { useDeleteApi } from "@/hooks/use-delete-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { Board } from "@/types/board-core";
import { useRouter } from "next/navigation";

interface DeleteBoardDialogProps {
  board: Board;
  onBoardDeleted?: () => void;
}

export function DeleteBoardDialog({
  board,
  onBoardDeleted,
}: DeleteBoardDialogProps): JSX.Element {
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deleteBoard } = useDeleteApi(`/boards/${board.id}`);

  const handleDelete = async () => {
    if (confirmText !== board.title) {
      toast({
        title: t("common.error"),
        description: t("board.delete.confirmTextMismatch"),
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBoard();
      toast({
        title: t("common.success"),
        description: t("board.delete.deletedSuccessfully"),
      });
      setIsOpen(false);
      onBoardDeleted?.();
      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      console.error("Error deleting board:", error);
      toast({
        title: t("common.error"),
        description: t("board.delete.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText("");
    }
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
          {t("board.delete.deleteBoard")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t("board.delete.deleteBoard")}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("board.delete.warningMessage")}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">
                {t("board.delete.whatWillBeDeleted")}
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • {t("board.delete.allTasks")} ({board._count?.tasks || 0})
                </li>
                <li>
                  • {t("board.delete.allTaskStatuses")} (
                  {board._count?.taskStatuses || 0})
                </li>
                <li>
                  • {t("board.delete.allTaskPriorities")} (
                  {board._count?.taskPriorities || 0})
                </li>
                <li>
                  • {t("board.delete.allTaskInitiatives")} (
                  {board._count?.taskInitiatives || 0})
                </li>
                <li>• {t("board.delete.allComments")}</li>
                <li>• {t("board.delete.allMembers")}</li>
                <li>• {t("board.delete.boardSettings")}</li>
              </ul>
            </div>
            <p className="text-sm font-medium text-red-600">
              {t("board.delete.actionCannotBeUndone")}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("board.delete.confirmDeletion")}
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={board.title}
              className="border-red-200 focus:border-red-400"
            />
            <p className="text-xs text-gray-500">
              {t("board.delete.typeBoardNameToConfirm")}
            </p>
          </div>
        </div>
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
            disabled={isDeleting || confirmText !== board.title}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("board.delete.deleteBoard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
