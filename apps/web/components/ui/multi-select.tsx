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
  avatar?: string;
  subtitle?: string;
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
  const [searchTerm, setSearchTerm] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchTerm(""); // Clear search when closing
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchTerm("");
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
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-full min-w-[250px]">
          <div className="p-2">
            {/* Search Input */}
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">
                  {searchTerm ? "No items found" : "No items available"}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
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
                      {/* Avatar or Color Dot */}
                      {option.avatar ? (
                        <img
                          src={option.avatar}
                          alt={option.label}
                          className="w-6 h-6 rounded-full flex-shrink-0 border border-gray-200"
                        />
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: option.color || "#6B7280" }}
                        >
                          {option.label.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Name and Subtitle */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {option.label}
                        </div>
                        {option.subtitle && (
                          <div className="text-xs text-gray-500 truncate">
                            {option.subtitle}
                          </div>
                        )}
                      </div>

                      {/* Check Icon */}
                      {isSelected && (
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full flex-shrink-0">
                          <CheckIcon className="w-3 h-3 text-white" />
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
            className="flex items-center gap-2 px-2 py-1"
          >
            {option.avatar ? (
              <img
                src={option.avatar}
                alt={option.label}
                className="w-4 h-4 rounded-full border border-gray-200"
              />
            ) : (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: option.color || "#6B7280" }}
              >
                {option.label.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs">{option.label}</span>
            <XIcon
              className="w-3 h-3 cursor-pointer hover:text-red-500"
              onClick={() => onRemove(value)}
            />
          </Badge>
        );
      })}
    </div>
  );
}
