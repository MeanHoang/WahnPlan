"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Filter,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useToast } from "@/hooks/use-toast";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface ExportManagerProps {
  boardId: string;
}

interface ExportFilters {
  dateFrom: string;
  dateTo: string;
  assigneeIds: string[];
  statusIds: string[];
  priorityIds: string[];
  initiativeIds: string[];
  includeCompleted: boolean;
  includeInProgress: boolean;
  includeOverdue: boolean;
}

interface ExportData {
  tasks: Task[];
  filters: ExportFilters;
  generatedAt: Date;
  totalTasks: number;
  totalStoryPoints: number;
  totalHours: number;
}

export function ExportManager({ boardId }: ExportManagerProps): JSX.Element {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    dateFrom: "",
    dateTo: "",
    assigneeIds: [],
    statusIds: [],
    priorityIds: [],
    initiativeIds: [],
    includeCompleted: true,
    includeInProgress: true,
    includeOverdue: true,
  });

  // Fetch data for filters
  const { data: tasksData } = useFetchApi<Task[]>(`/boards/${boardId}/tasks`);
  const { data: statusesData } = useFetchApi<TaskStatus[]>(
    `/task-status?boardId=${boardId}`
  );
  const { data: prioritiesData } = useFetchApi<TaskPriority[]>(
    `/task-priority?boardId=${boardId}`
  );
  const { data: initiativesData } = useFetchApi<TaskInitiative[]>(
    `/task-initiative?boardId=${boardId}`
  );

  // Get unique assignees from tasks
  const assignees = Array.from(
    new Set(tasksData?.map((task) => task.assigneeId).filter(Boolean) || [])
  ).map((id) => {
    const task = tasksData?.find((t) => t.assigneeId === id);
    return {
      id: id!,
      name: task?.assignee?.fullname || task?.assignee?.publicName || "Unknown",
    };
  });

  const handleFilterChange = (key: keyof ExportFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayFilterChange = (
    key: keyof ExportFilters,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: checked
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter((id) => id !== value),
    }));
  };

  const generateExcelData = (data: ExportData) => {
    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Initiative",
      "Assignee",
      "Reviewer",
      "Tester",
      "Story Points",
      "Created Date",
      "Due Date",
      "Completed Date",
      "Is Done",
      "Sprint",
      "MR Link",
      "Test Cases",
      "Go Live Date",
    ];

    const rows = data.tasks.map((task) => [
      task.id,
      task.title,
      task.title, // Using title as description fallback
      task.taskStatus?.title || "",
      task.taskPriority?.name || "",
      task.taskInitiative?.name || "",
      task.assignee?.fullname || task.assignee?.publicName || "",
      task.reviewer?.fullname || task.reviewer?.publicName || "",
      task.tester?.fullname || task.tester?.publicName || "",
      task.storyPoint || 0,
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "",
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
      task.isDone && task.updatedAt
        ? new Date(task.updatedAt).toLocaleDateString()
        : "",
      task.isDone ? "Yes" : "No",
      task.sprint || "",
      "", // mrLink not available
      "", // testCases not available
      "", // goLiveDate not available
    ]);

    return [headers, ...rows];
  };

  const downloadExcel = (data: ExportData) => {
    const excelData = generateExcelData(data);

    // Create CSV content
    const csvContent = excelData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `board-tasks-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.assigneeIds.length > 0)
        params.append("assigneeIds", filters.assigneeIds.join(","));
      if (filters.statusIds.length > 0)
        params.append("statusIds", filters.statusIds.join(","));
      if (filters.priorityIds.length > 0)
        params.append("priorityIds", filters.priorityIds.join(","));
      if (filters.initiativeIds.length > 0)
        params.append("initiativeIds", filters.initiativeIds.join(","));
      params.append("includeCompleted", filters.includeCompleted.toString());
      params.append("includeInProgress", filters.includeInProgress.toString());
      params.append("includeOverdue", filters.includeOverdue.toString());

      // Fetch filtered data
      const response = await fetch(
        `/api/boards/${boardId}/tasks/export?${params.toString()}`
      );
      const data: ExportData = await response.json();

      // Calculate summary
      const totalStoryPoints = data.tasks.reduce(
        (sum, task) => sum + (task.storyPoint || 0),
        0
      );
      const totalHours = data.tasks.reduce((sum, task) => sum + 0, 0); // estimatedHours not available

      const exportData: ExportData = {
        ...data,
        totalStoryPoints,
        totalHours,
      };

      downloadExcel(exportData);

      toast({
        title: "Export Successful",
        description: `Exported ${data.totalTasks} tasks to Excel file`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileSpreadsheet className="h-5 w-5" />
            Export Tasks for Payroll
          </CardTitle>
          <CardDescription className="text-blue-600">
            Export task data to Excel for salary calculation and reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {tasksData?.length || 0}
              </p>
              <p className="text-sm text-blue-600">Total Tasks</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {tasksData?.reduce(
                  (sum, task) => sum + (task.storyPoint || 0),
                  0
                ) || 0}
              </p>
              <p className="text-sm text-blue-600">Story Points</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {tasksData?.filter((task) => task.isDone).length || 0}
              </p>
              <p className="text-sm text-blue-600">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Export Filters
          </CardTitle>
          <CardDescription>
            Configure what data to include in the export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>

          {/* Task Status Filters */}
          <div className="space-y-3">
            <Label>Task Status</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeCompleted"
                  checked={filters.includeCompleted}
                  onChange={(e) =>
                    handleFilterChange("includeCompleted", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeCompleted">Include Completed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeInProgress"
                  checked={filters.includeInProgress}
                  onChange={(e) =>
                    handleFilterChange("includeInProgress", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeInProgress">Include In Progress</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeOverdue"
                  checked={filters.includeOverdue}
                  onChange={(e) =>
                    handleFilterChange("includeOverdue", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeOverdue">Include Overdue</Label>
              </div>
            </div>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-3">
            <Label>Assignees</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {assignees.map((assignee) => (
                <div key={assignee.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`assignee-${assignee.id}`}
                    checked={filters.assigneeIds.includes(assignee.id)}
                    onChange={(e) =>
                      handleArrayFilterChange(
                        "assigneeIds",
                        assignee.id,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor={`assignee-${assignee.id}`}
                    className="text-sm"
                  >
                    {assignee.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Statuses</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {statusesData?.map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`status-${status.id}`}
                    checked={filters.statusIds.includes(status.id)}
                    onChange={(e) =>
                      handleArrayFilterChange(
                        "statusIds",
                        status.id,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`status-${status.id}`} className="text-sm">
                    {status.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label>Priorities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {prioritiesData?.map((priority) => (
                <div key={priority.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`priority-${priority.id}`}
                    checked={filters.priorityIds.includes(priority.id)}
                    onChange={(e) =>
                      handleArrayFilterChange(
                        "priorityIds",
                        priority.id,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor={`priority-${priority.id}`}
                    className="text-sm"
                  >
                    {priority.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Initiative Filter */}
          <div className="space-y-3">
            <Label>Initiatives</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {initiativesData?.map((initiative) => (
                <div
                  key={initiative.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={`initiative-${initiative.id}`}
                    checked={filters.initiativeIds.includes(initiative.id)}
                    onChange={(e) =>
                      handleArrayFilterChange(
                        "initiativeIds",
                        initiative.id,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <Label
                    htmlFor={`initiative-${initiative.id}`}
                    className="text-sm"
                  >
                    {initiative.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to Export</h3>
              <p className="text-sm text-gray-600">
                Export filtered tasks to Excel for payroll calculation
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
