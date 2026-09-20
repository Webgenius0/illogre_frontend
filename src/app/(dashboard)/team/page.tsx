"use client";
import { TeamStats } from "@/components/team/TeamStats";
import { TeamTable } from "@/components/team/TeamTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamOverview } from "@/hooks/team.api";

export default function TeamManagementPage() {
  const { data, isPending } = useTeamOverview();
  const stats = data?.data?.stats;
  const member = data?.data?.members;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3  duration-400">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Team Management</h1>
          <p className="text-gray-500 text-sm">
            Manage your support team members and roles
          </p>
        </div>

        {/* <div className="shrink-0">
          <Select defaultValue="7days">
            <SelectTrigger className="md:w-40 w-full h-12 rounded-full bg-white border-gray-100 text-base text-gray-700 hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="border-gray-100 p-0!">
              <SelectItem value="7days" className="py-2">
                Last 7 days
              </SelectItem>
              <SelectItem value="30days" className="py-2">
                Last 30 days
              </SelectItem>
              <SelectItem value="90days" className="py-2">
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* KPI Stats Grid */}
      <TeamStats data={stats} />

      {/* Main Members Section & Table */}
      <section className="space-y-6">
        <TeamTable members={member} isPending={isPending} />
      </section>
    </div>
  );
}
