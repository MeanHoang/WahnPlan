"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  Layout,
  Plus,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { Workspace } from "@/types/workspace-core";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onRefresh?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onToggle,
  onRefresh,
}: SidebarProps): JSX.Element {
  const {
    data: workspaces,
    loading,
    error,
    refetch,
  } = useFetchApi<Workspace[]>("/workspaces");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set()
  );

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const handleWorkspaceItemClick = (workspaceId: string, item: string) => {
    console.log(`Navigate to ${item} for workspace ${workspaceId}`);
    // TODO: Implement navigation logic
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:${isOpen ? "translate-x-0" : "-translate-x-full"} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Workspaces
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refetch();
                    onRefresh?.();
                  }}
                  className="p-2"
                >
                  <RefreshCw className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 lg:hidden"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hidden lg:flex"
                >
                  {isOpen ? (
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading workspaces...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">
                  Failed to load workspaces
                </p>
              </div>
            )}

            {workspaces && workspaces.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No workspaces found</p>
                <p className="text-xs text-gray-500 mt-1">
                  Create your first workspace to get started
                </p>
              </div>
            )}

            {workspaces && workspaces.length > 0 && (
              <div className="space-y-1">
                {workspaces.map((workspace) => {
                  const isExpanded = expandedWorkspaces.has(workspace.id);

                  return (
                    <div key={workspace.id}>
                      {/* Workspace Header */}
                      <button
                        onClick={() => toggleWorkspace(workspace.id)}
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
                              <p className="font-medium text-gray-900">
                                {workspace.name}
                              </p>
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
                            onClick={() =>
                              handleWorkspaceItemClick(workspace.id, "boards")
                            }
                            className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          >
                            <Layout className="h-4 w-4 text-gray-500" />
                            <span>Boards</span>
                          </button>

                          <button
                            onClick={() =>
                              handleWorkspaceItemClick(workspace.id, "members")
                            }
                            className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          >
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>Members</span>
                            <Plus className="h-4 w-4 text-gray-500 ml-auto" />
                          </button>

                          <button
                            onClick={() =>
                              handleWorkspaceItemClick(workspace.id, "settings")
                            }
                            className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span>Settings</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
