"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TicketVolumeChart } from "@/components/dashboard/TicketVolumeChart";
import { ResolutionRateChart } from "@/components/dashboard/ResolutionRateChart";
import { RecentTicketsTable } from "@/components/dashboard/RecentTicketsTable";
import { useOwnerOverview } from "@/hooks/owner.api";
import { useSelector } from "react-redux";

export default function OverviewPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { data, isPending } = useOwnerOverview();
  const stats = data?.data?.stats;
  const charts = data?.data?.charts;
  const tickets = data?.data?.recent_tickets;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Here are your dashboard overview
          </p>
        </div>
        {/* <Select defaultValue="7days">
          <SelectTrigger className="max-w-35 w-full rounded-full bg-white">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      {/* Stats Cards Section */}
      <StatsOverview data={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TicketVolumeChart data={charts?.ticket_volume} />
        <ResolutionRateChart data={charts?.ai_resolution_rate} />
      </div>

      {/* Recent Tickets Table Section */}
      <RecentTicketsTable data={tickets} isPending={isPending} />
    </div>
  );
}
