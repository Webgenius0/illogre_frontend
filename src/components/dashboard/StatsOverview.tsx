import {
  Ticket,
  Bot,
  Clock,
  TrendingUp,
  MoveUpRight,
  MoveDownLeft,
} from "lucide-react";
export function StatsOverview({ data }: { data?: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {/* Total Tickets */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Total Tickets
          </span>
          <div className="bg-[#f2f9cc] p-2 rounded-lg text-[#add633]">
            <Ticket className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-bold">
          {data?.total_tickets?.value ?? "0"}
        </div>
        <div className="text-xs mt-2 font-medium flex items-center gap-1">
          <span
            className={`flex items-center ${data?.total_tickets?.trend === "up" ? "text-green-500" : "text-red-400"}`}
          >
            {data?.total_tickets?.trend === "up" ? (
              <MoveUpRight className="size-3" />
            ) : (
              <MoveDownLeft className="size-3" />
            )}
            {data?.total_tickets?.change > 0 ? "+" : ""}
            {data?.total_tickets?.change}%
          </span>
          <span className="text-muted-foreground">
            {data?.total_tickets?.label}
          </span>
        </div>
      </div>

      {/* AI Resolved */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            AI Resolved
          </span>
          <div className="bg-green-100 p-2 rounded-lg text-green-500">
            <Bot className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-bold">
          {data?.ai_resolved?.value ?? "0"}
        </div>
        <div className="text-xs mt-2 font-medium flex items-center gap-1">
          <span className="text-green-500 flex items-center">
            ↗ +{data?.ai_resolved?.change}%
          </span>
          <span className="text-muted-foreground">
            {data?.ai_resolved?.percentage}% {data?.ai_resolved?.label}
          </span>
        </div>
      </div>

      {/* Waiting Approval */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Waiting Approval
          </span>
          <div className="bg-orange-100 p-2 rounded-lg text-orange-500">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-bold">
          {data?.waiting_approval?.value ?? "0"}
        </div>
        <div className="text-xs mt-2 font-medium flex items-center gap-1">
          <span
            className={`flex items-center ${data?.waiting_approval?.trend === "down" ? "text-green-500" : "text-red-400"}`}
          >
            {data?.waiting_approval?.trend === "down" ? "↘" : "↗"}{" "}
            {data?.waiting_approval?.change}%
          </span>
          <span className="text-muted-foreground">
            {data?.waiting_approval?.status}
          </span>
        </div>
      </div>

      {/* Success Rate */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Success Rate
          </span>
          <div className="bg-purple-100 p-2 rounded-lg text-purple-500">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-bold">
          {data?.success_rate?.value ?? "0"}
        </div>
        <div className="text-xs mt-2 font-medium flex items-center gap-1">
          <span className="text-green-500 flex items-center">
            ↗ +{data?.success_rate?.change}%
          </span>
          <span className="text-muted-foreground">
            {data?.success_rate?.label}
          </span>
        </div>
      </div>

      {/* Time Saved */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Time Saved
          </span>
          <div className="bg-orange-100 p-2 rounded-lg text-orange-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-bold">
          {data?.time_saved?.value ?? "0h"}
        </div>
        <div className="text-xs mt-2 text-muted-foreground font-medium">
          {data?.time_saved?.label}
        </div>
      </div>
    </div>
  );
}
