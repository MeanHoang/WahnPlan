"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
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
  const [showAll, setShowAll] = useState(false);
  const TASKS_PER_PAGE = 5;

  const visibleTasks = showAll ? tasks : tasks.slice(0, TASKS_PER_PAGE);
  const hasMoreTasks = tasks.length > TASKS_PER_PAGE;
  const remainingTasks = tasks.length - TASKS_PER_PAGE;

  return (
    <div
      className="flex flex-col bg-white rounded-lg border border-gray-200 flex-none basis-[300px]"
      style={{ width: 300, minWidth: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="font-semibold text-gray-900">{status.title}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex flex-col p-4 space-y-3 min-h-0 flex-1">
        {/* Visible Tasks */}
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}

        {/* Load More Button */}
        {hasMoreTasks && !showAll && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            onClick={() => setShowAll(true)}
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Load {remainingTasks} more
          </Button>
        )}

        {/* Show Less Button */}
        {hasMoreTasks && showAll && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            onClick={() => setShowAll(false)}
          >
            <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
            Show less
          </Button>
        )}

        {/* Add Task Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50"
          onClick={() => onAddTask?.(status.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New task
        </Button>
      </div>
    </div>
  );
}
