"use client";

import { TaskComments } from "./task-comments";

// Demo component để test UI
export function TaskCommentsDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Task Comments Demo</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TaskComments taskId="demo-task-id" />
      </div>
    </div>
  );
}
