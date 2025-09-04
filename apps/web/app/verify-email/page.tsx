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
import { apiService } from "@/lib/api-service";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage(): JSX.Element {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("No verification token found");
        setIsVerifying(false);
        return;
      }

      try {
        const result = await apiService.verifyEmail(token);
        if (result.verified) {
          setIsVerified(true);
          toast({
            title: "Email verified successfully!",
            description:
              "Your account has been verified. You can now use all features.",
          });
        } else {
          setError(result.message || "Verification failed");
        }
      } catch (error: any) {
        setError(error.message || "Verification failed");
        toast({
          title: "Verification failed",
          description:
            error.message || "Something went wrong. Please try again.",
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
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
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
            {isVerified ? "Email Verified!" : "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {isVerified
              ? "Your email has been successfully verified."
              : error || "Something went wrong during verification."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isVerified ? (
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={handleGoToLogin}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
