"use client";

import { ReactNode } from "react";
import { Header } from "@/components/layout/header";

interface DashboardLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onCreateClick?: () => void;
}

export function DashboardLayout({
  children,
  onSearch,
  onCreateClick,
}: DashboardLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={onSearch} onCreateClick={onCreateClick} />
      <main className="pt-4">{children}</main>
    </div>
  );
}
