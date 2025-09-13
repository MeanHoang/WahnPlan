"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { Task, TaskStatus } from "@/types/task";

interface StatusColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (statusId: string) => void;
}

export function StatusColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: StatusColumnProps): JSX.Element {
  return (
    <div className="flex flex-col w-80 bg-gray-50 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="font-semibold text-gray-900">{status.title}</h3>
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-3 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}

        {/* Add Task Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
          onClick={() => onAddTask?.(status.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New task
        </Button>
      </div>
    </div>
  );
}
