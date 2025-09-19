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
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  _count?: {
    boards: number;
    members: number;
  };
}

interface DeleteWorkspaceDialogProps {
  workspace: Workspace;
  onWorkspaceDeleted?: () => void;
  trigger?: any;
}

export function DeleteWorkspaceDialog({
  workspace,
  onWorkspaceDeleted,
  trigger,
}: DeleteWorkspaceDialogProps): JSX.Element {
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deleteWorkspace } = useDeleteApi(
    `/workspaces/${workspace.id}`
  );

  const handleDelete = async () => {
    if (confirmText !== workspace.name) {
      toast({
        title: t("common.error"),
        description: t("workspace.delete.confirmTextMismatch"),
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkspace();
      toast({
        title: t("common.success"),
        description: t("workspace.delete.deletedSuccessfully"),
      });
      setIsOpen(false);
      onWorkspaceDeleted?.();
      // Redirect to dashboard after successful deletion
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        title: t("common.error"),
        description: t("workspace.delete.deleteFailed"),
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
        {trigger || (
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("workspace.delete.deleteWorkspace")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t("workspace.delete.deleteWorkspace")}
          </DialogTitle>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("workspace.delete.warningMessage")}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">
                {t("workspace.delete.whatWillBeDeleted")}
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • {t("workspace.delete.allBoards")} (
                  {workspace._count?.boards || 0})
                </li>
                <li>
                  • {t("workspace.delete.allMembers")} (
                  {workspace._count?.members || 0})
                </li>
                <li>• {t("workspace.delete.allTasks")}</li>
                <li>• {t("workspace.delete.allComments")}</li>
                <li>• {t("workspace.delete.workspaceSettings")}</li>
              </ul>
            </div>
            <p className="text-sm font-medium text-red-600">
              {t("workspace.delete.actionCannotBeUndone")}
            </p>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("workspace.delete.confirmDeletion")}
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={workspace.name}
              className="border-red-200 focus:border-red-400"
            />
            <p className="text-xs text-gray-500">
              {t("workspace.delete.typeWorkspaceNameToConfirm")}
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
            disabled={isDeleting || confirmText !== workspace.name}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("workspace.delete.deleteWorkspace")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
