"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";

interface TaskTitleProps {
  task: Task;
  pendingUpdates: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

export function TaskTitle({
  task,
  pendingUpdates,
  onFieldChange,
}: TaskTitleProps) {
  const [titleRows, setTitleRows] = useState(1);

  // Update title rows when title changes
  useEffect(() => {
    const currentTitle = pendingUpdates.title || task?.title || "";
    const calculatedRows = Math.min(
      3,
      Math.max(1, Math.ceil(currentTitle.length / 15))
    );
    setTitleRows(calculatedRows);
  }, [pendingUpdates.title, task?.title]);

  return (
    <div className="mb-6 ml-32">
      <textarea
        data-task-title
        className="w-full text-5xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded resize-none px-4 py-2"
        placeholder="Task title"
        value={pendingUpdates.title || task.title}
        onChange={(e) => {
          onFieldChange("title", e.target.value);
        }}
        rows={titleRows}
        style={{
          height: "auto",
          overflow: "hidden",
          resize: "none",
        }}
      />
    </div>
  );
}
