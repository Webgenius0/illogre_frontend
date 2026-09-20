"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";

type IntegrationCardProps = {
  app: {
    id?: string | number;
    name: string;
    description: string;
    status: string;
    lastSynced?: string;
    logoBg?: string;
    initial: string;
    logoUrl?: string | StaticImageData;
  };
  type: "connected" | "available" | "migrate";
  onAction?: () => void;
};

export function IntegrationCard({ app, type, onAction }: IntegrationCardProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      console.log(`${type} action for ${app.name}`);
    }
  };

  const btnDisable =
    app?.id === "whatsapp" ||
    app?.id === "outlook" ||
    app?.id === "slack" ||
    app?.id === "instagram" ||
    app?.id === "klaviyo";

  return (
    <div className="group bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
      <div className="mb-3 space-y-3">
        {/* Card Header with Logo/Icon & Badge */}
        <div className="flex justify-between items-start">
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center overflow-hidden border-0!",
              app.logoBg,
              !app.logoUrl && "text-white font-bold text-xl",
            )}
          >
            {app.logoUrl ? (
              <Image
                src={app.logoUrl}
                alt={app.name}
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
            ) : (
              <span>{app.initial}</span>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full p-3 text-xs font-medium capitalize border-none",
              app.status === "Connected" ||
                (app.status === "Available" && type === "connected")
                ? "bg-[#DCFCE7] text-[#16A34A]"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {app.status}
          </Badge>
        </div>

        {/* Name and Description */}
        <div>
          <h3 className="text-xl font-semibold transition-colors">
            {app.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {app.description}
          </p>
        </div>
      </div>

      {/* Card Footer with Details and Action Button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">
          {app.lastSynced || ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={btnDisable}
          onClick={handleAction}
          className={cn(
            "h-10 px-6 font-bold transition-all capitalize shrink-0 border-2",
            type === "connected" &&
              "text-gray-700 border-gray-100 hover:bg-gray-50",
            type === "available" &&
              "bg-white border-gray-100 hover:bg-gray-50 text-gray-700",
            type === "migrate" &&
              "bg-white border-gray-100 hover:bg-gray-50 text-gray-700",
          )}
        >
          {type === "connected"
            ? "Disconnect"
            : type === "available"
              ? "connect"
              : "Import Data"}
        </Button>
      </div>
    </div>
  );
}
