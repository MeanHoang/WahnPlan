"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Grid3X3,
  Menu,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/language-context";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useFetchApi } from "@/hooks";
import { useRouter } from "next/navigation";
import { Workspace } from "@/types/workspace-core";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCreateClick?: () => void;
  onSidebarToggle?: () => void;
  currentWorkspaceId?: string;
}

export function Header({
  onSearch,
  onCreateClick,
  onSidebarToggle,
  currentWorkspaceId,
}: HeaderProps): JSX.Element {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const { data: unreadData } = useFetchApi<{
    unreadCount: number;
  }>("/notifications/unread-count");

  const unreadCount = unreadData?.unreadCount || 0;

  // Fetch workspaces for search
  const { data: workspacesData } = useFetchApi<Workspace[]>("/workspaces");
  const workspaces = workspacesData || [];

  // Filter workspaces based on search query
  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    }

    if (isSearchDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchDropdownOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchDropdownOpen(value.length > 0);
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    router.push(`/workspace/${workspace.id}/boards`);
    setSearchQuery("");
    setIsSearchDropdownOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b-2 border-slate-300 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and App Launcher */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 lg:hidden hover:bg-slate-100 rounded-lg transition-colors duration-200"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">W</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              WahnPlan
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  type="text"
                  placeholder={t("header.searchWorkspaces")}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-12 h-10 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200 text-base"
                />
              </form>

              {/* Search Results Dropdown */}
              {isSearchDropdownOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                  {filteredWorkspaces.length > 0 ? (
                    <div className="p-2">
                      {filteredWorkspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => handleWorkspaceSelect(workspace)}
                          className="w-full p-3 text-left hover:bg-slate-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white text-sm font-bold">
                                {workspace.icon ||
                                  workspace.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {workspace.name}
                              </p>
                              {workspace.description && (
                                <p className="text-sm text-slate-600 truncate">
                                  {workspace.description}
                                </p>
                              )}
                            </div>
                            <Building2 className="h-4 w-4 text-slate-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No workspaces found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <CreateWorkspaceModal onWorkspaceCreated={onCreateClick} />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-1">
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200 relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-5 w-5 text-slate-700 hover:text-blue-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              currentWorkspaceId={currentWorkspaceId}
              onUnreadCountChange={() => {
                // Trigger refetch of unread count
                window.location.reload();
              }}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <HelpCircle className="h-5 w-5 text-slate-700" />
          </Button>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="focus:outline-none hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 rounded-full transition-all duration-200"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullname || user.email}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center cursor-pointer shadow-md">
                  <span className="text-white text-sm font-bold">
                    {getInitials(user?.fullname || user?.email || "U")}
                  </span>
                </div>
              )}
            </button>
            <UserDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
