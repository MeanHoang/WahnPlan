"use client";

import { useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  Users,
  HelpCircle,
  Keyboard,
  LogOut,
  User,
  Activity,
  CreditCard,
  Settings,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserDropdown({
  isOpen,
  onClose,
}: UserDropdownProps): JSX.Element | null {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Menu */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-4">
          {/* Account Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Account
            </h3>
            <div className="flex items-center space-x-3 mb-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullname || user.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(user?.fullname || user?.email || "U")}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullname || user?.email}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                Switch accounts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                Manage account
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* WahnPlan Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              WahnPlan
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <User className="mr-2 h-4 w-4" />
                Profile and visibility
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm bg-gray-100"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Cards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <Palette className="mr-2 h-4 w-4" />
                Theme
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* General Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Shortcuts
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-3" />

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}
