"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/language-context";
import { useFetchApi } from "@/hooks";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function DashboardPage(): JSX.Element {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Fetch dashboard statistics
  const { data: dashboardStats, loading: statsLoading } =
    useFetchApi<any>("/users/stats");
  const { data: recentActivities, loading: activitiesLoading } = useFetchApi<
    any[]
  >("/users/recent-activities");
  const { data: workspaceSummary, loading: workspaceLoading } = useFetchApi<
    any[]
  >("/users/workspace-summary");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    // Check if user is not verified
    if (!isLoading && user && !user.emailVerify) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <></>;
  }

  return (
    <DashboardLayout onSearch={(query: string) => {}} onCreateClick={() => {}}>
      <div className="px-12 py-8 ml-6 lg:ml-6 sm:ml-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("dashboard.welcome")}, {user.fullname || user.email}!
            </h1>
            <p className="text-gray-600">
              {t("dashboard.manageProjectsEfficiently")}
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            {t("auth.logout")}
          </Button>
        </div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.assignedTasks")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.assignedTasks || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.completedTasks")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.completedTasks || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.overdueTasks")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.overdueTasks || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("dashboard.workspaces")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.workspaces || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completion Rate & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("dashboard.completionRate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {dashboardStats?.completionRate || 0}%
                </div>
                <p className="text-gray-600">{t("dashboard.tasksCompleted")}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dashboardStats?.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("dashboard.notifications")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {t("dashboard.totalNotifications")}
                  </span>
                  <span className="font-semibold">
                    {dashboardStats?.notifications?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {t("dashboard.recentActivities")}
                  </span>
                  <span className="font-semibold">
                    {dashboardStats?.recentActivities || 0}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/notifications")}
                >
                  {t("dashboard.viewAllNotifications")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("dashboard.recentActivities")}
            </CardTitle>
            <CardDescription>{t("dashboard.latestUpdates")}</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.isRead ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      <Bell
                        className={`h-4 w-4 ${
                          activity.isRead ? "text-gray-500" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          activity.isRead ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t("dashboard.noRecentActivities")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workspace Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("dashboard.workspaceSummary")}
            </CardTitle>
            <CardDescription>{t("dashboard.yourWorkspaces")}</CardDescription>
          </CardHeader>
          <CardContent>
            {workspaceLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : workspaceSummary && workspaceSummary.length > 0 ? (
              <div className="space-y-4">
                {workspaceSummary.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {workspace.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{workspace._count.boards} boards</span>
                          <span>{workspace._count.members} members</span>
                          <span className="capitalize">{workspace.role}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {workspace.myTasks} {t("dashboard.tasks")}
                        </div>
                        <div className="text-sm text-green-600">
                          {workspace.myCompletedTasks}{" "}
                          {t("dashboard.completed")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t("dashboard.noWorkspaces")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/workspaces")}
                >
                  {t("dashboard.createWorkspace")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
