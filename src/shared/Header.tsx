"use client";

import logo from "@/assets/Logo.svg";
import DownArrowSvg from "@/components/svg/DownArrowSvg";
import Image from "next/image";
import Link from "next/link";
import rodro from "../assets/boy.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SettingSvg from "@/components/svg/SettingSvg";
import LogoutSvg from "@/components/svg/LogoutSvg";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import { useSettings } from "@/hooks/settings.api";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { Menu } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const user = useSelector((state: any) => state.auth.user);

  const { data: setting } = useSettings();
  const personalDetails = setting?.data?.personal_details;

  return (
    <div className="py-2.5 px-4 lg:px-5 bg-background rounded-full w-full flex items-center justify-between">
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Toggle Menu"
        >
          <Menu className="size-5 text-[#162943]" />
        </button>
        <Link href="/">
          <Image src={logo} alt="Logo" className="w-16 lg:w-22 cursor-pointer" />
        </Link>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">

        <NotificationPopover />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="bg-[#F6F6F6] flex items-center gap-1.5 lg:gap-2 p-1 pr-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors select-none">
              <div className="size-7 lg:size-9 rounded-full bg-gray-400 overflow-hidden">
                <Image
                  src={personalDetails?.avatar_url || rodro}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                  width={36}
                  height={36}
                />
              </div>
              <h5 className="text-xs lg:text-sm font-normal hidden sm:block max-w-25 truncate">
                {user?.name || "Rifat Ahamed"}
              </h5>
              <DownArrowSvg />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2 rounded-xl" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "Rifat Ahamed"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || "rifat@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            {user?.role === "owner" && (
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer py-2"
              >
                <SettingSvg className="mr-2 size-4 stroke-[#162943]" />
                <span>Settings</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="text-red-500 focus:text-red-500 cursor-pointer py-2"
            >
              <LogoutSvg className="mr-2 size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        showTrigger={false}
      />
    </div>
  );
}
