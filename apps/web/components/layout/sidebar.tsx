"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useTranslation } from "@/contexts/language-context";
import { apiRequest } from "@/lib/api-request";
import { Workspace } from "@/types/workspace-core";
import { WorkspaceItems } from "@/components/workspaces/workspace-items";

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
  const router = useRouter();
  const { t } = useTranslation();
  const {
    data: workspaces,
    loading,
    error,
    refetch,
  } = useFetchApi<Workspace[]>("/workspaces");

  // Get current user info
  const { data: currentUser } = useFetchApi<any>("/auth/me");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set()
  );
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  // Fetch user roles for each workspace
  useEffect(() => {
    if (workspaces && currentUser) {
      const fetchUserRoles = async () => {
        const roles: Record<string, string> = {};
        for (const workspace of workspaces) {
          try {
            const members = await apiRequest<any[]>(
              `/workspaces/${workspace.id}/members`
            );
            const currentUserMember = members.find(
              (member: any) => member.user.id === currentUser.id
            );
            roles[workspace.id] = currentUserMember?.role || "member";
          } catch (error) {
            console.error(
              `Error fetching role for workspace ${workspace.id}:`,
              error
            );
            roles[workspace.id] = "member";
          }
        }
        setUserRoles(roles);
      };
      fetchUserRoles();
    }
  }, [workspaces, currentUser]);

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
    // Close sidebar on mobile after navigation
    onClose();

    // Navigate to the appropriate page
    switch (item) {
      case "boards":
        router.push(`/workspace/${workspaceId}/boards`);
        break;
      case "members":
        router.push(`/workspace/${workspaceId}/members`);
        break;
      case "settings":
        router.push(`/workspace/${workspaceId}/settings`);
        break;
      default:
        break;
    }
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
                {t("sidebar.workspaces")}
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
                  {t("sidebar.loadingWorkspaces")}
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">
                  {t("sidebar.failedToLoadWorkspaces")}
                </p>
              </div>
            )}

            {workspaces && workspaces.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">
                  {t("sidebar.noWorkspacesFound")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t("sidebar.createFirstWorkspace")}
                </p>
              </div>
            )}

            {workspaces && workspaces.length > 0 && (
              <div className="space-y-1">
                {workspaces.map((workspace) => {
                  const isExpanded = expandedWorkspaces.has(workspace.id);

                  return (
                    <WorkspaceItems
                      key={workspace.id}
                      workspace={workspace}
                      isExpanded={isExpanded}
                      onToggle={toggleWorkspace}
                      onItemClick={handleWorkspaceItemClick}
                      currentUserRole={userRoles[workspace.id]}
                    />
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
