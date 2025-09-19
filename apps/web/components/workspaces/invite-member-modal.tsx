"use client";

import { useState } from "react";
import { X, Link, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateApi } from "@/hooks/use-create-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: InviteMemberModalProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { mutate: inviteMember, loading } = useCreateApi(
    `/workspaces/${workspaceId}/members/invite`,
    {
      onSuccess: () => {
        toast({
          title: t("common.success"),
          description: t("inviteMember.memberInvitedSuccess"),
        });
        setEmail("");
        onClose();
        onSuccess?.();
      },
      onError: () => {
        toast({
          title: t("common.error"),
          description: t("inviteMember.failedToInviteMember"),
          variant: "destructive",
        });
      },
    }
  );

  const handleInvite = () => {
    if (email.trim()) {
      inviteMember({ email: email.trim() });
    }
  };

  const handleCreateLink = () => {
    setIsCreatingLink(true);
    // TODO: Implement create invite link functionality
    setTimeout(() => {
      setIsCreatingLink(false);
    }, 1000);
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("inviteMember.title")}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <Input
            type="email"
            placeholder={t("inviteMember.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleInvite();
              }
            }}
          />
        </div>

        {/* Invite by Link Section */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {t("inviteMember.inviteWithLinkDescription")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateLink}
            disabled={isCreatingLink}
            className="text-sm"
          >
            <Link className="h-4 w-4 mr-2" />
            {isCreatingLink
              ? t("inviteMember.creating")
              : t("inviteMember.createLink")}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} className="text-sm">
            {t("inviteMember.cancel")}
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 text-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? t("inviteMember.inviting") : t("inviteMember.invite")}
          </Button>
        </div>
      </div>
    </div>
  );
}
