"use client";

import { useState } from "react";
import {
  UserPlus,
  Link,
  Search,
  Eye,
  Shield,
  X,
  Mail,
  User,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { apiRequest } from "@/lib/api-request";
import { Workspace } from "@/types/workspace-core";
import { InviteMemberModal } from "./invite-member-modal";

interface WorkspaceMember {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullname: string | null;
    publicName: string | null;
    avatarUrl: string | null;
    jobTitle: string | null;
    organization: string | null;
  };
  inviter: {
    id: string;
    email: string;
    fullname: string | null;
    publicName: string | null;
  } | null;
}

interface MembersContentProps {
  workspaceId: string;
}

export function MembersContent({
  workspaceId,
}: MembersContentProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: workspace, loading: workspaceLoading } = useFetchApi<Workspace>(
    `/workspaces/${workspaceId}`
  );

  const {
    data: members,
    loading,
    error,
  } = useFetchApi<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);

  // Get current user info
  const { data: currentUser } = useFetchApi<any>("/auth/me");

  // Find current user's role in this workspace
  const currentUserMember = members?.find(
    (member) => member.user.id === currentUser?.id
  );
  const currentUserRole = currentUserMember?.role;

  // Debug: Log current user role
  console.log("Current user:", currentUser);
  console.log("Current user role in workspace:", currentUserRole);
  console.log("Members:", members);

  const { mutate: leaveWorkspace, loading: isLeaving } = useCreateApi(
    `/workspaces/${workspaceId}/members/leave`,
    {
      onSuccess: () => {
        // Redirect to dashboard after leaving
        window.location.href = "/dashboard";
      },
    }
  );

  const handleRemoveMember = async (memberId: string) => {
    try {
      await apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
      });
      window.location.reload();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "member":
        return "bg-green-100 text-green-800 border-green-200";
      case "guest":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "manager":
        return "Manager";
      case "member":
        return "Member";
      case "guest":
        return "Guest";
      default:
        return role;
    }
  };

  const filteredMembers = members?.filter(
    (member) =>
      member.user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {workspace?.name} - Workspace members ({members?.length || 0})
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Workspace members can view and join all Workspace visible boards
              and create new boards in the Workspace.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Workspace members
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Invite Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Invite members to join you
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Anyone with an invite link can join this free Workspace. You can
                also disable and create a new invite link for this Workspace at
                any time. Pending invitations count toward the 10 collaborator
                limit.
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-4 text-sm">
              <Link className="h-4 w-4 mr-2" />
              Invite with link
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading members...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">Failed to load members</p>
            </div>
          )}

          {filteredMembers && filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">No members found</p>
            </div>
          )}

          {filteredMembers?.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.fullname || member.user.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  {/* Member Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {member.user.fullname ||
                          member.user.publicName ||
                          member.user.email}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {getRoleDisplayName(member.role)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>{member.user.email}</span>
                    </div>
                    {member.user.jobTitle && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Building className="h-3 w-3" />
                        <span>
                          {member.user.jobTitle}
                          {member.user.organization &&
                            ` at ${member.user.organization}`}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Last active{" "}
                      {new Date(member.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View boards (2)
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleDisplayName(member.role)}
                  </Button>
                  {/* Show appropriate action based on user role and current user */}
                  {currentUser && (
                    <>
                      {/* If current user is admin/owner and this is not themselves, show Remove button */}
                      {(currentUserRole === "owner" ||
                        currentUserRole === "manager") &&
                        member.user.id !== currentUser?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        )}

                      {/* If this is current user themselves, show Leave button */}
                      {member.user.id === currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() => leaveWorkspace({})}
                          disabled={isLeaving}
                        >
                          <X className="h-3 w-3 mr-1" />
                          {isLeaving ? "Leaving..." : "Leave workspace"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
}
