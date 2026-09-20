"use client";
import {
  Target,
  Bot,
  Zap,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AnalyticsCards({ data }: { data: any }) {
  if (!data) return null;

  const stats = [
    {
      title: data.ai_accuracy?.label || "AI Accuracy",
      value: data.ai_accuracy?.value || "0%",
      trend: data.ai_accuracy?.trend || "",
      isGood: !(data.ai_accuracy?.trend || "").startsWith("-"),
      icon: Target,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: data.avg_ai_resolution?.label || "Avg. AI Resolution",
      value: data.avg_ai_resolution?.value || "0 min",
      trend: data.avg_ai_resolution?.trend || "",
      // For resolution time, negative change (less time) is good!
      isGood: (data.avg_ai_resolution?.trend || "").startsWith("-"),
      icon: Bot,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: data.avg_human_resolution?.label || "Avg. Human Resolution",
      value: data.avg_human_resolution?.value || "0 min",
      trend: data.avg_human_resolution?.trend || "",
      isGood: (data.avg_human_resolution?.trend || "").startsWith("-"),
      icon: Clock,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      title: data.automation_rate?.label || "Automation Rate",
      value: data.automation_rate?.value || "0%",
      trend: data.automation_rate?.trend || "",
      isGood: !(data.automation_rate?.trend || "").startsWith("-"),
      icon: Zap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: data.csat_score?.label || "CSAT Score",
      value: data.csat_score?.value || "0/5",
      trend: data.csat_score?.trend || "",
      isGood: data.csat_score?.trend !== "Needs Attention",
      icon: Star,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: data.resolved_today?.label || "Resolved Today",
      value: data.resolved_today?.value || "0",
      trend: data.resolved_today?.trend || "",
      isGood: !(data.resolved_today?.trend || "").startsWith("-"),
      icon: CheckCircle,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const isNegativeTrend = stat.trend.startsWith("-");
        const isTextTrend = !stat.trend.startsWith("+") && !stat.trend.startsWith("-");

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-500 font-medium text-sm">
                {stat.title}
              </span>
              <div className={cn("p-2.5 rounded-xl", stat.iconBg)}>
                <stat.icon className={cn("size-5", stat.iconColor)} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap min-h-5">
                {stat.trend && (
                  <div
                    className={cn(
                      "flex items-center text-xs font-semibold px-2 py-0.5 rounded-md",
                      stat.isGood
                        ? "bg-green-50 text-green-700"
                        : "bg-rose-50 text-rose-600",
                    )}
                  >
                    {!isTextTrend && (
                      isNegativeTrend ? (
                        <TrendingDown className="size-3.5 mr-1" />
                      ) : (
                        <TrendingUp className="size-3.5 mr-1" />
                      )
                    )}
                    {stat.trend}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

