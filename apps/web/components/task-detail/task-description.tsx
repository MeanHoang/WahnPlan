"use client";

import { Task } from "@/types/task";

interface TaskDescriptionProps {
  task: Task;
}

export function TaskDescription({
  task,
}: TaskDescriptionProps): JSX.Element | null {
  if (!task.descriptionPlain && !task.notePlain) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
      {task.descriptionPlain && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Description
          </h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {task.descriptionPlain}
          </p>
        </div>
      )}
      {task.notePlain && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {task.notePlain}
          </p>
        </div>
      )}
    </div>
  );
}
