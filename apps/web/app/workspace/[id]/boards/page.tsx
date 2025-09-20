"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateBoardModal } from "@/components/boards/create-board-modal";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/language-context";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { Board } from "@/types/board-core";
import { Workspace } from "@/types/workspace-core";

export default function WorkspaceBoardsPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);

  const { data: workspaceData, loading: workspaceLoading } =
    useFetchApi<Workspace>(`/workspaces/${workspaceId}`);

  const {
    data: boardsData,
    loading: boardsLoading,
    refetch: refetchBoards,
  } = useFetchApi<Board[]>(`/boards?workspaceId=${workspaceId}`);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (workspaceData) {
      setWorkspace(workspaceData);
    }
  }, [workspaceData]);

  useEffect(() => {
    if (boardsData) {
      setBoards(boardsData);
    }
  }, [boardsData]);

  const handleBoardCreated = () => {
    refetchBoards();
  };

  const handleBoardClick = (boardId: string) => {
    router.push(`/workspace/${workspaceId}/board/${boardId}`);
  };

  if (authLoading || workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user || !workspace) {
    return <></>;
  }

  return (
    <DashboardLayout onSearch={(query: string) => {}} onCreateClick={() => {}}>
      <div className="px-12 py-8 ml-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              {workspace.name}
            </h1>
            <p className="text-gray-600 mt-2">
              {workspace.description || t("workspace.manageProjectBoards")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">{t("navigation.boards")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {boards.length}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("workspace.totalBoards")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{boards.length}</div>
              <p className="text-xs text-muted-foreground">
                {boards.length === 0
                  ? t("workspace.noBoardsYet")
                  : t("workspace.activeProjectBoards")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("workspace.totalTasks")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {boards.reduce((sum, board) => sum + board._count.tasks, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("workspace.acrossAllBoards")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("workspace.workspaceMembers")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workspace.members.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("workspace.teamMembers")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Boards Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("workspace.yourBoards")}
            </h2>
            <CreateBoardModal
              workspaceId={workspaceId}
              onBoardCreated={handleBoardCreated}
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("workspace.createNewBoard")}
                </Button>
              }
            />
          </div>

          {boardsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">
                {t("workspace.loadingBoards")}
              </p>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("workspace.noBoardsYet")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("workspace.getStartedCreatingBoard")}
              </p>
              <CreateBoardModal
                workspaceId={workspaceId}
                onBoardCreated={handleBoardCreated}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Card
                  key={board.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
                  onClick={() => handleBoardClick(board.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {board.title}
                        </CardTitle>
                        {board.subtitle && (
                          <CardDescription className="mt-2 text-sm text-gray-600">
                            {board.subtitle}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {board._count.tasks} {t("workspace.tasks")}
                      </span>
                      <span>
                        {board._count.taskStatuses} {t("workspace.statuses")}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      {t("workspace.created")}{" "}
                      {new Date(board.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
