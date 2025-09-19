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
import { Task, TaskStatus } from "@/types/task";
import { apiRequest } from "@/lib/api-request";
import {
  getStatusStyle,
  getTaskAttributeClasses,
} from "@/lib/task-attribute-helpers";

interface ExportManagerProps {
  boardId: string;
}

interface ExportFilters {
  createdAtFrom: string;
  createdAtTo: string;
  statusIds: string[];
  isDone: boolean | null; // null = all, true = done only, false = not done only
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
    createdAtFrom: "",
    createdAtTo: "",
    statusIds: [],
    isDone: null, // null = all tasks
  });

  // For export, we don't need to fetch all tasks upfront
  // The export API will handle fetching all data based on filters
  const { data: statusesData } = useFetchApi<TaskStatus[]>(
    `/task-status?boardId=${boardId}`
  );

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

  const handleSelectAll = (key: keyof ExportFilters, allValues: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: allValues,
    }));
  };

  const handleDeselectAll = (key: keyof ExportFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: [],
    }));
  };

  const generateExcelData = (data: ExportData) => {
    const headers = [
      "Task ID",
      "Title",
      "Due Date",
      "Status",
      "Priority",
      "Initiative",
      "OKR",
      "Assignee",
      "Reviewer",
      "Tester",
      "BA User",
      "Is Done",
      "Story Points",
      "Size Card",
      "Test Case",
      "Go Live Date",
      "Dev MR",
      "Staging",
      "Sprint",
      "Feature Categories",
      "Sprint Goal",
      "Created Date",
      "Updated Date",
      "Created By",
      "Members",
      "Attachments",
    ];

    const rows = data.tasks.map((task) => [
      task.id,
      task.title,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
      task.taskStatus?.title || "",
      task.taskPriority?.name || "",
      task.taskInitiative?.name || "",
      task.okr || "",
      task.assignee?.fullname || task.assignee?.publicName || "",
      task.reviewer?.fullname || task.reviewer?.publicName || "",
      task.tester?.fullname || task.tester?.publicName || "",
      task.baUser?.fullname || task.baUser?.publicName || "",
      task.isDone ? "Yes" : "No",
      task.storyPoint || 0,
      task.sizeCard || "",
      task.testCase || "",
      task.goLive ? new Date(task.goLive).toLocaleDateString() : "",
      task.devMr || "",
      task.staging || "",
      task.sprint || "",
      task.featureCategories || "",
      task.sprintGoal || "",
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "",
      task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "",
      task.createdBy?.fullname || task.createdBy?.publicName || "",
      task.taskMembers
        ?.map((member) => member.user.fullname || member.user.publicName)
        .join(", ") || "",
      task.attachments ? JSON.stringify(task.attachments) : "",
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
      // Fetch filtered data
      const data: ExportData = await apiRequest<ExportData>(
        `/boards/${boardId}/tasks/export`,
        {
          query: {
            createdAtFrom: filters.createdAtFrom,
            createdAtTo: filters.createdAtTo,
            statusIds:
              filters.statusIds.length > 0
                ? filters.statusIds.join(",")
                : undefined,
            isDone:
              filters.isDone !== null ? filters.isDone.toString() : undefined,
          },
        }
      );

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
          {/* Created Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createdAtFrom">Created From Date</Label>
              <Input
                id="createdAtFrom"
                type="date"
                value={filters.createdAtFrom}
                onChange={(e) =>
                  handleFilterChange("createdAtFrom", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createdAtTo">Created To Date</Label>
              <Input
                id="createdAtTo"
                type="date"
                value={filters.createdAtTo}
                onChange={(e) =>
                  handleFilterChange("createdAtTo", e.target.value)
                }
              />
            </div>
          </div>

          {/* Is Done Filter */}
          <div className="space-y-3">
            <Label>Task Completion Status</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="isDoneAll"
                  name="isDone"
                  checked={filters.isDone === null}
                  onChange={() => handleFilterChange("isDone", null)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDoneAll">All Tasks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="isDoneTrue"
                  name="isDone"
                  checked={filters.isDone === true}
                  onChange={() => handleFilterChange("isDone", true)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDoneTrue">Completed Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="isDoneFalse"
                  name="isDone"
                  checked={filters.isDone === false}
                  onChange={() => handleFilterChange("isDone", false)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDoneFalse">Not Completed Only</Label>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Statuses</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSelectAll(
                      "statusIds",
                      statusesData?.map((s) => s.id) || []
                    )
                  }
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeselectAll("statusIds")}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
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
                  <Label
                    htmlFor={`status-${status.id}`}
                    className="text-sm flex items-center"
                  >
                    <span
                      className={`${getTaskAttributeClasses()}`}
                      style={getStatusStyle(status)}
                    >
                      {status.title}
                    </span>
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
                Export filtered tasks with all details to Excel file
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
