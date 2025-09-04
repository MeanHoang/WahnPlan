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

export default function DashboardPage(): JSX.Element {
  const { user, isLoading, logout } = useAuth();
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <></>;
  }

  return (
    <DashboardLayout
      onSearch={(query: string) => console.log("Search:", query)}
      onCreateClick={() => console.log("Create clicked")}
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.fullname || user.email}!
            </h1>
            <p className="text-gray-600">
              Manage your projects and tasks efficiently
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-gray-900">{user.fullname || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Public Name</p>
                <p className="text-gray-900">{user.publicName || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Job Title</p>
                <p className="text-gray-900">{user.jobTitle || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Organization
                </p>
                <p className="text-gray-900">
                  {user.organization || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{user.location || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email Verified
                </p>
                <p
                  className={`${user.emailVerify ? "text-green-600" : "text-red-600"}`}
                >
                  {user.emailVerify ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Workspace</CardTitle>
              <CardDescription>Start a new project workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Workspace</CardTitle>
              <CardDescription>Join an existing workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Profile</CardTitle>
              <CardDescription>Edit your profile settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
