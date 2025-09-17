"use client";

import { RichTextEditor } from "./rich-text-editor-wrapper";
import { Task } from "@/types/task";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useToast } from "@/hooks/use-toast";

interface TaskNotesProps {
  task: Task;
  onTaskUpdate?: (updatedTask: Task) => void;
}

export function TaskNotes({ task, onTaskUpdate }: TaskNotesProps): JSX.Element {
  const { toast } = useToast();

  const { mutate: updateTask, loading: isUpdating } = useUpdateApi<
    Partial<Task>,
    Task
  >(`/tasks/${task.id}`, {
    onSuccess: (updatedTask) => {
      onTaskUpdate?.(updatedTask);
      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    },
  });

  const handleSaveNotes = (contentJson: any, contentPlain: string) => {
    updateTask({
      noteJson: contentJson,
      notePlain: contentPlain,
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <RichTextEditor
        content={task.noteJson}
        onSave={handleSaveNotes}
        placeholder="Add your notes here..."
        editable={true}
      />
    </div>
  );
}
