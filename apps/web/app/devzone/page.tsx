"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Home, Users, Building, Wrench, LogIn } from "lucide-react";
import { DashboardTab } from "@/components/devzone/dashboard-tab";
import { CustomersTab } from "@/components/devzone/customers-tab";
import { WorkspacesTab } from "@/components/devzone/workspaces-tab";
import { ToolsTab } from "@/components/devzone/tools-tab";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Default password from environment variable
const DEFAULT_PASSWORD =
  process.env.NEXT_PUBLIC_DEVZONE_PASSWORD || "devzone2024";

export default function DevZonePage(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated (only when user is completely null and not loading)
  useEffect(() => {
    console.log("DevZone auth check:", {
      user: !!user,
      isLoading,
      isAuthenticated,
    });
    if (!isLoading && user === null) {
      console.log("Redirecting to login - no user found");
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogin = () => {
    if (password === DEFAULT_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Shield className="h-6 w-6 text-slate-600 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold">DevZone Access</CardTitle>
            <CardDescription>Checking authentication...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show password form if user is authenticated but DevZone password not entered
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Shield className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle className="text-2xl font-bold">DevZone Access</CardTitle>
            <CardDescription>
              Welcome, {user?.publicName || user?.fullname || user?.email}!
              <br />
              Enter the development password to access admin tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <Button onClick={handleLogin} className="w-full">
              Access DevZone
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">DevZone</h1>
              <p className="text-sm text-slate-600">
                Development Management Panel
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="dashboard"
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger
              value="workspaces"
              className="flex items-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span>Workspaces</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Tools</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="workspaces" className="mt-6">
            <WorkspacesTab />
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <ToolsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
