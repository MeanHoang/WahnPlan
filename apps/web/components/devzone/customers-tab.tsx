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
  Download,
  Upload,
  Search,
  UserPlus,
  Mail,
  Phone,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function CustomersTab(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Try to get real customer data if authenticated
  const {
    data: customersData,
    loading: customerLoading,
    error: customerError,
  } = useFetchApi("/users/stats", {}, { enabled: !!user });

  // Fetch all users for the table with pagination
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useFetchApi(
    `/users?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(debouncedSearchTerm)}`,
    {},
    { enabled: !!user }
  );

  // Fetch all users for statistics (no pagination)
  const {
    data: allUsersData,
    loading: allUsersLoading,
    error: allUsersError,
    refetch: refetchAllUsers,
  } = useFetchApi(
    `/users?page=1&limit=1000&search=`, // Get all users for stats
    {},
    { enabled: !!user }
  );

  // Only show loading if user is authenticated and data is actually loading
  const loading = user && (customerLoading || usersLoading);
  const error = customerError || usersError;

  // Mock user data for demonstration (replace with real data from API)
  const mockUsers = [
    {
      id: "1",
      email: "john.doe@example.com",
      fullname: "John Doe",
      publicName: "John",
      jobTitle: "Software Engineer",
      organization: "Tech Corp",
      location: "New York, NY",
      emailVerify: true,
      enable: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:45:00Z",
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      fullname: "Jane Smith",
      publicName: "Jane",
      jobTitle: "Product Manager",
      organization: "Design Inc",
      location: "San Francisco, CA",
      emailVerify: true,
      enable: true,
      createdAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-18T16:20:00Z",
    },
    {
      id: "3",
      email: "mike.wilson@example.com",
      fullname: "Mike Wilson",
      publicName: "Mike",
      jobTitle: "UX Designer",
      organization: "Creative Studio",
      location: "Austin, TX",
      emailVerify: false,
      enable: true,
      createdAt: "2024-01-05T11:45:00Z",
      updatedAt: "2024-01-12T13:30:00Z",
    },
    {
      id: "4",
      email: "sarah.johnson@example.com",
      fullname: "Sarah Johnson",
      publicName: "Sarah",
      jobTitle: "Data Analyst",
      organization: "Analytics Co",
      location: "Chicago, IL",
      emailVerify: true,
      enable: false,
      createdAt: "2023-12-20T08:00:00Z",
      updatedAt: "2024-01-08T10:15:00Z",
    },
  ];

  // Use real data if available, otherwise use mock data
  const apiResponse = usersData as any;
  const users = apiResponse?.users || mockUsers;
  const pagination = apiResponse?.pagination || {
    page: 1,
    limit: 10,
    total: mockUsers.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  // Get all users for statistics
  const allUsersApiResponse = allUsersData as any;
  const allUsers = allUsersApiResponse?.users || mockUsers;

  // For mock data, filter based on search term
  const filteredUsers = apiResponse?.users
    ? users // API already handles search
    : users.filter(
        (user: any) =>
          user.email
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.fullname
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.publicName
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.organization
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: { enable: !currentStatus },
      });
      // Refresh the data after update
      refetchUsers();
      refetchAllUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await apiRequest(`/users/${userId}`, {
          method: "DELETE",
        });
        // Refresh the data after deletion
        refetchUsers();
        refetchAllUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
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

  // Export functionality
  const handleExportUsers = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3002/api/users/export", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("Failed to export users. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Import functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        alert("Please select a CSV file");
        return;
      }
      setImportFile(file);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3002/api/users/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const results = await response.json();
      setImportResults(results);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh the user list
      refetchUsers();
      refetchAllUsers();
    } catch (error) {
      console.error("Error importing users:", error);
      alert(
        "Failed to import users. Please check your file format and try again."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelImport = () => {
    setImportFile(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      "Email",
      "Full Name",
      "Public Name",
      "Job Title",
      "Organization",
      "Location",
      "Email Verified",
      "Enabled",
      "Language",
      "Timezone",
    ];

    const templateRow = [
      "example@email.com",
      "John Doe",
      "John",
      "Software Engineer",
      "Tech Corp",
      "New York, NY",
      "true",
      "true",
      "en",
      "UTC",
    ];

    // Create CSV with headers and example data
    const csvContent = [templateHeaders, templateRow]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
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
              Error loading user data: {error.message}
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
          <h2 className="text-2xl font-bold">User Management</h2>
          <Badge variant="secondary">{pagination.total} users</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportUsers}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : "Import Users"}
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name, email, organization..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Import File Preview */}
      {importFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Import Preview</span>
            </CardTitle>
            <CardDescription>
              Review the file before importing users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{importFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelImport}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleImportUsers}
                    disabled={isImporting}
                  >
                    {isImporting ? "Importing..." : "Import Users"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Import Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {importResults.successful || 0}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {importResults.failed || 0}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResults.skipped || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResults.total || 0}
                  </div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-700 mb-2">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {importResults.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm text-red-600 p-2 bg-red-50 rounded mb-1"
                      >
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setImportResults(null)}
                className="w-full"
              >
                Close Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter((u: any) => u.enable).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">85%</span> of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter((u: any) => u.emailVerify).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Disabled Users
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter((u: any) => !u.enable).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">Requires attention</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage all user accounts and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Public Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">
                      {user.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {user.fullname || "N/A"}
                        </div>
                        {user.jobTitle && (
                          <div className="text-sm text-muted-foreground">
                            {user.jobTitle}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.publicName || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.enable ? "default" : "destructive"}>
                        {user.enable ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.emailVerify ? "default" : "secondary"}
                      >
                        {user.emailVerify ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleUserStatus(user.id, user.enable)
                          }
                          title={user.enable ? "Disable user" : "Enable user"}
                        >
                          <Lock
                            className={`h-4 w-4 ${user.enable ? "text-green-600" : "text-red-600"}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete user"
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
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search criteria.
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
