"use client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InfoIcon, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/settings.api";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [attempts, setAttempts] = useState(0);
  const [waiting, setWaiting] = useState(true);
  const maxAttempts = 10;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isPending } = useSettings();
  const subscribed = data?.data?.personal_details?.is_subscribed;

  // Poll every 2 seconds up to maxAttempts times, waiting for Stripe webhook
  useEffect(() => {
    if (subscribed) {
      setWaiting(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.push("/");
      return;
    }

    if (attempts >= maxAttempts) {
      setWaiting(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      setAttempts((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [subscribed, attempts]);

  const isLoading = isPending || (waiting && attempts < maxAttempts && !subscribed);

  return (
    <div>
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-urbanist">
        <div className="w-full max-w-140 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-12 md:p-16 shadow-lg text-center relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="size-20 rounded-full border border-primary/20 flex items-center justify-center bg-white/10 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/30 shadow-lg">
                <Check className="text-secondary w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            Your registration has been successfully completed!
          </h2>
          <p className="text-[#6B6B6B] text-base sm:text-lg mb-8 sm:mb-14 font-medium">
            You have successfully created your account.
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 mb-4">
              <Spinner className="size-5" />
              <span className="text-sm text-[#A0A0A0]">
                Verifying your payment, please wait...
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 mb-4">
                <span className="text-sm text-[#A0A0A0]">
                  {subscribed ? "Redirecting you to dashboard..." : "Redirecting..."}
                </span>
              </div>

              <Button
                onClick={() =>
                  subscribed
                    ? router.push("/")
                    : router.push("/auth/register/plans")
                }
                className="w-full inline-block h-10 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-foreground text-base rounded-md transition-all duration-300 font-semibold transform active:scale-[0.98] text-center"
              >
                {subscribed ? "Go to Dashboard" : "Get the plan"}
              </Button>

              {!subscribed && (
                <Alert className="max-w-md border-amber-200 mt-5 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                  <InfoIcon />
                  <AlertTitle>
                    Payment not yet confirmed. You can still choose a plan below.
                  </AlertTitle>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
