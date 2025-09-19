"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { Task } from "@/types/task";

interface TaskHeaderProps {
  task: Task;
  hasChanges: boolean;
  isUpdating: boolean;
  onBack: () => void;
  onSave: () => void;
  onTaskDeleted?: () => void;
}

export function TaskHeader({
  task,
  hasChanges,
  isUpdating,
  onBack,
  onSave,
  onTaskDeleted,
}: TaskHeaderProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-6 flex justify-center">
      <div className="flex items-center justify-between max-w-4xl w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <DeleteTaskDialog task={task} onTaskDeleted={onTaskDeleted} />
          <Button
            onClick={onSave}
            disabled={isUpdating || !hasChanges}
            className={`${
              hasChanges
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUpdating
              ? t("taskHeader.saving")
              : hasChanges
                ? t("taskHeader.saveChanges")
                : t("taskHeader.noChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
}
