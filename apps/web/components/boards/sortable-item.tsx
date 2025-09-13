"use client";

import { Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskAttribute, TaskAttributeType } from "@/types/task-attributes";

interface SortableItemProps {
  item: TaskAttribute;
  activeTab: TaskAttributeType;
  onEdit: (item: TaskAttribute) => void;
  onDelete: (item: TaskAttribute) => void;
}

export function SortableItem({
  item,
  activeTab,
  onEdit,
  onDelete,
}: SortableItemProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getItemName = () => {
    if (activeTab === "status") {
      return (item as any).title;
    }
    return (item as any).name;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <div>
          <p className="font-medium">{getItemName()}</p>
          <p className="text-sm text-gray-500">{item._count.tasks} tasks</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
