"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export function TicketVolumeChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 h-full flex flex-col justify-between">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Ticket Volume</h3>

      <div className="h-80 w-full">
        {data && data.length > 0 ? (
          <ChartContainer
            config={{
              aiResolved: { label: "AI Resolved", color: "#66ED92" },
              manual: { label: "Manual", color: "#F3F4F6" },
            }}
            className="h-full w-full"
          >
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <pattern
                  id="striped"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="5" height="10" fill="#66ED92" />
                  <rect
                    x="5"
                    width="5"
                    height="10"
                    fill="#ffffff"
                    fillOpacity={0.2}
                  />
                </pattern>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#F3F4F6"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#9CA3AF" }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#9CA3AF" }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="aiResolved"
                fill="url(#striped)"
                radius={[10, 10, 0, 0]}
                barSize={36}
              />
              <Bar
                dataKey="manual"
                fill="#F3F4F6"
                radius={[10, 10, 0, 0]}
                barSize={36}
              />
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign="bottom"
                className="pt-8"
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

