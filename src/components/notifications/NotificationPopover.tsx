"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Ticket,
  AlertCircle,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useNotifications,
  useMarkNotificationsRead,
} from "@/hooks/notifications.api";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: notificationsData, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationsRead();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unread_count || 0;

  const handleNotificationClick = (actionUrl?: string) => {
    setOpen(false);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(undefined);
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "ticket":
        return <Ticket className="h-4 w-4 text-emerald-600" />;
      case "alert":
      case "error":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "ai":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative bg-[#F6F6F6] rounded-full size-9 lg:size-11 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors focus:outline-hidden"
        aria-label="Notifications"
      >
        <Bell className="size-4 lg:size-5 text-[#162943]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 lg:size-5 bg-rose-500 text-white font-bold text-[10px] lg:text-[11px] rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 rounded-3xl p-0 shadow-2xl border border-gray-100 bg-white overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item.action_url)}
                className={cn(
                  "p-4 transition-colors cursor-pointer flex items-start gap-3 hover:bg-gray-50/80",
                  !item.is_read && "bg-emerald-50/20",
                )}
              >
                <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {item.created_at}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No notifications yet</p>
              <p className="text-[11px] text-gray-400">
                You're all caught up!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
          <span className="text-[11px] text-gray-400 font-medium">
            Real-time Support & Activity Notifications
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
