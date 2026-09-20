import { useState } from "react";
import { CheckCircle2, Zap, Database } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type AutomationActivity } from "@/lib/types/automation";

interface Props {
  activity: AutomationActivity;
}

export function ActivityLogItem({ activity }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (activity.status) {
      case "Success":
        return (
          <Badge className="bg-emerald-50 text-emerald-500 hover:bg-emerald-100 border-none px-3 font-bold text-[10px] uppercase tracking-wider">
            SUCCESS
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-rose-50 text-rose-500 hover:bg-rose-100 border-none px-3 font-bold text-[10px] uppercase tracking-wider">
            FAILED
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-50 text-amber-500 hover:bg-amber-100 border-none px-3 font-bold text-[10px] uppercase tracking-wider">
            PENDING
          </Badge>
        );
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-3xl border border-gray-100 mb-6 p-4 transition-all overflow-hidden cursor-pointer hover:border-gray-200 group-hover:shadow-sm",
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 text-emerald-500 border border-gray-100 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 truncate">
                {activity.actionName}
              </span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-emerald-600 font-bold text-xs">
                {activity.ticketId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Order{" "}
              <span className="font-semibold text-gray-900">#TX-8902</span>-
              Automatic processed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-12 ml-12 md:ml-0 overflow-hidden shrink-0 whitespace-nowrap">
          <div className="hidden lg:block">
            <div className="text-xs font-medium mb-1">Customer</div>
            <div className="text-xs font-semibold">{activity.customerName}</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium mb-1">Trigger Time</div>
            <div className="text-xs font-semibold">{activity.timestamp}</div>
          </div>
          <div className="flex items-center gap-4">{getStatusBadge()}</div>
        </div>
      </div>

      <div className="bg-[#F2F3FF] p-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-6">
          <div>
            <div className="text-[10px] font-medium mb-2">Triggered by</div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <Zap className="h-3.5 w-3.5 text-emerald-500 fill-current" />
              {activity.triggeredBy}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-medium">Confidence</span>
              <span className="text-emerald-500 font-bold text-xs">
                {activity.confidence}%
              </span>
            </div>
            <div>
              <Progress
                value={activity.confidence}
                className="rounded-full **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:bg-gray-300 **:data-[slot=progress-indicator]:bg-green-500"
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium mb-2">Reason</div>
            <div className="text-xs font-bold">{activity.reason}</div>
          </div>

          <div>
            <div className="text-[10px] font-medium mb-2">Source</div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <Database className="h-3.5 w-3.5 text-indigo-500" />
              {activity.source}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
