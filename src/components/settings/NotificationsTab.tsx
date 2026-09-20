"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  useSettings,
  useUpdateNotificationSettings,
} from "@/hooks/settings.api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function NotificationsTab() {
  const [notifyNew, setNotifyNew] = useState(true);
  const [notifyTicket, setNotifyTicket] = useState(true);
  const [notifyInvoice, setNotifyInvoice] = useState(false);
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateNotifications, isPending: isUpdating } =
    useUpdateNotificationSettings();

  useEffect(() => {
    if (settingsData?.data?.notifications) {
      const n = settingsData.data.notifications;
      setNotifyNew(n.new_notifications ?? n.notify_new ?? true);
      setNotifyTicket(n.ticket_created ?? n.notify_ticket ?? true);
      setNotifyInvoice(n.invoice_unpaid ?? n.notify_invoice ?? false);
    }
  }, [settingsData]);

  const handleSave = () => {
    updateNotifications({
      notify_new: notifyNew,
      new_notifications: notifyNew,
      notify_ticket: notifyTicket,
      ticket_created: notifyTicket,
      notify_invoice: notifyInvoice,
      invoice_unpaid: notifyInvoice,
    });
  };

  const notifications = [
    {
      id: "notify_new",
      title: "New Activity",
      description: "Notify for any new activity in the system",
      checked: notifyNew,
      onChange: setNotifyNew,
    },
    {
      id: "notify_ticket",
      title: "Ticket Updates",
      description: "Notify when there are updates on tickets",
      checked: notifyTicket,
      onChange: setNotifyTicket,
    },
    {
      id: "notify_invoice",
      title: "Invoice Alerts",
      description: "Notify for new invoices and payment updates",
      checked: notifyInvoice,
      onChange: setNotifyInvoice,
    },
  ];

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white p-8 rounded-2xl border border-gray-100">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">
            Update your email notification preferences
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center justify-between py-4 px-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors group"
            >
              <div>
                <h4 className="font-semibold text-[15px] text-gray-900">{notif.title}</h4>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  {notif.description}
                </p>
              </div>
              <Switch
                checked={notif.checked}
                onCheckedChange={notif.onChange}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="h-11 bg-linear-to-r from-secondary to-primary text-foreground font-semibold px-8 flex items-center gap-2 rounded-xl cursor-pointer"
          >
            {isUpdating && <Spinner className="size-4" />}
            {isUpdating ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}
