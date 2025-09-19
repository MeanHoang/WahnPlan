"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { apiService } from "@/lib/api-service";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage(): JSX.Element {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError(t("auth.noVerificationToken"));
        setIsVerifying(false);
        return;
      }

      try {
        const result = await apiService.verifyEmail(token);
        if (result.verified) {
          setIsVerified(true);
          toast({
            title: t("auth.emailVerifiedSuccessfully"),
            description: t("auth.accountFullyActivated"),
          });
        } else {
          setError(result.message || t("auth.verificationFailed"));
        }
      } catch (error: any) {
        setError(error.message || t("auth.verificationFailed"));
        toast({
          title: t("auth.verificationFailedTitle"),
          description: error.message || t("auth.somethingWentWrong"),
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <CardTitle>{t("auth.verifyingEmail")}</CardTitle>
            <CardDescription>{t("auth.pleaseWaitVerifying")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isVerified ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle>
            {isVerified
              ? t("auth.emailVerifiedTitle")
              : t("auth.verificationFailed")}
          </CardTitle>
          <CardDescription>
            {isVerified
              ? t("auth.emailVerifiedSuccessfully")
              : error || t("auth.verificationFailedDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isVerified ? (
            <Button onClick={handleGoToDashboard} className="w-full">
              {t("auth.goToDashboard")}
            </Button>
          ) : (
            <Button
              onClick={handleGoToLogin}
              variant="outline"
              className="w-full"
            >
              {t("auth.goToLogin")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
