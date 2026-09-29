"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout, setUser, UserState } from "@/store/slices/authSlice";
import { useCurrentUser } from "@/hooks/auth.api";
import { Spinner } from "@/components/ui/spinner";
import Header from "@/shared/Header";
import Sidebar from "@/shared/Sidebar";
import { X } from "lucide-react";
import AiConfigModal from "@/components/shared/AiConfigModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const reduxUser = useSelector((state: RootState) => state.auth.user as UserState | null);
  const activeUser = currentUser || reduxUser;

  const restrictedRoutes = [
    "/customers",
    "/tickets",
    "/ai_automation",
    "/knowledge_base",
  ];
  const isRestricted = restrictedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAiBlocked = isRestricted && activeUser && activeUser.is_ai_configured === false;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync authenticated user into Redux store
  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);

  // Handle unauthenticated state or session expiration
  useEffect(() => {
    if (isError) {
      dispatch(logout());
      const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [isError, pathname, router, dispatch]);

  // Redirect unsubscribed owners to plan selection
  useEffect(() => {
    if (
      activeUser &&
      activeUser.role === "owner" &&
      activeUser.is_subscribed === false &&
      !pathname.startsWith("/billing")
    ) {
      router.replace("/auth/register/plans");
    }
  }, [activeUser, pathname, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (isError || !activeUser) {
    return null;
  }

  return (
    <div className="p-4 lg:pr-0 h-screen overflow-hidden flex flex-col">
      <div className="lg:pr-4">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
      </div>
      <div className="flex flex-1 overflow-hidden relative mt-2">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:block max-w-62.5 w-full">
          <Sidebar />
        </div>

        {/* Sidebar for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden flex"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="w-72 h-full bg-[#f4f7fa] p-4 shadow-xl animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                  <X className="size-6" />
                </button>
              </div>
              <Sidebar
                onNavItemClick={() => setIsSidebarOpen(false)}
                className="h-[calc(100vh-100px)] mt-0 max-w-none rounded-2xl"
              />
            </div>
          </div>
        )}

        <div className="lg:p-5 h-full overflow-auto w-full">
          {isAiBlocked ? null : children}
        </div>
      </div>
      <AiConfigModal />
    </div>
  );
}
