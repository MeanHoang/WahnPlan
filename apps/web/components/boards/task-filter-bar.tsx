"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, MultiSelectDisplay } from "@/components/ui/multi-select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface TaskFilterBarProps {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  initiatives: TaskInitiative[];
  assignees: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  selectedStatusIds: string[];
  selectedPriorityIds: string[];
  selectedInitiativeIds: string[];
  selectedAssigneeIds: string[];
  selectedReviewerIds: string[];
  selectedBaIds: string[];
  selectedMemberIds: string[];
  selectedDueDateRange?: DateRange;
  selectedCreatedAtRange?: DateRange;
  onFiltersChange: (filters: {
    statusIds: string[];
    priorityIds: string[];
    initiativeIds: string[];
    assigneeIds: string[];
    reviewerIds: string[];
    baIds: string[];
    memberIds: string[];
    dueDateRange?: DateRange;
    createdAtRange?: DateRange;
  }) => void;
}

export function TaskFilterBar({
  statuses,
  priorities,
  initiatives,
  assignees,
  selectedStatusIds,
  selectedPriorityIds,
  selectedInitiativeIds,
  selectedAssigneeIds,
  selectedReviewerIds,
  selectedBaIds,
  selectedMemberIds,
  selectedDueDateRange,
  selectedCreatedAtRange,
  onFiltersChange,
}: TaskFilterBarProps): JSX.Element {
  const handleClearAllFilters = () => {
    onFiltersChange({
      statusIds: [],
      priorityIds: [],
      initiativeIds: [],
      assigneeIds: [],
      reviewerIds: [],
      baIds: [],
      memberIds: [],
      dueDateRange: undefined,
      createdAtRange: undefined,
    });
  };

  const getTotalFiltersCount = () => {
    return (
      selectedStatusIds.length +
      selectedPriorityIds.length +
      selectedInitiativeIds.length +
      selectedAssigneeIds.length +
      selectedReviewerIds.length +
      selectedBaIds.length +
      selectedMemberIds.length +
      (selectedDueDateRange?.from || selectedDueDateRange?.to ? 1 : 0) +
      (selectedCreatedAtRange?.from || selectedCreatedAtRange?.to ? 1 : 0)
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Hàng 1: Filter Buttons */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Priority Filter */}
          <div className="min-w-[120px]">
            <MultiSelect
              options={priorities.map((p) => ({
                label: p.name,
                value: p.id,
                color: p.color || "#6B7280",
              }))}
              selected={selectedPriorityIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selected,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Priority"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[120px]">
            <MultiSelect
              options={statuses.map((s) => ({
                label: s.title,
                value: s.id,
                color: s.color || "#6B7280",
              }))}
              selected={selectedStatusIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selected,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Status"
            />
          </div>

          {/* Initiative Filter */}
          <div className="min-w-[120px]">
            <MultiSelect
              options={initiatives.map((i) => ({
                label: i.name,
                value: i.id,
                color: i.color || "#6B7280",
              }))}
              selected={selectedInitiativeIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selected,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Initiative"
            />
          </div>

          {/* Assignee Filter */}
          <div className="min-w-[150px]">
            <MultiSelect
              options={assignees.map((a) => ({
                label: a.name,
                value: a.id,
                color: "#3B82F6", // Default blue color for users
                avatar: a.avatar,
                subtitle: a.email,
              }))}
              selected={selectedAssigneeIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selected,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Assignee"
            />
          </div>

          {/* Reviewer Filter */}
          <div className="min-w-[150px]">
            <MultiSelect
              options={assignees.map((a) => ({
                label: a.name,
                value: a.id,
                color: "#10B981", // Default green color for reviewers
                avatar: a.avatar,
                subtitle: a.email,
              }))}
              selected={selectedReviewerIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selected,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Reviewer"
            />
          </div>

          {/* BA Filter */}
          <div className="min-w-[150px]">
            <MultiSelect
              options={assignees.map((a) => ({
                label: a.name,
                value: a.id,
                color: "#F59E0B", // Default orange color for BA
                avatar: a.avatar,
                subtitle: a.email,
              }))}
              selected={selectedBaIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selected,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="BA"
            />
          </div>

          {/* Member Filter */}
          <div className="min-w-[150px]">
            <MultiSelect
              options={assignees.map((a) => ({
                label: a.name,
                value: a.id,
                color: "#8B5CF6", // Default purple color for members
                avatar: a.avatar,
                subtitle: a.email,
              }))}
              selected={selectedMemberIds}
              onChange={(selected) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selected,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Member"
            />
          </div>

          {/* Due Date Filter */}
          <div className="min-w-[200px]">
            <DateRangePicker
              value={selectedDueDateRange}
              onChange={(range) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: range,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
              placeholder="Due Date"
            />
          </div>

          {/* Created At Filter */}
          <div className="min-w-[200px]">
            <DateRangePicker
              value={selectedCreatedAtRange}
              onChange={(range) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: range,
                });
              }}
              placeholder="Created Date"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {getTotalFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Section */}
      {getTotalFiltersCount() > 0 && (
        <div className="border-t border-gray-200 px-6 py-3">
          <div className="flex flex-wrap gap-2">
            <MultiSelectDisplay
              options={statuses.map((s) => ({
                label: `Status: ${s.title}`,
                value: s.id,
                color: s.color || "#6B7280",
              }))}
              selected={selectedStatusIds}
              onRemove={(statusId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds.filter((id) => id !== statusId),
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />
            <MultiSelectDisplay
              options={priorities.map((p) => ({
                label: `Priority: ${p.name}`,
                value: p.id,
                color: p.color || "#6B7280",
              }))}
              selected={selectedPriorityIds}
              onRemove={(priorityId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds.filter(
                    (id) => id !== priorityId
                  ),
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />
            <MultiSelectDisplay
              options={initiatives.map((i) => ({
                label: `Initiative: ${i.name}`,
                value: i.id,
                color: i.color || "#6B7280",
              }))}
              selected={selectedInitiativeIds}
              onRemove={(initiativeId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds.filter(
                    (id) => id !== initiativeId
                  ),
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />
            <MultiSelectDisplay
              options={assignees.map((a) => ({
                label: `Assignee: ${a.name}`,
                value: a.id,
                color: "#3B82F6",
                avatar: a.avatar,
              }))}
              selected={selectedAssigneeIds}
              onRemove={(assigneeId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds.filter(
                    (id) => id !== assigneeId
                  ),
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />
            <MultiSelectDisplay
              options={assignees.map((a) => ({
                label: `Reviewer: ${a.name}`,
                value: a.id,
                color: "#10B981",
                avatar: a.avatar,
              }))}
              selected={selectedReviewerIds}
              onRemove={(reviewerId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds.filter(
                    (id) => id !== reviewerId
                  ),
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />
            <MultiSelectDisplay
              options={assignees.map((a) => ({
                label: `BA: ${a.name}`,
                value: a.id,
                color: "#F59E0B",
                avatar: a.avatar,
              }))}
              selected={selectedBaIds}
              onRemove={(baId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds.filter((id) => id !== baId),
                  memberIds: selectedMemberIds,
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />
            <MultiSelectDisplay
              options={assignees.map((a) => ({
                label: `Member: ${a.name}`,
                value: a.id,
                color: "#8B5CF6",
                avatar: a.avatar,
              }))}
              selected={selectedMemberIds}
              onRemove={(memberId) => {
                onFiltersChange({
                  statusIds: selectedStatusIds,
                  priorityIds: selectedPriorityIds,
                  initiativeIds: selectedInitiativeIds,
                  assigneeIds: selectedAssigneeIds,
                  reviewerIds: selectedReviewerIds,
                  baIds: selectedBaIds,
                  memberIds: selectedMemberIds.filter((id) => id !== memberId),
                  dueDateRange: selectedDueDateRange,
                  createdAtRange: selectedCreatedAtRange,
                });
              }}
            />

            {/* Due Date Filter Display */}
            {selectedDueDateRange?.from || selectedDueDateRange?.to ? (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                onClick={() => {
                  onFiltersChange({
                    statusIds: selectedStatusIds,
                    priorityIds: selectedPriorityIds,
                    initiativeIds: selectedInitiativeIds,
                    assigneeIds: selectedAssigneeIds,
                    reviewerIds: selectedReviewerIds,
                    baIds: selectedBaIds,
                    memberIds: selectedMemberIds,
                    dueDateRange: undefined,
                    createdAtRange: selectedCreatedAtRange,
                  });
                }}
              >
                Due Date:{" "}
                {selectedDueDateRange.from && selectedDueDateRange.to
                  ? `${selectedDueDateRange.from.toLocaleDateString()} - ${selectedDueDateRange.to.toLocaleDateString()}`
                  : selectedDueDateRange.from
                    ? `From ${selectedDueDateRange.from.toLocaleDateString()}`
                    : `Until ${selectedDueDateRange.to?.toLocaleDateString()}`}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            ) : null}

            {/* Created At Filter Display */}
            {selectedCreatedAtRange?.from || selectedCreatedAtRange?.to ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => {
                  onFiltersChange({
                    statusIds: selectedStatusIds,
                    priorityIds: selectedPriorityIds,
                    initiativeIds: selectedInitiativeIds,
                    assigneeIds: selectedAssigneeIds,
                    reviewerIds: selectedReviewerIds,
                    baIds: selectedBaIds,
                    memberIds: selectedMemberIds,
                    dueDateRange: selectedDueDateRange,
                    createdAtRange: undefined,
                  });
                }}
              >
                Created Date:{" "}
                {selectedCreatedAtRange.from && selectedCreatedAtRange.to
                  ? `${selectedCreatedAtRange.from.toLocaleDateString()} - ${selectedCreatedAtRange.to.toLocaleDateString()}`
                  : selectedCreatedAtRange.from
                    ? `From ${selectedCreatedAtRange.from.toLocaleDateString()}`
                    : `Until ${selectedCreatedAtRange.to?.toLocaleDateString()}`}
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </Badge>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
