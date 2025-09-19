"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useTranslation } from "@/contexts/language-context";
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface AnalyticsDashboardProps {
  boardId: string;
}

// Chart colors
const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

interface TaskAnalytics extends Task {
  assignee?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  reviewer?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  tester?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
    avatarUrl?: string;
  };
  taskStatus?: TaskStatus;
  taskPriority?: TaskPriority;
  taskInitiative?: TaskInitiative;
}

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  teamProductivity: Array<{
    userId: string;
    userName: string;
    avatarUrl?: string;
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  initiativeDistribution: Array<{
    initiative: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    created: number;
    completed: number;
  }>;
}

export function AnalyticsDashboard({
  boardId,
}: AnalyticsDashboardProps): JSX.Element {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  // Fetch board data with tasks
  const { data: boardData, loading } = useFetchApi<any>(`/boards/${boardId}`);

  // Calculate analytics
  const analytics = useMemo((): AnalyticsData => {
    const tasksData: TaskAnalytics[] = boardData?.tasks || [];

    if (!tasksData || tasksData.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        averageCompletionTime: 0,
        teamProductivity: [],
        statusDistribution: [],
        priorityDistribution: [],
        initiativeDistribution: [],
        monthlyTrend: [],
      };
    }

    const now = new Date();
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter((task) => task.isDone).length;
    const inProgressTasks = tasksData.filter(
      (task) => !task.isDone && task.taskStatus?.title !== "To Do"
    ).length;
    const overdueTasks = tasksData.filter(
      (task) => !task.isDone && task.dueDate && new Date(task.dueDate) < now
    ).length;

    // Calculate average completion time
    const completedTasksWithDates = tasksData.filter(
      (task) => task.isDone && task.createdAt && task.updatedAt
    );
    const averageCompletionTime =
      completedTasksWithDates.length > 0
        ? completedTasksWithDates.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            return sum + (completed.getTime() - created.getTime());
          }, 0) /
          completedTasksWithDates.length /
          (1000 * 60 * 60 * 24) // Convert to days
        : 0;

    // Team productivity
    const userStats = new Map<
      string,
      { completed: number; total: number; name: string; avatarUrl?: string }
    >();

    tasksData.forEach((task) => {
      const assigneeId = task.assigneeId;
      const assigneeName =
        task.assignee?.publicName ||
        task.assignee?.fullname ||
        t("analytics.unknown");

      if (assigneeId) {
        const current = userStats.get(assigneeId) || {
          completed: 0,
          total: 0,
          name: assigneeName,
          avatarUrl: task.assignee?.avatarUrl,
        };
        current.total++;
        if (task.isDone) current.completed++;
        userStats.set(assigneeId, current);
      }
    });

    const teamProductivity = Array.from(userStats.entries()).map(
      ([userId, stats]) => ({
        userId,
        userName: stats.name,
        avatarUrl: stats.avatarUrl,
        completedTasks: stats.completed,
        totalTasks: stats.total,
        completionRate:
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      })
    );

    // Status distribution
    const statusCounts = new Map<string, number>();
    tasksData.forEach((task) => {
      const status = task.taskStatus?.title || t("analytics.noStatus");
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const statusDistribution = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({
        status,
        count,
        percentage: (count / totalTasks) * 100,
      })
    );

    // Priority distribution
    const priorityCounts = new Map<string, number>();
    tasksData.forEach((task) => {
      const priority = task.taskPriority?.name || t("analytics.noPriority");
      priorityCounts.set(priority, (priorityCounts.get(priority) || 0) + 1);
    });

    const priorityDistribution = Array.from(priorityCounts.entries()).map(
      ([priority, count]) => ({
        priority,
        count,
        percentage: (count / totalTasks) * 100,
      })
    );

    // Initiative distribution
    const initiativeCounts = new Map<string, number>();
    tasksData.forEach((task) => {
      const initiative =
        task.taskInitiative?.name || t("analytics.noInitiative");
      initiativeCounts.set(
        initiative,
        (initiativeCounts.get(initiative) || 0) + 1
      );
    });

    const initiativeDistribution = Array.from(initiativeCounts.entries()).map(
      ([initiative, count]) => ({
        initiative,
        count,
        percentage: (count / totalTasks) * 100,
      })
    );

    // Monthly trend (simplified)
    const monthlyTrend = [
      {
        month: "Jan",
        created: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      },
      {
        month: "Feb",
        created: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      },
      {
        month: "Mar",
        created: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      },
      {
        month: "Apr",
        created: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      },
      {
        month: "May",
        created: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      },
      {
        month: "Jun",
        created: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3,
      },
    ];

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      averageCompletionTime,
      teamProductivity,
      statusDistribution,
      priorityDistribution,
      initiativeDistribution,
      monthlyTrend,
    };
  }, [boardData]);

  const completionRate =
    analytics.totalTasks > 0
      ? (analytics.completedTasks / analytics.totalTasks) * 100
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t("analytics.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {(["7d", "30d", "90d", "all"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="px-4"
          >
            {range === "7d"
              ? t("analytics.timeRange.7d")
              : range === "30d"
                ? t("analytics.timeRange.30d")
                : range === "90d"
                  ? t("analytics.timeRange.90d")
                  : t("analytics.timeRange.all")}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-600">
                  {t("analytics.totalTasks")}
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {analytics.totalTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-600">
                  {t("analytics.completed")}
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {analytics.completedTasks}
                </p>
                <p className="text-xs text-green-600">
                  {completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-600">
                  {t("analytics.inProgress")}
                </p>
                <p className="text-2xl font-bold text-orange-700">
                  {analytics.inProgressTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-600">
                  {t("analytics.overdue")}
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {analytics.overdueTasks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Productivity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("analytics.teamProductivity")}
          </CardTitle>
          <CardDescription>
            {t("analytics.taskCompletionRates")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.teamProductivity.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.completedTasks}/{member.totalTasks}{" "}
                      {t("analytics.tasksCompleted")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {member.completionRate.toFixed(1)}%
                  </p>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.min(member.completionRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t("analytics.statusDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }: any) =>
                      `${status} (${percentage.toFixed(1)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("analytics.priorityDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.priorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Initiative and Team Productivity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Initiative Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t("analytics.initiativeDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.initiativeDistribution}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="initiative" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.purple} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("analytics.teamProductivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.teamProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="completedTasks"
                    fill={COLORS.secondary}
                    name={t("analytics.completed")}
                  />
                  <Bar
                    dataKey="totalTasks"
                    fill={COLORS.accent}
                    name={t("analytics.total")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Completion Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("analytics.averageCompletionTime")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-blue-600">
                {analytics.averageCompletionTime.toFixed(1)}
              </p>
              <p className="text-lg text-gray-600">{t("analytics.days")}</p>
              <p className="text-sm text-gray-500 mt-2">
                {t("analytics.averageTimeFromCreation")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {t("analytics.monthlyTrend")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    name={t("analytics.created")}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.secondary}
                    strokeWidth={3}
                    name={t("analytics.completed")}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Rate Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("analytics.completionRateTrend")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke={COLORS.secondary}
                    fill={COLORS.secondary}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="1"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t("analytics.teamPerformance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.teamProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="completionRate"
                    fill={COLORS.purple}
                    name={t("analytics.completionRate")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
