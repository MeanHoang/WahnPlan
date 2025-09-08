"use client";

import { useState } from "react";
import { X, Users, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MembersSidebarProps {
  workspaceId: string;
}

type ActiveTab = "members" | "guests" | "requests";

export function MembersSidebar({
  workspaceId,
}: MembersSidebarProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>("members");

  const sidebarItems = [
    {
      id: "members" as ActiveTab,
      label: "Workspace members",
      count: 1, // TODO: Get from API
      icon: Users,
    },
    {
      id: "guests" as ActiveTab,
      label: "Guests",
      count: 0, // TODO: Get from API
      icon: UserCheck,
    },
    {
      id: "requests" as ActiveTab,
      label: "Join requests",
      count: 0, // TODO: Get from API
      icon: UserPlus,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium text-gray-900">Collaborators</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              1/10
            </span>
            <Button variant="ghost" size="sm" className="p-2">
              <X className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-gray-500">({item.count})</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4"></div>

        {/* Upgrade Section */}
        <div className="bg-purple-50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">
            Upgrade for more permissions controls
          </h3>
          <p className="text-xs text-purple-700 mb-3">
            Decide who can send invitations, edit Workspace settings, and more
            with Premium.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-100 p-0 h-auto"
          >
            Try Premium free for 14 days
          </Button>
        </div>
      </div>
    </div>
  );
}
