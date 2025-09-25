"use client";

import {
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  Layout,
  Plus,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Workspace } from "@/types/workspace-core";
import { useTranslation } from "@/contexts/language-context";

interface WorkspaceItemsProps {
  workspace: Workspace;
  isExpanded: boolean;
  onToggle: (workspaceId: string) => void;
  onItemClick: (workspaceId: string, item: string) => void;
  currentUserRole?: string;
}

export function WorkspaceItems({
  workspace,
  isExpanded,
  onToggle,
  onItemClick,
  currentUserRole,
}: WorkspaceItemsProps): JSX.Element {
  const { t } = useTranslation();

  // Get the icon component if workspace has an icon
  const IconComponent =
    workspace.icon &&
    workspace.icon in LucideIcons &&
    (LucideIcons[
      workspace.icon as keyof typeof LucideIcons
    ] as React.ComponentType<any>);

  return (
    <div className="group">
      {/* Workspace Header */}
      <button
        onClick={() => onToggle(workspace.id)}
        className="w-full p-2 text-left hover:bg-slate-100 rounded-lg transition-all duration-200 border border-slate-200 hover:border-slate-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {workspace.icon && IconComponent ? (
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-slate-700" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-700 text-xs font-bold">
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate group-hover:text-slate-800 transition-colors text-sm">
                {workspace.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentUserRole && (
              <span
                className={`px-1.5 py-0.5 text-xs font-medium rounded-md ${
                  currentUserRole === "owner"
                    ? "bg-slate-200 text-slate-700"
                    : currentUserRole === "admin"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {currentUserRole}
              </span>
            )}
            <div className="p-0.5 rounded-md group-hover:bg-slate-200 transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-900 transition-colors" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-900 transition-colors" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Workspace Items */}
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => onItemClick(workspace.id, "boards")}
            className="w-full flex items-center space-x-2 p-2 text-xs text-slate-800 hover:bg-slate-100 rounded-md transition-all duration-200 group/item"
          >
            <div className="p-1 rounded bg-slate-200 group-hover/item:bg-slate-300 transition-colors">
              <Layout className="h-3 w-3 text-slate-700" />
            </div>
            <span className="font-medium">{t("workspaceItems.boards")}</span>
          </button>

          <button
            onClick={() => onItemClick(workspace.id, "members")}
            className="w-full flex items-center space-x-2 p-2 text-xs text-slate-800 hover:bg-slate-100 rounded-md transition-all duration-200 group/item"
          >
            <div className="p-1 rounded bg-slate-200 group-hover/item:bg-slate-300 transition-colors">
              <Users className="h-3 w-3 text-slate-700" />
            </div>
            <span className="font-medium flex-1 text-left">
              {t("workspaceItems.members")}
            </span>
            <div className="p-0.5 rounded bg-slate-200 group-hover/item:bg-slate-300 transition-colors">
              <Plus className="h-2.5 w-2.5 text-slate-700" />
            </div>
          </button>

          {currentUserRole === "owner" && (
            <button
              onClick={() => onItemClick(workspace.id, "settings")}
              className="w-full flex items-center space-x-2 p-2 text-xs text-slate-800 hover:bg-slate-100 rounded-md transition-all duration-200 group/item"
            >
              <div className="p-1 rounded bg-slate-200 group-hover/item:bg-slate-300 transition-colors">
                <Settings className="h-3 w-3 text-slate-700" />
              </div>
              <span className="font-medium">
                {t("workspaceItems.settings")}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
