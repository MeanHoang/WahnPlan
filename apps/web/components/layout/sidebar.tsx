"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Layout,
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r-2 border-slate-300 z-40 transform transition-all duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:${isOpen ? "translate-x-0" : "-translate-x-full"} w-80 sm:w-72 lg:w-80`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {t("sidebar.workspaces")}
                </h2>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refetch();
                    onRefresh?.();
                  }}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4 text-slate-700" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors duration-200 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200 hidden lg:flex"
                >
                  {isOpen ? (
                    <ChevronLeft className="h-4 w-4 text-slate-700" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-slate-700" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-500 mx-auto"></div>
                  <div
                    className="absolute inset-0 rounded-full h-10 w-10 border-4 border-transparent border-r-purple-500 animate-spin mx-auto"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                    }}
                  ></div>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">
                  {t("sidebar.loadingWorkspaces")}
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-red-700">
                  {t("sidebar.failedToLoadWorkspaces")}
                </p>
              </div>
            )}

            {workspaces && workspaces.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Layout className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {t("sidebar.noWorkspacesFound")}
                </p>
                <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  {t("sidebar.createFirstWorkspace")}
                </p>
              </div>
            )}

            {workspaces && workspaces.length > 0 && (
              <div className="space-y-2">
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
