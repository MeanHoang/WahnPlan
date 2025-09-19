"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { apiService } from "@/lib/api-service";
import { Loader2, Mail, RefreshCw } from "lucide-react";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}

export function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  onVerified,
}: EmailVerificationModalProps): JSX.Element {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await apiService.resendVerificationEmail(email);
      toast({
        title: t("modals.emailVerification.verificationEmailSent"),
        description: t(
          "modals.emailVerification.verificationEmailSentDescription"
        ),
      });
    } catch (error: any) {
      toast({
        title: t("modals.emailVerification.failedToResendEmail"),
        description: error.message || t("auth.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("modals.emailVerification.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.emailVerification.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              {t("modals.emailVerification.sentTo")}
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {t("modals.emailVerification.checkEmail")}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
              size="sm"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("modals.emailVerification.sending")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("modals.emailVerification.resendEmail")}
                </>
              )}
            </Button>

            <Button variant="outline" onClick={onClose} size="sm">
              {t("modals.emailVerification.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
