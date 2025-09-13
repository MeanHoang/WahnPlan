"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Users, BarChart3, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useBoard } from "@/hooks/use-board-api";
import { Board } from "@/types/board-core";

export default function BoardDetailPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);

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

  const handleBackToBoards = () => {
    router.push(`/workspace/${workspaceId}/boards`);
  };

  if (authLoading || boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !board) {
    return <></>;
  }

  return (
    <DashboardLayout onSearch={(query: string) => {}} onCreateClick={() => {}}>
      <div className="px-12 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToBoards}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                {board.title}
              </h1>
              {board.subtitle && (
                <p className="text-gray-600 mt-2">{board.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Board Info */}
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            Board: {board.title}
          </h3>
          {board.subtitle && (
            <p className="text-gray-600 mb-6">{board.subtitle}</p>
          )}
          <p className="text-gray-500">
            Tasks and board management features coming soon...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
