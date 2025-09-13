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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  User,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Globe,
  Clock,
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
  const [isEditing, setIsEditing] = useState(false);
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
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
        refreshAuth();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      },
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileUpdateData> = {};

    if (formData.fullname && formData.fullname.length < 2) {
      newErrors.fullname = "Full name must be at least 2 characters long";
    }

    if (formData.publicName && !/^[a-zA-Z0-9_-]+$/.test(formData.publicName)) {
      newErrors.publicName =
        "Public name can only contain letters, numbers, hyphens, and underscores";
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your profile and visibility settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>
                    Your public profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullname || user.email}
                        className="w-24 h-24 rounded-full object-cover mb-4"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                        <span className="text-white text-2xl font-medium">
                          {getInitials(user.fullname || user.email || "U")}
                        </span>
                      </div>
                    )}
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
                      <span className="text-gray-500">Member since</span>
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-500">Email verified</span>
                      <span
                        className={`font-medium ${user.emailVerify ? "text-green-600" : "text-red-600"}`}
                      >
                        {user.emailVerify ? "Verified" : "Not verified"}
                      </span>
                    </div>
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
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Update your profile information
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isPending}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input
                          id="fullname"
                          value={formData.fullname || ""}
                          onChange={(e) =>
                            handleInputChange("fullname", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                          className={errors.fullname ? "border-red-500" : ""}
                        />
                        {errors.fullname && (
                          <p className="text-sm text-red-500">
                            {errors.fullname}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="publicName">Public Name</Label>
                        <Input
                          id="publicName"
                          value={formData.publicName || ""}
                          onChange={(e) =>
                            handleInputChange("publicName", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Enter your public name"
                          className={errors.publicName ? "border-red-500" : ""}
                        />
                        {errors.publicName ? (
                          <p className="text-sm text-red-500">
                            {errors.publicName}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            This is how others will see your name
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle || ""}
                          onChange={(e) =>
                            handleInputChange("jobTitle", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Enter your job title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          value={formData.organization || ""}
                          onChange={(e) =>
                            handleInputChange("organization", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Enter your organization"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location || ""}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Enter your location"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          value={formData.language || "en"}
                          onChange={(e) =>
                            handleInputChange("language", e.target.value)
                          }
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="en">English</option>
                          <option value="vi">Vietnamese</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
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
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                          {isPending ? "Saving..." : "Save Changes"}
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
    </DashboardLayout>
  );
}
