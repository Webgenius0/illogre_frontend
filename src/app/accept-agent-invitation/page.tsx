"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function RedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    router.replace(`/auth/accept-agent-invitation${query}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8 text-[#162943]" />
        <p className="text-sm text-gray-600">Redirecting to agent invitation...</p>
      </div>
    </div>
  );
}

export default function AcceptAgentInvitationRedirect() {
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
