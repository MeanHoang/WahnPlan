"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Layout,
  Building2,
  Users,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useTranslation, useLanguage } from "@/contexts/language-context";

interface Board {
  id: string;
  title: string;
  subtitle?: string;
  workspace: {
    id: string;
    name: string;
  };
  _count: {
    tasks: number;
    taskStatuses: number;
    taskPriorities: number;
    taskInitiatives: number;
  };
  updatedAt: string;
  createdAt: string;
  tasks: Array<{
    id: string;
    updatedAt: string;
    createdAt: string;
  }>;
}

export default function BoardManagementPage(): JSX.Element {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: recentBoardsData,
    loading,
    error,
    refetch,
  } = useFetchApi<Board[]>("/boards/recent");

  // Filter boards based on search query
  const filteredBoards = useMemo(() => {
    if (!recentBoardsData) return [];
    if (!searchQuery.trim()) return recentBoardsData;

    const query = searchQuery.toLowerCase().trim();
    return recentBoardsData.filter(
      (board) =>
        board.title.toLowerCase().includes(query) ||
        board.workspace.name.toLowerCase().includes(query)
    );
  }, [recentBoardsData, searchQuery]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    // Check if user is not verified
    if (!isLoading && user && !user.emailVerify) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleBoardClick = (workspaceId: string, boardId: string) => {
    router.push(`/workspace/${workspaceId}/board/${boardId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (language === "vi") {
      if (diffInDays > 0) return `${diffInDays} ngày trước`;
      if (diffInHours > 0) return `${diffInHours} giờ trước`;
      if (diffInMinutes > 0) return `${diffInMinutes} phút trước`;
      return "Vừa xong";
    } else {
      if (diffInDays > 0) return `${diffInDays} days ago`;
      if (diffInHours > 0) return `${diffInHours} hours ago`;
      if (diffInMinutes > 0) return `${diffInMinutes} minutes ago`;
      return "Just now";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <></>;
  }

  return (
    <DashboardLayout onSearch={(query: string) => {}} onCreateClick={() => {}}>
      <div className="px-12 py-8 ml-6 lg:ml-6 sm:ml-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("sidebar.boardManagement")}
              </h1>
              <p className="text-slate-600">{t("sidebar.recentBoards")}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t("sidebar.searchBoards")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {recentBoardsData && (
              <div className="text-sm text-slate-600">
                {searchQuery ? (
                  <span>
                    {filteredBoards.length} / {recentBoardsData.length}{" "}
                    {language === "vi" ? "dự án" : "boards"}
                  </span>
                ) : (
                  <span>
                    {recentBoardsData.length}{" "}
                    {language === "vi" ? "dự án" : "boards"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">
                {t("sidebar.loadingRecentBoards")}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layout className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t("sidebar.failedToLoadRecentBoards")}
              </h3>
              <Button onClick={() => refetch()} variant="outline">
                {t("common.retry")}
              </Button>
            </div>
          </div>
        )}

        {recentBoardsData && recentBoardsData.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layout className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t("sidebar.noRecentBoardsFound")}
              </h3>
              <p className="text-slate-600 mb-4">
                {t("sidebar.createFirstWorkspace")}
              </p>
            </div>
          </div>
        )}

        {filteredBoards && filteredBoards.length === 0 && searchQuery && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t("sidebar.noBoardsFound")}
              </h3>
              <p className="text-slate-600">
                {language === "vi"
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Try searching with different keywords"}
              </p>
            </div>
          </div>
        )}

        {filteredBoards && filteredBoards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <Card
                key={board.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-slate-200 hover:border-blue-300"
                onClick={() => handleBoardClick(board.workspace.id, board.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                        <Layout className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-900 transition-colors duration-200">
                          {board.title}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-600 truncate">
                            {board.workspace.name}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {board.subtitle && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {board.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{board._count.tasks}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{board._count.taskStatuses}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        {language === "vi" ? "Cập nhật" : "Updated"}{" "}
                        {formatDate(board.updatedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
