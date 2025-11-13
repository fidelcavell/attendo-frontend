import api from "@/api/api-config";
import { Card, CardContent } from "@/components/ui/card";
import type { AxiosError } from "axios";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function AccountEmailChangePage() {
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const onVerify = useCallback(async () => {
    setResponse(null);
    setIsLoading(true);

    try {
      const requestParams = new URLSearchParams();
      requestParams.append("token", searchParams.get("token") ?? "");

      const response = await api.put(
        "/auth/account-email-change",
        requestParams,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      setResponse(response.data);
    } catch (exception: unknown) {
      const error = exception as AxiosError<{
        success: boolean;
        message: string;
      }>;
      setResponse(error.response?.data || null);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    onVerify();
  }, [onVerify]);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-dashed">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-semibold">Verifying your email…</h1>
                <p className="text-sm text-muted-foreground">
                  Please wait while we check your verification link.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderMessage = () => {
    const message = response?.message?.toLowerCase() || "";

    let desc = "";
    if (message.includes("verified")) {
      desc =
        "Your email has been successfully verified. You can now log in to your account.";
    } else if (message.includes("expired")) {
      desc = "The verification link has expired. Please request a new one.";
    } else if (message.includes("already")) {
      desc = "Your account is already verified. You can go ahead and log in.";
    } else if (message.includes("not found") || message.includes("invalid")) {
      desc =
        "We couldn’t find the verification token. Please check your email or request a new one.";
    } else {
      desc = "We couldn’t process your request. Please try again later.";
    }

    return {
      title: response?.message || "Unknown status",
      desc,
      success: response?.success ?? false,
    };
  };

  const { title, desc, success } = renderMessage();

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              {success ? (
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CircleCheck className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <CircleAlert className="w-8 h-8 text-destructive" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
