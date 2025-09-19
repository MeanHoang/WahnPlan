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
  ChevronDown,
  ChevronUp,
  Clock,
  UserPlus,
} from "lucide-react";
import { TaskAttributeRow } from "@/components/task-detail/task-attribute-row";
import { ColoredSelect } from "@/components/task-detail/colored-select";
import { UserSelector } from "@/components/task-detail/user-selector";
import { Task, TaskPriority, TaskInitiative, TaskStatus } from "@/types/task";
import { useState } from "react";
import { useTranslation } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";

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
  const [showAllFields, setShowAllFields] = useState(false);
  const { t } = useTranslation();

  // Basic fields (always visible)
  const basicFields = [
    "dueDate",
    "taskPriorityId",
    "taskInitiativeId",
    "isDone",
    "taskStatusId",
    "assigneeId",
    "memberIds",
  ];

  // Additional fields (shown when expanded)
  const additionalFields = [
    "attachments",
    "reviewerId",
    "testerId",
    "baId",
    "okr",
    "storyPoint",
    "devMr",
    "sizeCard",
    "testCase",
    "goLive",
    "staging",
    "sprint",
    "featureCategories",
    "sprintGoal",
    "createdAt",
    "createdBy",
  ];

  const renderField = (fieldType: string) => {
    switch (fieldType) {
      case "dueDate":
        return (
          <TaskAttributeRow
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.dueDate")}
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
        );

      case "taskPriorityId":
        return (
          <TaskAttributeRow
            icon={<Flag className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.priority")}
          >
            <ColoredSelect
              value={
                pendingUpdates.taskPriorityId || task.taskPriority?.id || ""
              }
              onChange={(value) => {
                onFieldChange("taskPriorityId", value);
              }}
              options={priorities || []}
              placeholder={t("taskAttributes.empty")}
            />
          </TaskAttributeRow>
        );

      case "taskInitiativeId":
        return (
          <TaskAttributeRow
            icon={<Target className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.initiative")}
          >
            <ColoredSelect
              value={
                pendingUpdates.taskInitiativeId || task.taskInitiative?.id || ""
              }
              onChange={(value) => {
                onFieldChange("taskInitiativeId", value);
              }}
              options={initiatives || []}
              placeholder={t("taskAttributes.empty")}
            />
          </TaskAttributeRow>
        );

      case "okr":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.okr")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.okr || task.okr || ""}
              onChange={(e) => {
                onFieldChange("okr", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "taskStatusId":
        return (
          <TaskAttributeRow
            icon={<Flag className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.status")}
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
              placeholder={t("taskAttributes.empty")}
            />
          </TaskAttributeRow>
        );

      case "assigneeId":
        return (
          <TaskAttributeRow
            icon={<User className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.assignee")}
          >
            <UserSelector
              value={pendingUpdates.assigneeId || task.assignee?.id || ""}
              onChange={(value) => {
                onFieldChange("assigneeId", value as string);
              }}
              users={availableUsers}
              placeholder={t("taskAttributes.selectAssignee")}
              multiple={false}
            />
          </TaskAttributeRow>
        );

      case "memberIds":
        return (
          <TaskAttributeRow
            icon={<Users className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.members")}
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
              placeholder={t("taskAttributes.selectMembers")}
              multiple={true}
            />
          </TaskAttributeRow>
        );

      case "attachments":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.figma")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={task.attachments || ""}
              onChange={(e) => {
                onFieldChange("attachments", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "reviewerId":
        return (
          <TaskAttributeRow
            icon={<User className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.reviewer")}
          >
            <UserSelector
              value={pendingUpdates.reviewerId || task.reviewer?.id || ""}
              onChange={(value) => {
                onFieldChange("reviewerId", value as string);
              }}
              users={availableUsers}
              placeholder={t("taskAttributes.selectReviewer")}
              multiple={false}
            />
          </TaskAttributeRow>
        );

      case "testerId":
        return (
          <TaskAttributeRow
            icon={<User className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.tester")}
          >
            <UserSelector
              value={pendingUpdates.testerId || task.tester?.id || ""}
              onChange={(value) => {
                onFieldChange("testerId", value as string);
              }}
              users={availableUsers}
              placeholder={t("taskAttributes.selectTester")}
              multiple={false}
            />
          </TaskAttributeRow>
        );

      case "baId":
        return (
          <TaskAttributeRow
            icon={<User className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.baUser")}
          >
            <UserSelector
              value={pendingUpdates.baId || task.baUser?.id || ""}
              onChange={(value) => {
                onFieldChange("baId", value as string);
              }}
              users={availableUsers}
              placeholder={t("taskAttributes.selectBaUser")}
              multiple={false}
            />
          </TaskAttributeRow>
        );

      case "isDone":
        return (
          <TaskAttributeRow
            icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.isDone")}
          >
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={
                pendingUpdates.isDone !== undefined
                  ? pendingUpdates.isDone === "true"
                  : task.isDone || false
              }
              onChange={(e) => {
                onFieldChange("isDone", e.target.checked.toString());
              }}
            />
          </TaskAttributeRow>
        );

      case "storyPoint":
        return (
          <TaskAttributeRow
            icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.storyPoints")}
          >
            <input
              type="number"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.storyPoint || task.storyPoint || ""}
              onChange={(e) => {
                onFieldChange("storyPoint", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "devMr":
        return (
          <TaskAttributeRow
            icon={<Code className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.mergeRequest")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.devMr || task.devMr || ""}
              onChange={(e) => {
                onFieldChange("devMr", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "sizeCard":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.sizeCard")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.sizeCard || task.sizeCard || ""}
              onChange={(e) => {
                onFieldChange("sizeCard", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "testCase":
        return (
          <TaskAttributeRow
            icon={<CheckSquare className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.testCase")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.testCase || task.testCase || ""}
              onChange={(e) => {
                onFieldChange("testCase", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "goLive":
        return (
          <TaskAttributeRow
            icon={<Play className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.goLive")}
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
        );

      case "staging":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.staging")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.staging || task.staging || ""}
              onChange={(e) => {
                onFieldChange("staging", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "sprint":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.sprint")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.sprint || task.sprint || ""}
              onChange={(e) => {
                onFieldChange("sprint", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "featureCategories":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.featureCategories")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={
                pendingUpdates.featureCategories || task.featureCategories || ""
              }
              onChange={(e) => {
                onFieldChange("featureCategories", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "sprintGoal":
        return (
          <TaskAttributeRow
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.sprintGoal")}
          >
            <input
              type="text"
              className="w-64 px-2 py-1 text-xs"
              placeholder={t("taskAttributes.empty")}
              value={pendingUpdates.sprintGoal || task.sprintGoal || ""}
              onChange={(e) => {
                onFieldChange("sprintGoal", e.target.value);
              }}
            />
          </TaskAttributeRow>
        );

      case "createdAt":
        return (
          <TaskAttributeRow
            icon={<Clock className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.createdDate")}
          >
            <span className="text-sm text-gray-600">
              {task.createdAt
                ? new Date(task.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
          </TaskAttributeRow>
        );

      case "createdBy":
        return (
          <TaskAttributeRow
            icon={<UserPlus className="h-5 w-5 text-gray-400" />}
            label={t("taskAttributes.createdBy")}
          >
            <div className="flex items-center gap-2">
              {task.createdBy?.avatarUrl && (
                <img
                  src={task.createdBy.avatarUrl}
                  alt={
                    task.createdBy.publicName ||
                    task.createdBy.fullname ||
                    "User"
                  }
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">
                {task.createdBy?.publicName ||
                  task.createdBy?.fullname ||
                  task.createdBy?.email ||
                  "Unknown"}
              </span>
            </div>
          </TaskAttributeRow>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1 w-full max-w-2xl">
      {/* Basic Fields - Always Visible */}
      {basicFields.map((fieldType) => (
        <div key={fieldType}>{renderField(fieldType)}</div>
      ))}

      {/* Additional Fields - Shown when expanded */}
      {showAllFields &&
        additionalFields.map((fieldType) => (
          <div key={fieldType}>{renderField(fieldType)}</div>
        ))}

      {/* Load More / Collapse Button */}
      <div className="flex items-center justify-center py-2 gap-20 ml-32">
        {/* Left Column - Load More Button aligned with labels */}
        <div className="flex items-center gap-1 w-1/3 justify-start">
          <div className="flex-shrink-0 w-5 h-5"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllFields(!showAllFields)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 p-0 h-auto font-normal"
          >
            {showAllFields ? (
              <>
                <ChevronUp className="h-3 w-3" />
                {t("taskAttributes.showLess")}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                {t("taskAttributes.loadMore")} ({additionalFields.length}{" "}
                {t("taskAttributes.moreFields")})
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Empty space */}
        <div className="flex-1 flex justify-start"></div>
      </div>
    </div>
  );
}
