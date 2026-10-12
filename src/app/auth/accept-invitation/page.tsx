"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function RedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      router.replace(`/auth/accept-invitation/${encodeURIComponent(token)}`);
    } else {
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8 text-[#162943]" />
        <p className="text-sm text-gray-600">Verifying invitation...</p>
      </div>
    </div>
  );
}

export default function AuthAcceptInvitationQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner className="size-8 text-[#162943]" />
        </div>
      }
    >
      <RedirectHandler />
    </Suspense>
  );
}
