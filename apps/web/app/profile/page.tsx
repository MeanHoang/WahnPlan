"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
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
import { useUpdateApi } from "@/hooks/use-update-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AvatarUpload } from "@/components/ui/upload";
import { useAvatarUpload } from "@/hooks/use-upload-api";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import {
  User,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Globe,
  Clock,
  Key,
} from "lucide-react";

interface ProfileUpdateData {
  fullname?: string;
  publicName?: string;
  jobTitle?: string;
  organization?: string;
  location?: string;
  language?: string;
  timezone?: string;
}

export default function ProfilePage(): JSX.Element {
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const { uploadAvatar, deleteAvatar } = useAvatarUpload();
  const [formData, setFormData] = useState<ProfileUpdateData>({
    fullname: user?.fullname || "",
    publicName: user?.publicName || "",
    jobTitle: user?.jobTitle || "",
    organization: user?.organization || "",
    location: user?.location || "",
    language: user?.language || "en",
    timezone: user?.timezone || "UTC",
  });
  const [errors, setErrors] = useState<Partial<ProfileUpdateData>>({});

  const { mutate: updateProfile, loading: isPending } = useUpdateApi(
    {
      endpoint: "/users/profile",
      method: "PUT",
    },
    {
      onSuccess: (data) => {
        toast({
          title: t("profile.profileUpdated"),
          description: t("profile.updateSuccess"),
        });
        setIsEditing(false);
        refreshAuth();
      },
      onError: (error) => {
        toast({
          title: t("common.error"),
          description: t("profile.updateFailed"),
          variant: "destructive",
        });
      },
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileUpdateData> = {};

    if (formData.fullname && formData.fullname.length < 2) {
      newErrors.fullname = t("profile.fullnameMinLength");
    }

    if (formData.publicName && !/^[a-zA-Z0-9_-]+$/.test(formData.publicName)) {
      newErrors.publicName = t("profile.publicNameInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateProfile(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: user?.fullname || "",
      publicName: user?.publicName || "",
      jobTitle: user?.jobTitle || "",
      organization: user?.organization || "",
      location: user?.location || "",
      language: user?.language || "en",
      timezone: user?.timezone || "UTC",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("profile.title")}
            </h1>
            <p className="mt-2 text-gray-600">{t("profile.description")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.overview")}</CardTitle>
                  <CardDescription>{t("profile.overviewDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <AvatarUpload
                      currentAvatar={user.avatarUrl || undefined}
                      onUpload={async (file) => {
                        const result = await uploadAvatar(file);
                        await refreshAuth(); // Refresh user data
                      }}
                      onRemove={async () => {
                        await deleteAvatar();
                        await refreshAuth(); // Refresh user data
                      }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.fullname || user.email}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.publicName && (
                      <p className="text-sm text-gray-600">
                        @{user.publicName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.jobTitle && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{user.jobTitle}</span>
                      </div>
                    )}
                    {user.organization && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{user.organization}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {t("profile.memberSince")}
                      </span>
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-500">
                        {t("profile.emailVerified")}
                      </span>
                      <span
                        className={`font-medium ${user.emailVerify ? "text-green-600" : "text-red-600"}`}
                      >
                        {user.emailVerify
                          ? t("profile.verified")
                          : t("profile.notVerified")}
                      </span>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {t("profile.security")}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangePasswordDialog(true)}
                      className="w-full"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      {t("auth.changePassword")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Settings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("profile.settings")}</CardTitle>
                      <CardDescription>
                        {t("profile.settingsDesc")}
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isPending}
                    >
                      {isEditing
                        ? t("common.cancel")
                        : t("profile.editProfile")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullname">
                          {t("profile.fullName")}
                        </Label>
                        <Input
                          id="fullname"
                          value={formData.fullname || ""}
                          onChange={(e) =>
                            handleInputChange("fullname", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder={t("profile.enterFullName")}
                          className={errors.fullname ? "border-red-500" : ""}
                        />
                        {errors.fullname && (
                          <p className="text-sm text-red-500">
                            {errors.fullname}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="publicName">
                          {t("profile.publicName")}
                        </Label>
                        <Input
                          id="publicName"
                          value={formData.publicName || ""}
                          onChange={(e) =>
                            handleInputChange("publicName", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder={t("profile.enterPublicName")}
                          className={errors.publicName ? "border-red-500" : ""}
                        />
                        {errors.publicName ? (
                          <p className="text-sm text-red-500">
                            {errors.publicName}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {t("profile.publicNameDesc")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">
                          {t("profile.jobTitle")}
                        </Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle || ""}
                          onChange={(e) =>
                            handleInputChange("jobTitle", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder={t("profile.enterJobTitle")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organization">
                          {t("profile.organization")}
                        </Label>
                        <Input
                          id="organization"
                          value={formData.organization || ""}
                          onChange={(e) =>
                            handleInputChange("organization", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder={t("profile.enterOrganization")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">
                          {t("profile.location")}
                        </Label>
                        <Input
                          id="location"
                          value={formData.location || ""}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder={t("profile.enterLocation")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">
                          {t("profile.language")}
                        </Label>
                        <select
                          id="language"
                          value={formData.language || "en"}
                          onChange={(e) =>
                            handleInputChange("language", e.target.value)
                          }
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="en">{t("profile.english")}</option>
                          <option value="vi">{t("profile.vietnamese")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">{t("profile.timezone")}</Label>
                      <select
                        id="timezone"
                        value={formData.timezone || "UTC"}
                        onChange={(e) =>
                          handleInputChange("timezone", e.target.value)
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="Asia/Ho_Chi_Minh">
                          Asia/Ho_Chi_Minh
                        </option>
                        <option value="America/New_York">
                          America/New_York
                        </option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isPending}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                          {isPending
                            ? t("profile.saving")
                            : t("profile.saveChanges")}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
      />
    </DashboardLayout>
  );
}
