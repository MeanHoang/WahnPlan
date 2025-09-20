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
  Crown,
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
import { useTranslation } from "@/contexts/language-context";
import { Workspace } from "@/types/workspace-core";
import { TransferOwnershipModal } from "./transfer-ownership-modal";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { IconPicker } from "@/components/ui/icon-picker";

interface WorkspaceSettingsProps {
  workspaceId: string;
}

export function WorkspaceSettings({
  workspaceId,
}: WorkspaceSettingsProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private",
    icon: "",
  });
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: workspace, loading: workspaceLoading } = useFetchApi<Workspace>(
    `/workspaces/${workspaceId}`
  );

  const { data: members } = useFetchApi<any[]>(
    `/workspaces/${workspaceId}/members`
  );

  const { data: boards } = useFetchApi<any[]>(
    `/workspaces/${workspaceId}/boards`
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
          title: t("common.success"),
          description: t("workspaceSettings.settingsUpdatedSuccess"),
        });
        setIsEditing(false);
      },
      onError: () => {
        toast({
          title: t("common.error"),
          description: t("workspaceSettings.failedToUpdateSettings"),
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
        icon: workspace.icon || "",
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
        icon: workspace.icon || "",
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
            {t("workspaceSettings.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("workspaceSettings.description")}
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
                  {t("workspaceSettings.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating
                    ? t("workspaceSettings.saving")
                    : t("workspaceSettings.saveChanges")}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {t("workspaceSettings.editSettings")}
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
                {t("workspaceSettings.readOnlyAccess")}
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {t("workspaceSettings.readOnlyDescription")}
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
                {t("workspaceSettings.basicInformation")}
              </CardTitle>
              <CardDescription>
                {t("workspaceSettings.basicInformationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  {t("workspaceSettings.workspaceName")}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing || !isOwner}
                  placeholder={t("workspaceSettings.enterWorkspaceName")}
                />
              </div>
              <div>
                <Label htmlFor="description">
                  {t("workspaceSettings.description")}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={!isEditing || !isOwner}
                  placeholder={t("workspaceSettings.describeWorkspace")}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="icon">Workspace Icon</Label>
                <IconPicker
                  selectedIcon={formData.icon}
                  onIconSelect={(iconName) =>
                    handleInputChange("icon", iconName)
                  }
                  disabled={!isEditing || !isOwner}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t("workspaceSettings.privacyAccess")}
              </CardTitle>
              <CardDescription>
                {t("workspaceSettings.privacyAccessDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visibility">
                  {t("workspaceSettings.visibility")}
                </Label>
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
                        {t("workspaceSettings.privateDescription")}
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {t("workspaceSettings.publicDescription")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workspace Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("workspaceSettings.workspaceInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {t("workspaceSettings.created")}
                </span>
                <span className="font-medium">
                  {workspace?.createdAt
                    ? new Date(workspace.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {t("workspaceSettings.members")}
                </span>
                <span className="font-medium">{members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {t("workspaceSettings.boards")}
                </span>
                <span className="font-medium">{boards?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {t("workspaceSettings.status")}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t("workspaceSettings.active")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("workspaceSettings.quickActions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  (window.location.href = `/workspace/${workspaceId}/members`)
                }
              >
                <Users className="h-4 w-4 mr-2" />
                {t("workspaceSettings.manageMembers")}
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                  onClick={() => setShowTransferModal(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {t("workspaceSettings.transferOwnership")}
                </Button>
              )}
              {isOwner && workspace && (
                <DeleteWorkspaceDialog
                  workspace={{
                    id: workspace.id,
                    name: workspace.name,
                    _count: {
                      boards: boards?.length || 0,
                      members: members?.length || 0,
                    },
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("workspaceSettings.deleteWorkspace")}
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        workspaceId={workspaceId}
        currentOwnerName={
          currentUser?.fullname || currentUser?.publicName || currentUser?.email
        }
        onSuccess={() => {
          // Refresh the page to update user role
          window.location.reload();
        }}
      />
    </div>
  );
}
