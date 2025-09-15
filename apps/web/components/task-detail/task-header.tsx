"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskHeaderProps {
  hasChanges: boolean;
  isUpdating: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function TaskHeader({
  hasChanges,
  isUpdating,
  onBack,
  onSave,
}: TaskHeaderProps): JSX.Element {
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
            ? "Saving..."
            : hasChanges
              ? "Save Changes"
              : "No Changes"}
        </Button>
      </div>
    </div>
  );
}
