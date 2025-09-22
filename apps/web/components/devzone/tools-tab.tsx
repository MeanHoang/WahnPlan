"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  Server,
  Shield,
  Wrench,
  Terminal,
  Activity,
  RefreshCw,
  Download,
  Upload,
  Eye,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

export function ToolsTab(): JSX.Element {
  const [isRunning, setIsRunning] = useState<string | null>(null);

  const handleToolAction = async (
    toolName: string,
    action: () => Promise<void>
  ) => {
    setIsRunning(toolName);
    try {
      await action();
      // Simulate action completion
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error running ${toolName}:`, error);
    } finally {
      setIsRunning(null);
    }
  };

  const databaseTools = [
    {
      name: "Run Database Backup",
      description: "Create a full backup of the database",
      icon: Database,
      action: async () => {
        console.log("Running database backup...");
        // Simulate backup process
      },
    },
    {
      name: "Clear Cache",
      description: "Clear application and database cache",
      icon: RefreshCw,
      action: async () => {
        console.log("Clearing cache...");
        // Simulate cache clearing
      },
    },
    {
      name: "Generate Database Report",
      description: "Generate comprehensive database statistics",
      icon: BarChart3,
      action: async () => {
        console.log("Generating database report...");
        // Simulate report generation
      },
    },
  ];

  const systemTools = [
    {
      name: "Restart Services",
      description: "Restart all application services",
      icon: Server,
      action: async () => {
        console.log("Restarting services...");
        // Simulate service restart
      },
    },
    {
      name: "View System Logs",
      description: "Access and view system logs",
      icon: Terminal,
      action: async () => {
        console.log("Opening system logs...");
        // Simulate log viewing
      },
    },
    {
      name: "Performance Monitor",
      description: "Monitor system performance metrics",
      icon: Activity,
      action: async () => {
        console.log("Opening performance monitor...");
        // Simulate performance monitoring
      },
    },
  ];

  const developmentTools = [
    {
      name: "API Tester",
      description: "Test API endpoints and responses",
      icon: Wrench,
      action: async () => {
        console.log("Opening API tester...");
        // Simulate API testing
      },
    },
    {
      name: "Security Scan",
      description: "Run security vulnerability scan",
      icon: Shield,
      action: async () => {
        console.log("Running security scan...");
        // Simulate security scan
      },
    },
    {
      name: "User Simulator",
      description: "Simulate user interactions and workflows",
      icon: Users,
      action: async () => {
        console.log("Starting user simulation...");
        // Simulate user interactions
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Development Tools</h2>
          <p className="text-gray-600">
            Tools for development, maintenance, and monitoring
          </p>
        </div>
      </div>

      {/* Database Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Tools</span>
          </CardTitle>
          <CardDescription>
            Database management and maintenance tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {databaseTools.map((tool, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <tool.icon className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">{tool.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRunning === tool.name}
                  onClick={() => handleToolAction(tool.name, tool.action)}
                >
                  {isRunning === tool.name ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Tools</span>
          </CardTitle>
          <CardDescription>
            System maintenance and monitoring tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {systemTools.map((tool, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <tool.icon className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">{tool.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRunning === tool.name}
                  onClick={() => handleToolAction(tool.name, tool.action)}
                >
                  {isRunning === tool.name ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>Development Tools</span>
          </CardTitle>
          <CardDescription>Tools for development and testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {developmentTools.map((tool, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <tool.icon className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">{tool.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRunning === tool.name}
                  onClick={() => handleToolAction(tool.name, tool.action)}
                >
                  {isRunning === tool.name ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utility Tools */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Data Export/Import</span>
            </CardTitle>
            <CardDescription>Manage data exports and imports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export User Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Workspace Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Monitoring & Logs</span>
            </CardTitle>
            <CardDescription>System monitoring and log access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              Real-time Monitoring
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Terminal className="h-4 w-4 mr-2" />
              Error Logs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Metrics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">API Server</h4>
              <p className="text-sm text-green-600">Online</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Database</h4>
              <p className="text-sm text-green-600">Connected</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-medium">Security</h4>
              <p className="text-sm text-yellow-600">Monitoring</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Performance</h4>
              <p className="text-sm text-blue-600">Normal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
