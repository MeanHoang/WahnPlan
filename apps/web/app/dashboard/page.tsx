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

export default function DashboardPage(): JSX.Element {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

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
      <div className="px-12 py-8">
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

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("dashboard.accountInformation")}</CardTitle>
            <CardDescription>
              {t("dashboard.yourProfileDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.email")}
                </p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.fullName")}
                </p>
                <p className="text-gray-900">
                  {user.fullname || t("common.notSet")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.publicName")}
                </p>
                <p className="text-gray-900">
                  {user.publicName || t("common.notSet")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.jobTitle")}
                </p>
                <p className="text-gray-900">
                  {user.jobTitle || t("common.notSet")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.organization")}
                </p>
                <p className="text-gray-900">
                  {user.organization || t("common.notSet")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.location")}
                </p>
                <p className="text-gray-900">
                  {user.location || t("common.notSet")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dashboard.emailVerified")}
                </p>
                <p
                  className={`${user.emailVerify ? "text-green-600" : "text-red-600"}`}
                >
                  {user.emailVerify ? t("common.yes") : t("common.no")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.createWorkspace")}</CardTitle>
              <CardDescription>
                {t("dashboard.startNewProject")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                {t("common.comingSoon")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.joinWorkspace")}</CardTitle>
              <CardDescription>
                {t("dashboard.joinExistingWorkspace")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                {t("common.comingSoon")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.viewProfile")}</CardTitle>
              <CardDescription>
                {t("dashboard.editProfileSettings")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                {t("common.comingSoon")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
