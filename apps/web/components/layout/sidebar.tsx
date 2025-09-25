"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Layout,
  Home,
  Building2,
  Clock,
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
    data: workspacesData,
    loading,
    error,
    refetch,
  } = useFetchApi<{
    workspaces: Workspace[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>("/workspaces");

  const workspaces = workspacesData?.workspaces || [];

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

  const handleDashboardClick = () => {
    // Close sidebar on mobile after navigation
    onClose();
    router.push("/dashboard");
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-slate-200 z-40 transform transition-all duration-200 ease-in-out shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:${isOpen ? "translate-x-0" : "-translate-x-full"} w-80 sm:w-72 lg:w-80`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            {/* Navigation Items */}
            <div className="space-y-3">
              {/* Dashboard Button */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-lg transition-colors duration-150 border border-transparent group">
                <div
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                  onClick={handleDashboardClick}
                >
                  <div className="p-1.5 bg-slate-200 rounded-md">
                    <Home className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <span className="font-medium text-slate-800 group-hover:text-slate-900">
                    {t("sidebar.dashboard")}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors duration-150 lg:hidden"
                  >
                    <X className="h-4 w-4 text-slate-700" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors duration-150 hidden lg:flex"
                  >
                    {isOpen ? (
                      <ChevronLeft className="h-4 w-4 text-slate-700" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-slate-700" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Project Management Button */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-lg transition-colors duration-150 border border-transparent group">
                <div
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                  onClick={() => {
                    onClose();
                    router.push("/board-management");
                  }}
                >
                  <div className="p-1.5 bg-slate-200 rounded-md">
                    <Clock className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <span className="font-medium text-slate-800 group-hover:text-slate-900">
                    {t("sidebar.boardManagement")}
                  </span>
                </div>
              </div>

              {/* Workspaces Section */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-slate-200 rounded-md">
                    <Building2 className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <span className="font-medium text-slate-800">
                    {t("sidebar.workspaces")}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      refetch();
                      onRefresh?.();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors duration-150"
                  >
                    <RefreshCw className="h-4 w-4 text-slate-700" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-500 mx-auto"></div>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">
                  {t("sidebar.loadingWorkspaces")}
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-6 w-6 text-slate-700" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
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
