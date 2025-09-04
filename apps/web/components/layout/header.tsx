"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCreateClick?: () => void;
}

export function Header({ onSearch, onCreateClick }: HeaderProps): JSX.Element {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          <Button variant="ghost" size="sm" className="p-2">
            <Grid3X3 className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">WahnPlan</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
            />
          </form>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-2">
          <CreateWorkspaceModal onWorkspaceCreated={onCreateClick} />
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
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
