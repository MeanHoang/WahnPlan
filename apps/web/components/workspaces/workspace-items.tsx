"use client";

import {
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  Layout,
  Plus,
} from "lucide-react";
import { Workspace } from "@/types/workspace-core";

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
  return (
    <div>
      {/* Workspace Header */}
      <button
        onClick={() => onToggle(workspace.id)}
        className="w-full p-2 text-left hover:bg-gray-50 rounded transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {workspace.icon ? (
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {workspace.icon}
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{workspace.name}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Workspace Items */}
      {isExpanded && (
        <div className="ml-4 space-y-1">
          <button
            onClick={() => onItemClick(workspace.id, "boards")}
            className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <Layout className="h-4 w-4 text-gray-500" />
            <span>Boards</span>
          </button>

          <button
            onClick={() => onItemClick(workspace.id, "members")}
            className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            <Users className="h-4 w-4 text-gray-500" />
            <span>Members</span>
            <Plus className="h-4 w-4 text-gray-500 ml-auto" />
          </button>

          {currentUserRole === "owner" && (
            <button
              onClick={() => onItemClick(workspace.id, "settings")}
              className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Settings</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
