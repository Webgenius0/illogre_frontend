"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocialLogin } from "@/hooks/auth.api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Info } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socialLoginMutation = useSocialLogin();
  const initiatedRef = useRef(false);

  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "missing_client_id") return;
    if (initiatedRef.current) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    let token = null;

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      token = params.get("access_token");
    }

    if (!token) {
      token = searchParams.get("token") || searchParams.get("access_token");
    }

    console.log(token);

    if (token) {
      initiatedRef.current = true;
      socialLoginMutation.mutate({
        provider: "google",
        token: token,
      });
    } else {
      const code = searchParams.get("code");

      if (code) {
        initiatedRef.current = true;
        socialLoginMutation.mutate({
          provider: "google",
          token: code,
        });
      } else {
        toast.error("Google authentication failed. Please try again.");
        router.push("/auth/login");
      }
    }
  }, [errorParam, searchParams, router, socialLoginMutation]);

  if (errorParam === "missing_client_id") {
    return (
      <div className="min-h-screen bg-linear-to-b from-secondary/20 to-primary/40 flex flex-col items-center justify-center font-urbanist p-4">
        <div className="bg-white border border-border p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="size-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-4 mx-auto">
            <Info className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
            Google Login Not Configured
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            Google OAuth Credentials have not been configured yet or the Client ID is invalid.
          </p>
          <div className="bg-amber-50/60 rounded-xl p-4 text-xs text-amber-900 border border-amber-200/80 mb-6 space-y-1.5 text-left">
            <p className="font-bold">How to configure:</p>
            <p>1. Open Admin Panel &gt; System Settings &gt; Google OAuth Config.</p>
            <p>2. Enter your Google Client ID &amp; Secret from Google Console.</p>
            <p>3. Click Save Settings to activate Google Sign-In.</p>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full h-10 rounded-lg bg-[#162943] text-white hover:bg-black font-semibold transition-colors cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-secondary/20 to-primary/40 flex flex-col items-center justify-center font-urbanist">
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full text-center">
        <Spinner className="size-8 text-[#162943]" />
        <h3 className="text-lg font-semibold text-[#162943]">
          Verifying credentials
        </h3>
        <p className="text-sm text-gray-500">
          Completing authentication via Google Sign-In secure server...
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-b from-secondary/20 to-primary/40 flex flex-col items-center justify-center font-urbanist">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full text-center">
            <Spinner className="size-8 text-[#162943]" />
            <h3 className="text-lg font-semibold text-[#162943]">Loading</h3>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
