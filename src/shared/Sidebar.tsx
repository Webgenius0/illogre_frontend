"use client";
import AiSvg from "@/components/svg/AiSvg";
import AnalyticsSvg from "@/components/svg/AnalyticsSvg";
import BookOpenSvg from "@/components/svg/BookOpenSvg";
import CardSvg from "@/components/svg/CardSvg";
import DashboardSquareSvg from "@/components/svg/DashboardSquareSvg";
import MultiUserSvg from "@/components/svg/MultiUserSvg";
import PuzleSvg from "@/components/svg/PuzleSvg";
import SettingSvg from "@/components/svg/SettingSvg";
import TicketsSvg from "@/components/svg/TicketsSvg";
import UserSettingSvg from "@/components/svg/UserSettingSvg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutModal from "./LogoutModal";
import { useSelector } from "react-redux";

export default function Sidebar({
  onNavItemClick,
  className,
}: {
  onNavItemClick?: () => void;
  className?: string;
}) {
  const location = usePathname();
  const user = useSelector((state: any) => state.auth.user);

  const menuItems =
    user?.role === "owner"
      ? [
          {
            name: "Overview",
            icon: <DashboardSquareSvg />,
            path: "/",
          },
          {
            name: "Tickets",
            icon: <TicketsSvg />,
            path: "/tickets",
          },
          {
            name: "Knowledge Base",
            icon: <BookOpenSvg />,
            path: "/knowledge_base",
          },
          {
            name: "AI Automation",
            icon: <AiSvg />,
            path: "/ai_automation",
          },
          {
            name: "Customers",
            icon: <MultiUserSvg />,
            path: "/customers",
          },
          {
            name: "Analytics",
            icon: <AnalyticsSvg />,
            path: "/analytics",
          },
          {
            name: "Integrations",
            icon: <PuzleSvg />,
            path: "/integrations",
          },
          {
            name: "Team",
            icon: <UserSettingSvg />,
            path: "/team",
          },
          {
            name: "Billing",
            icon: <CardSvg />,
            path: "/billing",
          },
          {
            name: "Settings",
            icon: <SettingSvg />,
            path: "/settings",
          },
        ]
      : user?.role === "Support Manager"
        ? [
            {
              name: "Tickets",
              icon: <TicketsSvg />,
              path: "/tickets",
            },
            {
              name: "Knowledge Base",
              icon: <BookOpenSvg />,
              path: "/knowledge_base",
            },
            {
              name: "AI Automation",
              icon: <AiSvg />,
              path: "/ai_automation",
            },
            {
              name: "Customers",
              icon: <MultiUserSvg />,
              path: "/customers",
            },
            {
              name: "Analytics",
              icon: <AnalyticsSvg />,
              path: "/analytics",
            },
            {
              name: "Team",
              icon: <UserSettingSvg />,
              path: "/team",
            },
          ]
        : user?.role === "Support Agent"
          ? [
              {
                name: "Tickets",
                icon: <TicketsSvg />,
                path: "/tickets",
              },
            ]
          : [];

  return (
    <div
      className={`rounded-4xl bg-background h-[calc(100vh-110px)]  w-full mt-3 py-4 pr-4 overflow-hidden ${className}`}
    >
      <div className="h-[calc(100vh-220px)] overflow-auto custom_scroll">
        <div className="text-base font-medium">
          {menuItems?.map((item: any, index: number) => {
            const isActive =
              item.path === "/"
                ? location === "/"
                : location.startsWith(item.path);
            return (
              <Link
                href={item.path}
                key={index}
                onClick={onNavItemClick}
                className={`flex items-center gap-2 py-3 px-5 w-full rounded-r-4xl ${isActive ? "bg-linear-to-r from-secondary fadei to-primary text-foreground" : "hover:bg-gray-100 text-[#454F5B]"}`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <LogoutModal />
    </div>
  );
}
