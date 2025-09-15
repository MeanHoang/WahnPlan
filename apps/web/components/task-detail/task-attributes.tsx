"use client";

import {
  Calendar,
  User,
  Users,
  Flag,
  Target,
  FileText,
  Code,
  CheckSquare,
  Play,
} from "lucide-react";
import { TaskAttributeRow } from "@/components/task-detail/task-attribute-row";
import { ColoredSelect } from "@/components/task-detail/colored-select";
import { UserSelector } from "@/components/task-detail/user-selector";
import { Task, TaskPriority, TaskInitiative, TaskStatus } from "@/types/task";

interface TaskAttributesProps {
  task: Task;
  pendingUpdates: Record<string, string>;
  priorities: TaskPriority[];
  initiatives: TaskInitiative[];
  statuses: TaskStatus[];
  availableUsers: Array<{
    id: string;
    email: string;
    fullname: string;
    publicName: string;
    avatarUrl: string;
  }>;
  onFieldChange: (field: string, value: string) => void;
}

export function TaskAttributes({
  task,
  pendingUpdates,
  priorities,
  initiatives,
  statuses,
  availableUsers,
  onFieldChange,
}: TaskAttributesProps): JSX.Element {
  return (
    <div className="space-y-1 w-full max-w-2xl">
      {/* Due Date */}
      <TaskAttributeRow
        icon={<Calendar className="h-5 w-5 text-gray-400" />}
        label="Due date"
      >
        <input
          type="date"
          className="w-64 px-2 py-1 text-xs"
          value={
            pendingUpdates.dueDate ||
            (task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : "")
          }
          onChange={(e) => {
            onFieldChange("dueDate", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Priority */}
      <TaskAttributeRow
        icon={<Flag className="h-5 w-5 text-gray-400" />}
        label="Priority"
      >
        <ColoredSelect
          value={pendingUpdates.taskPriorityId || task.taskPriority?.id || ""}
          onChange={(value) => {
            onFieldChange("taskPriorityId", value);
          }}
          options={priorities || []}
          placeholder="Empty"
        />
      </TaskAttributeRow>

      {/* Initiative */}
      <TaskAttributeRow
        icon={<Target className="h-5 w-5 text-gray-400" />}
        label="Initiative"
      >
        <ColoredSelect
          value={
            pendingUpdates.taskInitiativeId || task.taskInitiative?.id || ""
          }
          onChange={(value) => {
            onFieldChange("taskInitiativeId", value);
          }}
          options={initiatives || []}
          placeholder="Empty"
        />
      </TaskAttributeRow>

      {/* OKR */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="OKR"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.okr || task.okr || ""}
          onChange={(e) => {
            onFieldChange("okr", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Status */}
      <TaskAttributeRow
        icon={<Flag className="h-5 w-5 text-gray-400" />}
        label="Status"
      >
        <ColoredSelect
          value={pendingUpdates.taskStatusId || task.taskStatus?.id || ""}
          onChange={(value) => {
            onFieldChange("taskStatusId", value);
          }}
          options={
            statuses?.map((status) => ({
              id: status.id,
              name: status.title,
              color: status.color,
            })) || []
          }
          placeholder="Empty"
        />
      </TaskAttributeRow>

      {/* Assignee */}
      <TaskAttributeRow
        icon={<User className="h-5 w-5 text-gray-400" />}
        label="Assignee"
      >
        <UserSelector
          value={pendingUpdates.assigneeId || task.assignee?.id || ""}
          onChange={(value) => {
            onFieldChange("assigneeId", value as string);
          }}
          users={availableUsers}
          placeholder="Select assignee"
          multiple={false}
        />
      </TaskAttributeRow>

      {/* Members */}
      <TaskAttributeRow
        icon={<Users className="h-5 w-5 text-gray-400" />}
        label="Members"
      >
        <UserSelector
          value={
            pendingUpdates.memberIds?.split(",") ||
            task.taskMembers?.map((member) => member.user.id) ||
            []
          }
          onChange={(value) => {
            onFieldChange(
              "memberIds",
              Array.isArray(value) ? value.join(",") : (value as string)
            );
          }}
          users={availableUsers}
          placeholder="Select members"
          multiple={true}
        />
      </TaskAttributeRow>

      {/* Figma */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="Figma"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={task.attachments || ""}
          onChange={(e) => {
            onFieldChange("attachments", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Reviewer */}
      <TaskAttributeRow
        icon={<User className="h-5 w-5 text-gray-400" />}
        label="Reviewer"
      >
        <UserSelector
          value={pendingUpdates.reviewerId || task.reviewer?.id || ""}
          onChange={(value) => {
            onFieldChange("reviewerId", value as string);
          }}
          users={availableUsers}
          placeholder="Select reviewer"
          multiple={false}
        />
      </TaskAttributeRow>

      {/* Tester */}
      <TaskAttributeRow
        icon={<User className="h-5 w-5 text-gray-400" />}
        label="Tester"
      >
        <UserSelector
          value={pendingUpdates.testerId || task.tester?.id || ""}
          onChange={(value) => {
            onFieldChange("testerId", value as string);
          }}
          users={availableUsers}
          placeholder="Select tester"
          multiple={false}
        />
      </TaskAttributeRow>

      {/* BA User */}
      <TaskAttributeRow
        icon={<User className="h-5 w-5 text-gray-400" />}
        label="BA User"
      >
        <UserSelector
          value={pendingUpdates.baId || task.baUser?.id || ""}
          onChange={(value) => {
            onFieldChange("baId", value as string);
          }}
          users={availableUsers}
          placeholder="Select BA user"
          multiple={false}
        />
      </TaskAttributeRow>

      {/* Is Done */}
      <TaskAttributeRow
        icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
        label="Is Done"
      >
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={pendingUpdates.isDone === "true" || task.isDone || false}
          onChange={(e) => {
            onFieldChange("isDone", e.target.checked.toString());
          }}
        />
      </TaskAttributeRow>

      {/* Story Points */}
      <TaskAttributeRow
        icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
        label="Story points"
      >
        <input
          type="number"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.storyPoint || task.storyPoint || ""}
          onChange={(e) => {
            onFieldChange("storyPoint", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Merge Request */}
      <TaskAttributeRow
        icon={<Code className="h-5 w-5 text-gray-400" />}
        label="Merge Request"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.devMr || task.devMr || ""}
          onChange={(e) => {
            onFieldChange("devMr", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Size Card */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="Size card"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.sizeCard || task.sizeCard || ""}
          onChange={(e) => {
            onFieldChange("sizeCard", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Test Case */}
      <TaskAttributeRow
        icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
        label="Test case"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.testCase || task.testCase || ""}
          onChange={(e) => {
            onFieldChange("testCase", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Go-live */}
      <TaskAttributeRow
        icon={<Play className="h-5 w-5 text-gray-400" />}
        label="Go-live"
      >
        <input
          type="date"
          className="w-64 px-2 py-1 text-xs"
          value={
            pendingUpdates.goLive ||
            (task.goLive
              ? new Date(task.goLive).toISOString().split("T")[0]
              : "")
          }
          onChange={(e) => {
            onFieldChange("goLive", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Staging */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="Staging"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.staging || task.staging || ""}
          onChange={(e) => {
            onFieldChange("staging", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Sprint */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="Sprint"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.sprint || task.sprint || ""}
          onChange={(e) => {
            onFieldChange("sprint", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Feature Categories */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="Feature Categories"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={
            pendingUpdates.featureCategories || task.featureCategories || ""
          }
          onChange={(e) => {
            onFieldChange("featureCategories", e.target.value);
          }}
        />
      </TaskAttributeRow>

      {/* Sprint Goal */}
      <TaskAttributeRow
        icon={<FileText className="h-5 w-5 text-gray-400" />}
        label="Sprint Goal"
      >
        <input
          type="text"
          className="w-64 px-2 py-1 text-xs"
          placeholder="Empty"
          value={pendingUpdates.sprintGoal || task.sprintGoal || ""}
          onChange={(e) => {
            onFieldChange("sprintGoal", e.target.value);
          }}
        />
      </TaskAttributeRow>
    </div>
  );
}
