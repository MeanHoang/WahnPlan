"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Users,
  Shield,
  Trash2,
  Save,
  Edit3,
  X,
  Upload,
  Globe,
  Lock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useToast } from "@/hooks/use-toast";
import { Workspace } from "@/types/workspace-core";

interface WorkspaceSettingsProps {
  workspaceId: string;
}

export function WorkspaceSettings({
  workspaceId,
}: WorkspaceSettingsProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private",
    allowInvites: true,
  });
  const { toast } = useToast();

  const { data: workspace, loading: workspaceLoading } = useFetchApi<Workspace>(
    `/workspaces/${workspaceId}`
  );

  const { data: members } = useFetchApi<any[]>(
    `/workspaces/${workspaceId}/members`
  );

  // Get current user info
  const { data: currentUser } = useFetchApi<any>("/auth/me");

  // Find current user's role in this workspace
  const currentUserMember = members?.find(
    (member) => member.user.id === currentUser?.id
  );
  const currentUserRole = currentUserMember?.role;
  const isOwner = currentUserRole === "owner";

  const { mutate: updateWorkspace, loading: isUpdating } = useUpdateApi(
    `/workspaces/${workspaceId}`,
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Workspace settings updated successfully",
        });
        setIsEditing(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update workspace settings",
          variant: "destructive",
        });
      },
    }
  );

  // Initialize form data when workspace loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        visibility: workspace.visibility || "private",
        allowInvites: workspace.allowInvites ?? true,
      });
    }
  }, [workspace]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateWorkspace(formData);
  };

  const handleCancel = () => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        visibility: workspace.visibility || "private",
        allowInvites: workspace.allowInvites ?? true,
      });
    }
    setIsEditing(false);
  };

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-3" />
            Workspace Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your workspace information and preferences
          </p>
        </div>
        {isOwner && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Access Control Notice */}
      {!isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Read-only Access
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Only workspace owners can modify these settings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update your workspace name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing || !isOwner}
                  placeholder="Enter workspace name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={!isEditing || !isOwner}
                  placeholder="Describe your workspace"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Access
              </CardTitle>
              <CardDescription>
                Control who can see and join your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) =>
                    handleInputChange("visibility", value)
                  }
                  disabled={!isEditing || !isOwner}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Private - Only invited members
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Public - Anyone can join
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowInvites"
                  checked={formData.allowInvites}
                  onChange={(e) =>
                    handleInputChange("allowInvites", e.target.checked)
                  }
                  disabled={!isEditing || !isOwner}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="allowInvites">
                  Allow members to invite others
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workspace Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workspace Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {workspace?.createdAt
                    ? new Date(workspace.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members</span>
                <span className="font-medium">{members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Boards</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View Activity
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
