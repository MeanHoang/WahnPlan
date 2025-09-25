"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFetchApi } from "@/hooks";
import { apiRequest } from "@/lib/api-request";
import { useAuth } from "@/contexts/auth-context";
import {
  Plus,
  Search,
  Filter,
  Building,
  Users,
  Activity,
  Settings,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

export function WorkspacesTab(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { user } = useAuth();

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Try to get real workspace stats if authenticated
  const {
    data: workspaceStats,
    loading: statsLoading,
    error: statsError,
  } = useFetchApi("/workspaces/stats", {}, { enabled: !!user }) as {
    data: {
      totalWorkspaces: number;
      totalMembers: number;
      totalBoards: number;
      totalTasks: number;
    } | null;
    loading: boolean;
    error: any;
  };

  // Fetch all workspaces for the table with pagination
  const {
    data: workspacesData,
    loading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspaces,
  } = useFetchApi(
    `/workspaces?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(debouncedSearchTerm)}`,
    {},
    { enabled: !!user }
  );

  // Fetch all workspaces for statistics (no pagination)
  const {
    data: allWorkspacesData,
    loading: allWorkspacesLoading,
    error: allWorkspacesError,
    refetch: refetchAllWorkspaces,
  } = useFetchApi(
    `/workspaces?page=1&limit=1000&search=`, // Get all workspaces for stats
    {},
    { enabled: !!user }
  );

  // Only show loading if user is authenticated and data is actually loading
  const loading = user && (workspaceLoading || statsLoading);
  const error = workspaceError || statsError;

  // Mock workspace data for demonstration (replace with real data from API)
  const mockWorkspaces = [
    {
      id: "1",
      name: "Development Team",
      description: "Main development workspace",
      visibility: "private",
      members: [{ user: { fullname: "John Doe" } }],
      _count: { boards: 5 },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:45:00Z",
    },
    {
      id: "2",
      name: "Marketing Campaign",
      description: "Marketing and campaign management",
      visibility: "public",
      members: [{ user: { fullname: "Jane Smith" } }],
      _count: { boards: 3 },
      createdAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-18T16:20:00Z",
    },
  ];

  // Use real data if available, otherwise use mock data
  const apiResponse = workspacesData as any;
  const workspaces = apiResponse?.workspaces || mockWorkspaces;
  const pagination = apiResponse?.pagination || {
    page: 1,
    limit: 10,
    total: mockWorkspaces.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  // Get all workspaces for statistics
  const allWorkspacesApiResponse = allWorkspacesData as any;
  const allWorkspaces = allWorkspacesApiResponse?.workspaces || mockWorkspaces;

  // For mock data, filter based on search term
  const filteredWorkspaces = apiResponse?.workspaces
    ? workspaces // API already handles search
    : workspaces.filter(
        (workspace: any) =>
          workspace.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          workspace.description
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this workspace? This action cannot be undone."
      )
    ) {
      try {
        await apiRequest(`/workspaces/${workspaceId}`, {
          method: "DELETE",
        });
        // Refresh the data after deletion
        refetchWorkspaces();
        refetchAllWorkspaces();
      } catch (error) {
        console.error("Error deleting workspace:", error);
      }
    }
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading workspaces...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading workspace data: {error.message}
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>This usually means the API server is not running.</p>
              <p className="mt-2">
                <strong>To fix this:</strong>
              </p>
              <p className="mt-1">
                1. Start the API server:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  cd apps/api && pnpm run start:dev
                </code>
              </p>
              <p className="mt-1">
                2. Make sure the API is running on port 3002
              </p>
              <p className="mt-2 text-blue-600">
                Using mock data for demonstration below.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Workspace Management</h2>
          <Badge variant="secondary">{pagination.total} workspaces</Badge>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search workspaces by name or description..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Workspace Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workspaces
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceStats?.totalWorkspaces || allWorkspaces.length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceStats?.totalMembers ||
                allWorkspaces.reduce(
                  (acc: number, ws: any) => acc + ws.members?.length || 0,
                  0
                )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                {allWorkspaces.length > 0
                  ? (workspaceStats?.totalMembers ||
                      allWorkspaces.reduce(
                        (acc: number, ws: any) => acc + ws.members?.length || 0,
                        0
                      )) / allWorkspaces.length
                  : 0}
              </span>{" "}
              avg per workspace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceStats?.totalBoards ||
                allWorkspaces.reduce(
                  (acc: number, ws: any) => acc + (ws._count?.boards || 0),
                  0
                )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">Active</span> workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaceStats?.totalTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">Across all</span> workspaces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workspace Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Management</CardTitle>
          <CardDescription>
            Manage all workspace accounts and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Boards</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkspaces.map((workspace: any) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-mono text-sm">
                      {workspace.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {workspace.name || "N/A"}
                        </div>
                        {workspace.icon && (
                          <div className="text-sm text-muted-foreground">
                            {workspace.icon}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workspace.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          workspace.visibility === "public"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {workspace.visibility || "private"}
                      </Badge>
                    </TableCell>
                    <TableCell>{workspace.members?.length || 0}</TableCell>
                    <TableCell>{workspace._count?.boards || 0}</TableCell>
                    <TableCell>
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit workspace"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkspace(workspace.id)}
                          title="Delete workspace"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workspaces found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
