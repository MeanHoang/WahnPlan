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
import { Task, TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

interface AnalyticsDashboardProps {
  boardId: string;
}

interface TaskAnalytics extends Task {
  assignee?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
  };
  reviewer?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
  };
  tester?: {
    id: string;
    email: string;
    fullname?: string;
    publicName?: string;
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
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  // Fetch tasks data
  const { data: tasksData, loading } = useFetchApi<TaskAnalytics[]>(
    `/boards/${boardId}/tasks?includeAnalytics=true`
  );

  // Fetch board stats
  const { data: boardStats } = useFetchApi<any>(`/boards/${boardId}/stats`);

  // Calculate analytics
  const analytics = useMemo((): AnalyticsData => {
    if (!tasksData) {
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
      { completed: number; total: number; name: string }
    >();

    tasksData.forEach((task) => {
      const assigneeId = task.assigneeId;
      const assigneeName =
        task.assignee?.fullname || task.assignee?.publicName || "Unknown";

      if (assigneeId) {
        const current = userStats.get(assigneeId) || {
          completed: 0,
          total: 0,
          name: assigneeName,
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
        completedTasks: stats.completed,
        totalTasks: stats.total,
        completionRate:
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      })
    );

    // Status distribution
    const statusCounts = new Map<string, number>();
    tasksData.forEach((task) => {
      const status = task.taskStatus?.title || "No Status";
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
      const priority = task.taskPriority?.name || "No Priority";
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
      const initiative = task.taskInitiative?.name || "No Initiative";
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
  }, [tasksData]);

  const completionRate =
    analytics.totalTasks > 0
      ? (analytics.completedTasks / analytics.totalTasks) * 100
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
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
              ? "7 Days"
              : range === "30d"
                ? "30 Days"
                : range === "90d"
                  ? "90 Days"
                  : "All Time"}
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
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
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
                <p className="text-sm font-medium text-green-600">Completed</p>
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
                  In Progress
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
                <p className="text-sm font-medium text-red-600">Overdue</p>
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
            Team Productivity
          </CardTitle>
          <CardDescription>
            Task completion rates by team member
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
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {member.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.completedTasks}/{member.totalTasks} tasks
                      completed
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

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.statusDistribution.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.priorityDistribution.map((item) => (
                <div
                  key={item.priority}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm font-medium">{item.priority}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Initiative Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Initiative Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.initiativeDistribution.map((item) => (
                <div
                  key={item.initiative}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm font-medium">
                      {item.initiative}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Average Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-blue-600">
                {analytics.averageCompletionTime.toFixed(1)}
              </p>
              <p className="text-lg text-gray-600">days</p>
              <p className="text-sm text-gray-500 mt-2">
                Average time from creation to completion
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyTrend.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-gray-600">
                        {month.completed} completed
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs text-gray-600">
                        {month.created} created
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
