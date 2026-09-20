"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const ticketVolumeData = [
  { day: "Mon", tickets: 0 },
  { day: "Tue", tickets: 0 },
  { day: "Wed", tickets: 0 },
  { day: "Thu", tickets: 0 },
  { day: "Fri", tickets: 0 },
  { day: "Sat", tickets: 0 },
  { day: "Sun", tickets: 0 },
];

export function TicketVolumeChart({ data }: { data?: any }) {
  return (
    <div className="lg:col-span-2 rounded-2xl bg-white flex flex-col">
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <h3 className="text-lg font-semibold">Ticket volume</h3>
        <Select defaultValue="7days">
          <SelectTrigger className="max-w-32 w-full rounded-full h-8 bg-white text-xs">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-6 pt-0 flex-1">
        <ChartContainer
          config={{ tickets: { label: "Tickets", color: "#add633" } }}
          className="h-62 w-full"
        >
          <AreaChart
            data={data || ticketVolumeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dx={-10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#add633"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTickets)"
            />
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#add633" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#add633" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
