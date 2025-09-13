"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Settings,
  Grid3X3,
  BarChart,
  Users,
  FileText,
  Plus,
  Filter,
  ArrowUpDown,
  Zap,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useBoard } from "@/hooks/use-board-api";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useToast } from "@/hooks/use-toast";
import { BoardViewRenderer } from "@/components/boards/board-view-renderer";
import { CreateTaskModal } from "@/components/boards/create-task-modal";
import { Board } from "@/types/board-core";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

export default function BoardDetailPage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [selectedView, setSelectedView] = useState<string>("by-status");

  const { data: boardData, loading: boardLoading } = useBoard(boardId);

  // Tasks are now fetched by individual columns

  // Fetch statuses
  const {
    data: statuses,
    loading: statusesLoading,
    error: statusesError,
    refetch: refetchStatuses,
  } = useFetchApi<TaskStatus[]>("/task-status", { boardId });

  // Fetch priorities
  const {
    data: priorities,
    loading: prioritiesLoading,
    error: prioritiesError,
  } = useFetchApi<TaskPriority[]>("/task-priority", { boardId });

  // Fetch initiatives
  const {
    data: initiatives,
    loading: initiativesLoading,
    error: initiativesError,
  } = useFetchApi<TaskInitiative[]>("/task-initiative", { boardId });

  // Fetch workspace members for assignee view
  const {
    data: workspaceMembers,
    loading: assigneesLoading,
    error: assigneesError,
  } = useFetchApi<
    Array<{
      id: string;
      userId: string;
      role: string;
      user: {
        id: string;
        email: string;
        fullname: string | null;
        publicName: string | null;
        avatarUrl: string | null;
        jobTitle: string | null;
        organization: string | null;
      };
    }>
  >(`/workspaces/${workspaceId}/members`);

  // Tasks are now managed by individual columns

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

  // Error handling is now managed by individual columns

  useEffect(() => {
    if (statusesError) {
      toast({
        title: "Error",
        description: "Failed to load task statuses. Please try again.",
        variant: "destructive",
      });
    }
  }, [statusesError, toast]);

  useEffect(() => {
    if (prioritiesError) {
      toast({
        title: "Error",
        description: "Failed to load task priorities. Please try again.",
        variant: "destructive",
      });
    }
  }, [prioritiesError, toast]);

  useEffect(() => {
    if (initiativesError) {
      toast({
        title: "Error",
        description: "Failed to load task initiatives. Please try again.",
        variant: "destructive",
      });
    }
  }, [initiativesError, toast]);

  useEffect(() => {
    if (assigneesError) {
      toast({
        title: "Error",
        description: "Failed to load workspace members. Please try again.",
        variant: "destructive",
      });
    }
  }, [assigneesError, toast]);

  const handleBackToBoards = () => {
    router.push(`/workspace/${workspaceId}/boards`);
  };

  const handleTaskClick = (task: Task) => {
    // TODO: Open task detail modal or navigate to task page
    console.log("Task clicked:", task);
  };

  const handleAddTask = (statusId: string) => {
    setSelectedStatusId(statusId);
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // TODO: Refresh individual columns when task is created
    toast({
      title: "Success",
      description: "Task created successfully!",
      variant: "default",
    });
  };

  // Transform workspace members to assignees format
  const assignees =
    workspaceMembers?.map((member) => ({
      id: member.user.id,
      name: member.user.publicName || member.user.fullname || member.user.email,
      email: member.user.email || undefined,
      avatar: member.user.avatarUrl || undefined,
    })) || [];

  if (
    authLoading ||
    boardLoading ||
    statusesLoading ||
    prioritiesLoading ||
    initiativesLoading ||
    assigneesLoading
  ) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
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
                <p className="text-gray-600 mt-1">{board.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/workspace/${workspaceId}/board/${boardId}/settings`
                )
              }
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* View Filter Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* View Options */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedView === "by-status"
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedView("by-status")}
            >
              <Grid3X3 className="h-4 w-4" />
              By Status
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedView === "by-assignee"
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedView("by-assignee")}
            >
              <Users className="h-4 w-4" />
              By assignee
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedView === "mine"
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedView("mine")}
            >
              <Users className="h-4 w-4" />
              Mine
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedView === "by-priority"
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedView("by-priority")}
            >
              <BarChart className="h-4 w-4" />
              By Priority
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedView === "by-initiative"
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedView("by-initiative")}
            >
              <FileText className="h-4 w-4" />
              By Initiative
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              New
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <BoardViewRenderer
        view={selectedView}
        boardId={boardId}
        statuses={statuses || []}
        priorities={priorities || []}
        initiatives={initiatives || []}
        assignees={assignees}
        currentUserId={user?.id}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        boardId={boardId}
        statusId={selectedStatusId}
        statuses={statuses || []}
        priorities={priorities || []}
        initiatives={initiatives || []}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
