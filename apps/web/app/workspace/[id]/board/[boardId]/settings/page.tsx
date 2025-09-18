"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Palette,
  Info,
  Calendar,
  BarChart3,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useBoard } from "@/hooks/use-board-api";
import { Board } from "@/types/board-core";
import { BoardBasicInfo } from "@/components/boards/board-basic-info";
import { TaskAttributesManager } from "@/components/boards/task-attributes-manager";
import { DeadlineManager } from "@/components/boards/deadline-manager";
import { AnalyticsDashboard } from "@/components/boards/analytics-dashboard";
import { ExportManager } from "@/components/boards/export-manager";

type SettingsTab = "basic" | "attributes" | "deadline" | "analytics" | "export";

export default function BoardSettingsPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("basic");

  const { data: boardData, loading: boardLoading } = useBoard(boardId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (boardData) {
      setBoard(boardData);
    }
  }, [boardData]);

  const handleBackToBoard = () => {
    router.push(`/workspace/${workspaceId}/board/${boardId}`);
  };

  const handleBoardUpdate = (updatedBoard: Board) => {
    setBoard(updatedBoard);
  };

  if (authLoading || boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading board settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !board) {
    return <></>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToBoard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-700">
                Board Settings
              </h1>
              <p className="text-gray-600 mt-1">{board.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white p-1 rounded-lg shadow-sm border overflow-x-auto">
          <Button
            variant={activeTab === "basic" ? "default" : "ghost"}
            onClick={() => setActiveTab("basic")}
            className="flex items-center gap-2 px-4 py-3 whitespace-nowrap"
          >
            <Info className="h-4 w-4" />
            Basic Info
          </Button>
          <Button
            variant={activeTab === "attributes" ? "default" : "ghost"}
            onClick={() => setActiveTab("attributes")}
            className="flex items-center gap-2 px-4 py-3 whitespace-nowrap"
          >
            <Palette className="h-4 w-4" />
            Attributes
          </Button>
          <Button
            variant={activeTab === "deadline" ? "default" : "ghost"}
            onClick={() => setActiveTab("deadline")}
            className="flex items-center gap-2 px-4 py-3 whitespace-nowrap"
          >
            <Calendar className="h-4 w-4" />
            Deadlines
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            onClick={() => setActiveTab("analytics")}
            className="flex items-center gap-2 px-4 py-3 whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "export" ? "default" : "ghost"}
            onClick={() => setActiveTab("export")}
            className="flex items-center gap-2 px-4 py-3 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "basic" && (
            <BoardBasicInfo board={board} onBoardUpdate={handleBoardUpdate} />
          )}
          {activeTab === "attributes" && (
            <TaskAttributesManager boardId={boardId} />
          )}
          {activeTab === "deadline" && <DeadlineManager boardId={boardId} />}
          {activeTab === "analytics" && (
            <AnalyticsDashboard boardId={boardId} />
          )}
          {activeTab === "export" && <ExportManager boardId={boardId} />}
        </div>
      </div>
    </div>
  );
}
