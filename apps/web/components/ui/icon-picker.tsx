"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "@/contexts/language-context";

// Curated list of popular workspace icons (verified to exist in Lucide React)
const WORKSPACE_ICONS = [
  "Building2",
  "Briefcase",
  "Users",
  "Target",
  "Rocket",
  "Zap",
  "Star",
  "Heart",
  "Shield",
  "Crown",
  "Gem",
  "Trophy",
  "Award",
  "Flag",
  "Globe",
  "Map",
  "Compass",
  "Navigation",
  "Anchor",
  "Ship",
  "Plane",
  "Car",
  "Truck",
  "Home",
  "Building",
  "Factory",
  "Store",
  "Bank",
  "Hospital",
  "School",
  "GraduationCap",
  "Book",
  "BookOpen",
  "Laptop",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Camera",
  "Video",
  "Music",
  "Headphones",
  "Mic",
  "Speaker",
  "Gamepad2",
  "Puzzle",
  "Dice1",
  "Dice6",
  "Palette",
  "Brush",
  "PenTool",
  "Scissors",
  "Wrench",
  "Hammer",
  "Screwdriver",
  "Cog",
  "Settings",
  "Sliders",
  "ToggleLeft",
  "ToggleRight",
  "Power",
  "Battery",
  "Plug",
  "Lightbulb",
  "Sun",
  "Moon",
  "Cloud",
  "CloudRain",
  "Snowflake",
  "Wind",
  "Thermometer",
  "Droplets",
  "TreePine",
  "Leaf",
  "Flower",
  "Bug",
  "Bird",
  "Fish",
  "Cat",
  "Dog",
  "PawPrint",
  "Coffee",
  "Utensils",
  "Pizza",
  "Cake",
  "Apple",
  "Banana",
  "Carrot",
  "Cherry",
  "Diamond",
  "Circle",
  "Square",
  "Triangle",
  "Hexagon",
  "Octagon",
  "Pentagon",
  "Cross",
];

// Filter out any icons that don't exist in Lucide React
const VALID_WORKSPACE_ICONS = WORKSPACE_ICONS.filter(
  (iconName) => iconName in LucideIcons
);

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  disabled?: boolean;
}

export function IconPicker({
  selectedIcon,
  onIconSelect,
  disabled,
}: IconPickerProps): JSX.Element {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = VALID_WORKSPACE_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SelectedIconComponent =
    selectedIcon &&
    selectedIcon in LucideIcons &&
    (LucideIcons[
      selectedIcon as keyof typeof LucideIcons
    ] as React.ComponentType<any>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          disabled={disabled}
        >
          <div className="flex items-center space-x-3">
            {selectedIcon && SelectedIconComponent ? (
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <SelectedIconComponent className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-500 text-xs">?</span>
              </div>
            )}
            <span className="text-sm">
              {selectedIcon ? selectedIcon : t("workspaceSettings.selectIcon")}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {t("workspaceSettings.chooseWorkspaceIcon")}
          </DialogTitle>
          <DialogDescription>
            {t("workspaceSettings.selectIconDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("workspaceSettings.searchIcons")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Icons Grid */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map((iconName) => {
                const IconComponent = LucideIcons[
                  iconName as keyof typeof LucideIcons
                ] as React.ComponentType<any>;
                const isSelected = selectedIcon === iconName;

                // Skip rendering if icon doesn't exist
                if (!IconComponent) {
                  return null;
                }

                return (
                  <Button
                    key={iconName}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`h-12 w-12 p-0 flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-slate-100"
                    }`}
                    onClick={() => {
                      onIconSelect(iconName);
                      setIsOpen(false);
                    }}
                  >
                    <IconComponent className="h-5 w-5 mb-1" />
                    <span className="text-xs truncate w-full text-center">
                      {iconName}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Clear Selection */}
          {selectedIcon && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onIconSelect("");
                  setIsOpen(false);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                {t("workspaceSettings.clearSelection")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
