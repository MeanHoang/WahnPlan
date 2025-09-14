"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  id: string;
  name: string;
  color?: string;
}

interface ColoredSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function ColoredSelect({
  value,
  onChange,
  options,
  placeholder = "Empty",
  className = "",
}: ColoredSelectProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getOptionStyle = (option: SelectOption) => {
    if (!option.color) return {};

    return {
      backgroundColor: `${option.color}40`,
      color: "#374151", // Always use dark gray text for better readability
    };
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        className="w-64 px-2 py-1 text-xs text-left flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedOption ? (
            <>
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedOption.color }}
              />
              <span style={getOptionStyle(selectedOption)}>
                {selectedOption.name}
              </span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            className="w-64 px-2 py-1 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
          >
            <span className="text-gray-500">{placeholder}</span>
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="w-64 px-2 py-1 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: option.color }}
              />
              <span style={getOptionStyle(option)}>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
