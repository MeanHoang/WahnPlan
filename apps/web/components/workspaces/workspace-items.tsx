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
        className="w-full p-3 text-left hover:bg-slate-100 rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300 hover:shadow-md group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {workspace.icon && IconComponent ? (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <IconComponent className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <span className="text-white text-sm font-bold">
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate group-hover:text-slate-800 transition-colors">
                {workspace.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentUserRole && (
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full ${
                  currentUserRole === "owner"
                    ? "bg-purple-200 text-purple-800"
                    : currentUserRole === "admin"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {currentUserRole}
              </span>
            )}
            <div className="p-1 rounded-lg group-hover:bg-slate-200 transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-700 group-hover:text-slate-900 transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-slate-900 transition-colors" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Workspace Items */}
      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => onItemClick(workspace.id, "boards")}
            className="w-full flex items-center space-x-3 p-3 text-sm text-slate-800 hover:bg-blue-100 hover:text-blue-900 rounded-lg transition-all duration-200 group/item border border-slate-200 hover:border-blue-300"
          >
            <div className="p-1.5 rounded-md bg-slate-200 group-hover/item:bg-blue-200 transition-colors">
              <Layout className="h-4 w-4 text-slate-700 group-hover/item:text-blue-800" />
            </div>
            <span className="font-semibold">{t("workspaceItems.boards")}</span>
          </button>

          <button
            onClick={() => onItemClick(workspace.id, "members")}
            className="w-full flex items-center space-x-3 p-3 text-sm text-slate-800 hover:bg-green-100 hover:text-green-900 rounded-lg transition-all duration-200 group/item border border-slate-200 hover:border-green-300"
          >
            <div className="p-1.5 rounded-md bg-slate-200 group-hover/item:bg-green-200 transition-colors">
              <Users className="h-4 w-4 text-slate-700 group-hover/item:text-green-800" />
            </div>
            <span className="font-semibold flex-1 text-left">
              {t("workspaceItems.members")}
            </span>
            <div className="p-1 rounded-md bg-slate-200 group-hover/item:bg-green-200 transition-colors">
              <Plus className="h-3 w-3 text-slate-700 group-hover/item:text-green-800" />
            </div>
          </button>

          {currentUserRole === "owner" && (
            <button
              onClick={() => onItemClick(workspace.id, "settings")}
              className="w-full flex items-center space-x-3 p-3 text-sm text-slate-800 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition-all duration-200 group/item border border-slate-200 hover:border-amber-300"
            >
              <div className="p-1.5 rounded-md bg-slate-200 group-hover/item:bg-amber-200 transition-colors">
                <Settings className="h-4 w-4 text-slate-700 group-hover/item:text-amber-800" />
              </div>
              <span className="font-semibold">
                {t("workspaceItems.settings")}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
