"use client";

import { useState, useEffect } from "react";
import { X, Crown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  currentOwnerName?: string;
  onSuccess?: () => void;
}

export function TransferOwnershipModal({
  isOpen,
  onClose,
  workspaceId,
  currentOwnerName,
  onSuccess,
}: TransferOwnershipModalProps): JSX.Element {
  const { t } = useTranslation();
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const { toast } = useToast();

  // Fetch workspace members
  const { data: members } = useFetchApi<any[]>(
    `/workspaces/${workspaceId}/members`
  );

  // Filter out current owner and get only eligible members
  const eligibleMembers =
    members?.filter((member) => member.role !== "owner") || [];

  // Transfer ownership API call
  const { mutate: transferOwnership, loading: isTransferring } = useCreateApi(
    `/workspaces/${workspaceId}/members/transfer-ownership`,
    {
      onSuccess: () => {
        toast({
          title: t("common.success"),
          description: t(
            "transferOwnership.workspaceOwnershipTransferredSuccessfully"
          ),
        });
        onSuccess?.();
        onClose();
      },
      onError: () => {
        toast({
          title: t("common.error"),
          description: t("transferOwnership.failedToTransferOwnership"),
          variant: "destructive",
        });
      },
    }
  );

  const handleTransfer = () => {
    if (!selectedMemberId) {
      toast({
        title: t("common.error"),
        description: t(
          "transferOwnership.pleaseSelectMemberToTransferOwnershipTo"
        ),
        variant: "destructive",
      });
      return;
    }

    transferOwnership({
      newOwnerId: selectedMemberId,
    });
  };

  const handleClose = () => {
    setSelectedMemberId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-600" />
            {t("transferOwnership.transferWorkspaceOwnership")}
          </DialogTitle>
          <DialogDescription>
            {t("transferOwnership.transferOwnershipDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Owner Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <Crown className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t("transferOwnership.currentOwner")}
                </p>
                <p className="text-sm text-blue-700">{currentOwnerName}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {t("transferOwnership.important")}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {t("transferOwnership.thisActionCannotBeUndone")}
                </p>
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("transferOwnership.selectNewOwner")}
            </label>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("transferOwnership.chooseAMember")}
                />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((member) => (
                  <SelectItem key={member.id} value={member.user.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {member.user.fullname?.charAt(0) ||
                            member.user.email?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.user.fullname || member.user.publicName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {eligibleMembers.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                {t("transferOwnership.noEligibleMembersFound")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              isTransferring ||
              !selectedMemberId ||
              eligibleMembers.length === 0
            }
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            {isTransferring
              ? t("transferOwnership.transferring")
              : t("transferOwnership.transferOwnership")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
