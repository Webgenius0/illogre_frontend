"use client";

import React from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function CategoryDistribution({ data }: { data: any[] }) {
  if (!data) return null;
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 h-full flex flex-col justify-between">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Categories</h3>

      {data?.length > 0 ? (
        <div className="h-full flex flex-col justify-around">
          <div className="relative size-40 mx-auto my-4">
            <ChartContainer
              config={data.reduce((acc, current) => {
                acc[(current.name || "General").toLowerCase().replace(/\s+/g, "_")] = {
                  label: current.name,
                  color: current.fill,
                };
                return acc;
              }, {} as any)}
              className="h-full w-full"
            >
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                {total}
              </span>
              <span className="text-xs text-gray-400 font-medium">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3 px-2 mt-4">
            {data.map((category, index) => {
              const percentage =
                total > 0 ? Math.round(((category.value || 0) / total) * 100) : 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.fill }}
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {percentage}%
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {category.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center flex flex-col h-40 items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      )}
    </div>
  );
}

