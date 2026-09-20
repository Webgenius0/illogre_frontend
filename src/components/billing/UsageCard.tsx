import React from "react";

interface UsageCardProps {
  label: string;
  count: string;
  total: string;
  percentage: number;
  barColor?: string;
  textColor?: string;
}

export default function UsageCard({
  label,
  count,
  total,
  percentage,
  barColor = "bg-blue-500",
  textColor = "text-blue-500",
}: UsageCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2.5 shadow-2xs hover:border-gray-200 transition-all">
      <div className="flex justify-between items-center text-xs md:text-sm">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className={`font-bold ${textColor}`}>
          {count} <span className="text-gray-400 font-normal">/ {total}</span>
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-400 font-medium">
          <span>Capacity</span>
          <span>{percentage}% used</span>
        </div>
      </div>
    </div>
  );
}
