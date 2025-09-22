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
import { useFetchApi } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import {
  Download,
  Upload,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
} from "lucide-react";

export function CustomersTab(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Try to get real customer data if authenticated
  const {
    data: customersData,
    loading: customerLoading,
    error: customerError,
  } = useFetchApi("/users/stats", {}, { enabled: !!user });

  // Only show loading if user is authenticated and data is actually loading
  const loading = user && customerLoading;
  const error = customerError;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Customer Management</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Customers
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find and manage customer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(customersData as any)?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(customersData as any)?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">85%</span> engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(customersData as any)?.newUsersThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> growth rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Support Tickets
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">8 pending</span> resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Customer Activities</CardTitle>
            <CardDescription>
              Latest customer interactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    15 new registrations today
                  </p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    3 customers upgraded to premium
                  </p>
                  <p className="text-xs text-muted-foreground">
                    15 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    8 support tickets resolved
                  </p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    2 customers requested data export
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Support</CardTitle>
            <CardDescription>
              Support metrics and response times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Average Response Time
                </span>
                <span className="text-sm font-bold text-green-600">
                  2.4 hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resolution Rate</span>
                <span className="text-sm font-bold text-blue-600">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Customer Satisfaction
                </span>
                <span className="text-sm font-bold text-purple-600">4.8/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Tickets</span>
                <span className="text-sm font-bold text-yellow-600">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Perform actions on multiple customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Send Email Campaign</Button>
            <Button variant="outline">Export Selected</Button>
            <Button variant="outline">Update Status</Button>
            <Button variant="outline">Generate Reports</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
