"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  accuracy: {
    label: "Accuracy",
    color: "#cae555",
  },
};

export function AccuracyTrendChart({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold tracking-tight text-gray-800">
          AI Accuracy Trend
        </h3>
      </div>

      <div className="h-60 w-full">
        {data && data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cae555" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#cae555" stopOpacity={0.01} />
                </linearGradient>
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
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                dx={-10}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={{
                  stroke: "#cae555",
                  strokeWidth: 2,
                  strokeDasharray: "0",
                }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#cae555"
                strokeWidth={3}
                fill="url(#accuracyGradient)"
                activeDot={{
                  r: 6,
                  fill: "#cae555",
                  stroke: "white",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
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

