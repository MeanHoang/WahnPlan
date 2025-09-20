"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, Grid3X3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/language-context";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useFetchApi } from "@/hooks";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch unread count
  const { data: unreadData } = useFetchApi<{
    unreadCount: number;
  }>("/notifications/unread-count");

  const unreadCount = unreadData?.unreadCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
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
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and App Launcher */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 lg:hidden"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>

          <div className="flex items-center space-x-2">
            {/* to do add logo here */}
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">WahnPlan</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
              />
            </form>
            <CreateWorkspaceModal onWorkspaceCreated={onCreateClick} />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-50 relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
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

          <Button variant="ghost" size="sm" className="p-2">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="focus:outline-none"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullname || user.email}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500">
                  <span className="text-white text-sm font-medium">
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
