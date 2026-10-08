"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useSocialLogin } from "@/hooks/auth.api";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import googleIcon from "../../assets/google.png";

interface GoogleSignInButtonProps {
  className?: string;
}

function ActiveGoogleButton({ className }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const socialLoginMutation = useSocialLogin();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setLoading(true);
      socialLoginMutation.mutate(
        { token: tokenResponse.access_token },
        {
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      toast.error("Google sign-in was unsuccessful.");
      setLoading(false);
    },
  });

  const isPending = loading || socialLoginMutation.isPending;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        setLoading(true);
        googleLogin();
      }}
      className={
        className ||
        "flex items-center justify-center gap-3 py-2 px-4 bg-white/60 border border-white rounded-md hover:bg-white/80 transition-all duration-300 shadow-sm font-medium text-gray-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed w-full"
      }
    >
      {isPending ? (
        <>
          <Spinner className="w-4 h-4" />
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          <Image src={googleIcon} alt="Google" className="w-6.5" />
          Google
        </>
      )}
    </button>
  );
}

function FallbackGoogleButton({ className }: GoogleSignInButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    toast.error("Google OAuth is not configured. Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
    router.push("/auth/callback?error=missing_client_id");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "flex items-center justify-center gap-3 py-2 px-4 bg-white/60 border border-white rounded-md hover:bg-white/80 transition-all duration-300 shadow-sm font-medium text-gray-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed w-full"
      }
    >
      <Image src={googleIcon} alt="Google" className="w-6.5" />
      Google
    </button>
  );
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(
    clientId &&
    clientId.trim() !== "" &&
    clientId !== "undefined" &&
    clientId !== "your_client_id_here"
  );

  if (!isConfigured) {
    return <FallbackGoogleButton className={className} />;
  }

  return <ActiveGoogleButton className={className} />;
}
