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
import { useTranslation } from "@/contexts/language-context";
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
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    createdAtFrom: "",
    createdAtTo: "",
    statusIds: [],
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
      t("export.taskId"),
      t("export.title"),
      t("export.dueDate"),
      t("export.status"),
      t("export.priority"),
      t("export.initiative"),
      t("export.okr"),
      t("export.assignee"),
      t("export.reviewer"),
      t("export.tester"),
      t("export.baUser"),
      t("export.isDone"),
      t("export.storyPoints"),
      t("export.sizeCard"),
      t("export.testCase"),
      t("export.goLiveDate"),
      t("export.devMR"),
      t("export.staging"),
      t("export.sprint"),
      t("export.featureCategories"),
      t("export.sprintGoal"),
      t("export.createdDate"),
      t("export.updatedDate"),
      t("export.createdBy"),
      t("export.members"),
      t("export.attachments"),
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
      task.isDone ? t("common.yes") : t("common.no"),
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

    // Create CSV content with proper UTF-8 encoding for Vietnamese text
    const csvContent = excelData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Add UTF-8 BOM for proper Vietnamese character display
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    // Create and download file with UTF-8 BOM
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
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
        title: t("export.exportSuccessful"),
        description: `${t("export.exported")} ${data.totalTasks} ${t("workspace.tasks")} ${t("export.toExcelFile")}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("export.exportFailed"),
        description: t("export.failedToExportTasks"),
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
            {t("export.filterTitle")}
          </CardTitle>
          <CardDescription>
            {t("export.configureDataToInclude")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Created Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createdAtFrom">
                {t("export.createdFromDate")}
              </Label>
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
              <Label htmlFor="createdAtTo">{t("export.createdToDate")}</Label>
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

          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("export.statuses")}</Label>
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
                  {t("export.selectAll")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeselectAll("statusIds")}
                  className="text-xs"
                >
                  {t("export.clearAll")}
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
              <h3 className="text-lg font-semibold">
                {t("export.readyToExport")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("export.exportFilteredTasksDescription")}
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
              {isExporting ? t("export.exporting") : t("export.exportToExcel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
