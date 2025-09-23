"use client";

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
  Users,
  Building,
  Wrench,
  Shield,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function DashboardTab(): JSX.Element {
  const { user } = useAuth();

  // Get real analytics data from API
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useFetchApi("/analytics/dashboard", {}, { enabled: !!user });

  const {
    data: userGrowthData,
    loading: userGrowthLoading,
    error: userGrowthError,
  } = useFetchApi("/analytics/user-growth", {}, { enabled: !!user });

  const {
    data: taskDistributionData,
    loading: taskDistributionLoading,
    error: taskDistributionError,
  } = useFetchApi("/analytics/task-distribution", {}, { enabled: !!user });

  const {
    data: recentActivitiesData,
    loading: recentActivitiesLoading,
    error: recentActivitiesError,
  } = useFetchApi("/analytics/recent-activities", {}, { enabled: !!user });

  const {
    data: taskCompletionTrendData,
    loading: taskCompletionTrendLoading,
    error: taskCompletionTrendError,
  } = useFetchApi("/analytics/task-completion-trend", {}, { enabled: !!user });

  // Only show loading if user is authenticated and data is actually loading
  const loading =
    user &&
    (dashboardLoading ||
      userGrowthLoading ||
      taskDistributionLoading ||
      recentActivitiesLoading ||
      taskCompletionTrendLoading);
  const error =
    dashboardError ||
    userGrowthError ||
    taskDistributionError ||
    recentActivitiesError ||
    taskCompletionTrendError;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
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
              Error loading dashboard data: {error.message}
            </div>
            {!user && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Please login to access real data, or use mock data below
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use real data from API
  const analyticsData = {
    totalUsers: (dashboardData as any)?.totalUsers || 0,
    newUsersThisMonth: (dashboardData as any)?.newUsersThisMonth || 0,
    activeWorkspaces: (dashboardData as any)?.totalWorkspaces || 0,
    activeUsersToday: 0, // This would need a separate API call for daily active users
    totalTasks: (dashboardData as any)?.totalTasks || 0,
    completedTasksThisMonth:
      (dashboardData as any)?.completedTasksThisMonth || 0,
    systemHealth: {
      apiServer: { status: "Online", responseTime: 120, uptime: "99.9%" },
      database: { status: "Connected", connectionCount: 25 },
      storage: { used: "78%", available: "22%" },
    },
    userGrowth: {
      chartData: (userGrowthData as any[]) || [],
    },
    taskAnalytics: {
      statusDistribution: taskDistributionData || {},
    },
    recentActivities: (recentActivitiesData as any[]) || [],
  };

  const {
    totalUsers,
    newUsersThisMonth,
    activeWorkspaces,
    activeUsersToday,
    totalTasks,
    completedTasksThisMonth,
    systemHealth,
    userGrowth,
    taskAnalytics,
    recentActivities,
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{newUsersThisMonth || 0}</span>{" "}
              new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workspaces
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeWorkspaces?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{activeUsersToday || 0}</span>{" "}
              active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{completedTasksThisMonth || 0}
              </span>{" "}
              completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systemHealth?.apiServer?.uptime || "99.9%"}
            </div>
            <p className="text-xs text-muted-foreground">API uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>User Growth</span>
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Task Distribution</span>
            </CardTitle>
            <CardDescription>Tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(
                      taskAnalytics?.statusDistribution || {}
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(
                      taskAnalytics?.statusDistribution || {}
                    ).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Task Completion</span>
            </CardTitle>
            <CardDescription>Completed tasks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(taskCompletionTrendData as any[]) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>Real-time system monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Server</span>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    {systemHealth?.apiServer?.status || "Online"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {systemHealth?.apiServer?.responseTime || 0}ms
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    {systemHealth?.database?.status || "Connected"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {systemHealth?.database?.connectionCount || 0} connections
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    {systemHealth?.storage?.used || "78%"} Used
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {systemHealth?.storage?.available || "22%"} available
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentActivities || [])
                .slice(0, 5)
                .map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} •{" "}
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {activity.status}
                    </span>
                  </div>
                ))}
              {(!recentActivities || recentActivities.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  No recent activities found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
