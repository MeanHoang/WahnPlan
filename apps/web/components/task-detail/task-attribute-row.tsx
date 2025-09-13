"use client";

import { ReactNode } from "react";

interface TaskAttributeRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

export function TaskAttributeRow({
  icon,
  label,
  children,
}: TaskAttributeRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-4 py-2">
      {/* Left Column - Icon + Label */}
      <div className="flex items-center gap-3 w-1/3">
        <div className="flex-shrink-0">{icon}</div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      {/* Right Column - Input/Value */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
