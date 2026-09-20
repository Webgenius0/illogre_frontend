import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useLogout } from "@/hooks/auth.api";

function AiConfigModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [eventUserType, setEventUserType] = useState<string | null>(null);
  
  const user = useSelector((state: RootState) => state.auth.user as any);
  const { mutate: logout, isPending } = useLogout();

  // Synchronously calculate if it should be open
  const restrictedRoutes = ["/customers", "/tickets", "/ai_automation", "/knowledge_base"];
  const isRestricted = restrictedRoutes.some((route) => pathname.startsWith(route));
  
  const isUrlForced = searchParams.get("ai_not_configured") === "true";
  const isRouteForced = isRestricted && user && user.is_ai_configured === false;
  
  const isOpen = isUrlForced || isRouteForced || isEventOpen;
  
  const currentUserType = eventUserType || (user?.role === "owner" ? "owner" : "agent");

  useEffect(() => {
    // Clean up URL if it has the query param
    if (isUrlForced) {
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }

    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEventUserType(customEvent.detail?.userType || "agent");
      setIsEventOpen(true);
    };

    window.addEventListener("show-ai-config-modal", handleEvent);
    return () => window.removeEventListener("show-ai-config-modal", handleEvent);
  }, [isUrlForced, router]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsEventOpen(false);
    // Reload the page instead of navigating
    window.location.reload();
  };

  const getContent = () => {
    return {
      title: "AI Configuration Required",
      message: "The platform administrator has not completed the AI configuration yet. Please contact support to set this up.",
      buttonText: "Refresh",
    };
  };

  const content = getContent();

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-md rounded-2xl p-6 text-center shadow-xl [&>button]:hidden"
        // @ts-expect-error - Base UI types might be missing these Radix UI properties
        onInteractOutside={(e: any) => e.preventDefault()}
        onEscapeKeyDown={(e: any) => e.preventDefault()}
      >
        <div className="flex justify-center mb-2 text-amber-500 bg-amber-50 w-16 h-16 rounded-full mx-auto items-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-center text-gray-900">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 px-4 pt-2">
            {content.message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 justify-center items-center">
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-1/2"
          >
            {content.buttonText}
          </Button>
          <Button
            variant="link"
            onClick={() => logout({})}
            disabled={isPending}
            className="text-red-500 hover:text-red-600 cursor-pointer"
          >
            {isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AiConfigModal() {
  return (
    <React.Suspense fallback={null}>
      <AiConfigModalContent />
    </React.Suspense>
  );
}
