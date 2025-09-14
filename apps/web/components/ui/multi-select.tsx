"use client";

import React from "react";
import { Check, ChevronDown, X } from "lucide-react";

// Wrapper components để tránh type issues
const ChevronDownIcon = ChevronDown as React.ComponentType<{
  className?: string;
}>;
const CheckIcon = Check as React.ComponentType<{ className?: string }>;
const XIcon = X as React.ComponentType<{
  className?: string;
  onClick?: () => void;
}>;
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
  color?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between h-8 text-sm", className)}
        onClick={() => setOpen(!open)}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selected.length > 0 && (
            <Badge variant="secondary" className="mr-1 mb-1 h-5 px-1.5 text-xs">
              {selected.length} selected
            </Badge>
          )}
        </div>
        <ChevronDownIcon className="h-3 w-3 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-full min-w-[200px]">
          <div className="p-2">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">
                  No items available
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(option.value);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: option.color || "#6B7280" }}
                      />
                      <span className="text-xs font-medium text-gray-900 flex-1 truncate">
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full flex-shrink-0">
                          <CheckIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              {selected.length > 0 && (
                <div className="text-xs text-gray-500 mb-1">
                  {selected.length} selected
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component để hiển thị selected items
export function MultiSelectDisplay({
  options,
  selected,
  onRemove,
}: {
  options: Option[];
  selected: string[];
  onRemove: (value: string) => void;
}) {
  if (selected.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((value) => {
        const option = options.find((opt) => opt.value === value);
        if (!option) return null;

        return (
          <Badge
            key={value}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: option.color || "#6B7280" }}
            />
            {option.label}
            <XIcon
              className="w-3 h-3 cursor-pointer"
              onClick={() => onRemove(value)}
            />
          </Badge>
        );
      })}
    </div>
  );
}
