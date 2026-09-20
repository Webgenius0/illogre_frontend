"use client";

import React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const aiResolutionData = [
  { week: "Week 1", resolved: 0, unresolved: 0 },
  { week: "Week 2", resolved: 0, unresolved: 0 },
  { week: "Week 3", resolved: 0, unresolved: 0 },
  { week: "Week 4", resolved: 0, unresolved: 0 },
  { week: "Week 5", resolved: 0, unresolved: 0 },
];

export function ResolutionRateChart({ data }: { data?: any }) {
  return (
    <div className="lg:col-span-1 rounded-2xl bg-white flex flex-col">
      <div className="p-6 pb-6">
        <h3 className="text-lg font-semibold">AI Resolution Rate</h3>
      </div>
      <div className="p-6 pt-0 flex-1">
        <ChartContainer
          config={{
            resolved: { label: "Resolved", color: "#F6F6F6" },
            unresolved: { label: "Unresolved", color: "#75FC96" },
          }}
          className="h-62 w-full"
        >
          <BarChart
            data={data || aiResolutionData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="week"
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
            <Bar
              dataKey="total"
              stackId="a"
              fill="var(--color-unresolved)"
              radius={[6, 6, 4, 4]}
              barSize={40}
            />
            <Bar
              dataKey="resolved"
              stackId="a"
              fill="var(--color-resolved)"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
