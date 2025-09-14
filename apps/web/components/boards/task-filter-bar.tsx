"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, MultiSelectDisplay } from "@/components/ui/multi-select";
import { TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface TaskFilterBarProps {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  initiatives: TaskInitiative[];
  selectedStatusIds: string[];
  selectedPriorityIds: string[];
  selectedInitiativeIds: string[];
  onFiltersChange: (filters: {
    statusIds: string[];
    priorityIds: string[];
    initiativeIds: string[];
  }) => void;
}

export function TaskFilterBar({
  statuses,
  priorities,
  initiatives,
  selectedStatusIds,
  selectedPriorityIds,
  selectedInitiativeIds,
  onFiltersChange,
}: TaskFilterBarProps): JSX.Element {
  const handleClearAllFilters = () => {
    onFiltersChange({
      statusIds: [],
      priorityIds: [],
      initiativeIds: [],
    });
  };

  const getTotalFiltersCount = () => {
    return (
      selectedStatusIds.length +
      selectedPriorityIds.length +
      selectedInitiativeIds.length
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
                });
              }}
              placeholder="Initiative"
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
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
