"use client";

import React from "react";

export function ResolutionComparison({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Calculate average AI and Human time over days with resolution activity
  const aiDays = data.filter((curr) => curr.ai_time > 0);
  const humanDays = data.filter((curr) => curr.human_time > 0);

  const totalAi = aiDays.reduce((acc, curr) => acc + curr.ai_time, 0);
  const totalHuman = humanDays.reduce((acc, curr) => acc + curr.human_time, 0);

  const avgAiNum = aiDays.length > 0 ? totalAi / aiDays.length : 0;
  const avgHumanNum = humanDays.length > 0 ? totalHuman / humanDays.length : 0;

  const avgAi = avgAiNum.toFixed(1);
  const avgHuman = avgHumanNum.toFixed(1);

  const maxTime = Math.max(avgHumanNum, avgAiNum, 10);

  const stats = [
    {
      type: "AI Resolution",
      time: avgAiNum,
      displayTime: `${avgAi} min`,
      color: "#cae555",
    },
    {
      type: "Human Resolution",
      time: avgHumanNum,
      displayTime: `${avgHuman} min`,
      color: "#162943",
    },
  ];

  const fasterMultiplier =
    avgAiNum > 0 && avgHumanNum > 0
      ? (avgHumanNum / avgAiNum).toFixed(1)
      : avgAiNum === 0 && avgHumanNum > 0
        ? "Fast"
        : "1.0";

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between h-full overflow-hidden">
      <h3 className="text-xl font-bold tracking-tight text-gray-800 mb-6">
        Avg Resolution Time
      </h3>

      <div className="space-y-6 my-auto">
        {stats.map((item, index) => (
          <div key={index} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {item.type}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: item.color === "#cae555" ? "#84a100" : item.color }}
              >
                {item.displayTime}
              </span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  backgroundColor: item.color,
                  width: `${maxTime > 0 ? (item.time / maxTime) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
          <span className="text-xl font-bold text-gray-900">{fasterMultiplier}× faster</span>
          <span className="text-xs text-gray-500 font-medium">
            AI vs human agents resolution time
          </span>
        </div>
      </div>
    </div>
  );
}

