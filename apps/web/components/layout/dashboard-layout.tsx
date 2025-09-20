"use client";

import { ReactNode, useState } from "react";
import { ChevronRight as ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onCreateClick?: () => void;
  currentWorkspaceId?: string;
}

export function DashboardLayout({
  children,
  onSearch,
  onCreateClick,
  currentWorkspaceId,
}: DashboardLayoutProps): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={onSearch}
        onCreateClick={onCreateClick}
        onSidebarToggle={toggleSidebar}
        currentWorkspaceId={currentWorkspaceId}
      />

      <div className="flex">
        {isSidebarOpen && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
            onRefresh={onCreateClick}
          />
        )}

        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
        >
          {/* Sidebar Toggle Button when closed */}
          {!isSidebarOpen && (
            <div className="fixed left-4 top-20 z-40 hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2 bg-white shadow-md border border-gray-200"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          )}
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
