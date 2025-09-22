"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchApi } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import {
  Plus,
  Search,
  Filter,
  Building,
  Users,
  Activity,
  Settings,
} from "lucide-react";

export function WorkspacesTab(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Try to get real workspace data if authenticated
  const {
    data: workspacesData,
    loading: workspaceLoading,
    error: workspaceError,
  } = useFetchApi("/workspaces", {}, { enabled: !!user });

  // Only show loading if user is authenticated and data is actually loading
  const loading = user && workspaceLoading;
  const error = workspaceError;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Workspace Management</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Operations
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find and manage workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search workspaces by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {Array.isArray(workspacesData) ? workspacesData.length : 89}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">75%</span> activity rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">374</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">4.2</span> avg per workspace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 TB</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">78%</span> of capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workspace List */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Overview</CardTitle>
          <CardDescription>
            Recent workspace activities and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mock workspace data */}
                {[
                  {
                    name: "Development Team",
                    members: 12,
                    boards: 5,
                    lastActivity: "2 hours ago",
                    status: "Active",
                  },
                  {
                    name: "Marketing Campaign",
                    members: 8,
                    boards: 3,
                    lastActivity: "5 hours ago",
                    status: "Active",
                  },
                  {
                    name: "Product Research",
                    members: 6,
                    boards: 2,
                    lastActivity: "1 day ago",
                    status: "Inactive",
                  },
                  {
                    name: "Customer Support",
                    members: 15,
                    boards: 4,
                    lastActivity: "30 minutes ago",
                    status: "Active",
                  },
                ].map((workspace, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {workspace.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {workspace.members} members • {workspace.boards} boards
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {workspace.lastActivity}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          workspace.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {workspace.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common workspace management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Create Test Workspace
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Workspace Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Management</CardTitle>
            <CardDescription>
              Monitor and manage workspace storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Storage</span>
                <span className="text-sm font-bold">2.3 TB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Used</span>
                <span className="text-sm font-bold text-yellow-600">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available</span>
                <span className="text-sm font-bold text-green-600">22%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
