"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsCards } from "@/components/analytics/AnalyticsCards";
import { TicketVolumeChart } from "@/components/analytics/TicketVolumeChart";
import { CategoryDistribution } from "@/components/analytics/CategoryDistribution";
import { AccuracyTrendChart } from "@/components/analytics/AccuracyTrendChart";
import { ResolutionComparison } from "@/components/analytics/ResolutionComparison";
import { Button } from "@/components/ui/button";

import { useGetAnalytics } from "@/hooks/analytics.api";
import { Spinner } from "@/components/ui/spinner";

export default function AnalyticsPage() {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [range, setRange] = useState("7days");

  const { data: responseData, isLoading } = useGetAnalytics(range);
  const data = responseData?.data;

  console.log(data);

  // csv export
  const handleExportCSV = () => {
    if (!data) return;
    setIsExportingCSV(true);
    setTimeout(() => {
      const kpis = data.kpis || {};
      const kpiKeys = [
        "ai_accuracy",
        "avg_ai_resolution",
        "avg_human_resolution",
        "automation_rate",
        "csat_score",
        "resolved_today",
      ];

      const csvRows: string[] = ["Metric,Value,Trend"];
      kpiKeys.forEach((key) => {
        const item = kpis[key as keyof typeof kpis];
        if (item) {
          const label = item.label || "";
          const value =
            item.value !== undefined && item.value !== null
              ? String(item.value)
              : "";
          const trend = item.trend || "";
          const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
          csvRows.push(`${escape(label)},${escape(value)},${escape(trend)}`);
        }
      });

      // Include Category Distribution in CSV
      if (data.category_distribution && data.category_distribution.length > 0) {
        csvRows.push("");
        csvRows.push("Category Distribution Breakdown");
        csvRows.push("Category,Volume,Percentage");
        const totalVolume =
          data.category_distribution.reduce(
            (acc: number, curr: any) => acc + (curr.value || 0),
            0,
          ) || 1;
        data.category_distribution.forEach((cat: any) => {
          const name = cat.name || "";
          const val = cat.value !== undefined ? String(cat.value) : "0";
          const percentage =
            totalVolume > 0
              ? `${((cat.value / totalVolume) * 100).toFixed(1)}%`
              : "0%";
          const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
          csvRows.push(`${escape(name)},${escape(val)},${escape(percentage)}`);
        });
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `analytics_report_${range}_${new Date().getTime()}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportingCSV(false);
    }, 1000);
  };

  // pdf export
  const handleExportPDF = () => {
    if (!data) return;
    setIsExportingPDF(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // -- DRAW HEADER --
      doc.setFillColor(202, 229, 85); // Primary #cae555
      doc.rect(15, 15, 10, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(31, 41, 55); // gray-800
      doc.text("Illogre Analytics Report", 30, 23);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // gray-500
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Generated on: ${dateStr}`, 30, 28);

      doc.setDrawColor(229, 231, 235); // gray-200
      doc.line(15, 35, pageWidth - 15, 35);

      // -- DRAW KPI SECTION --
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text("Operational KPIs", 15, 48);

      const dynamicKpis = data.kpis || {};
      const kpis = [
        {
          label: dynamicKpis.ai_accuracy?.label || "AI Accuracy",
          value:
            dynamicKpis.ai_accuracy?.value !== undefined
              ? String(dynamicKpis.ai_accuracy.value)
              : "0%",
          trend: dynamicKpis.ai_accuracy?.trend || "+0%",
        },
        {
          label: dynamicKpis.avg_ai_resolution?.label || "Avg. AI Resolution",
          value:
            dynamicKpis.avg_ai_resolution?.value !== undefined
              ? String(dynamicKpis.avg_ai_resolution.value)
              : "0 min",
          trend: dynamicKpis.avg_ai_resolution?.trend || "",
        },
        {
          label:
            dynamicKpis.avg_human_resolution?.label || "Avg. Human Resolution",
          value:
            dynamicKpis.avg_human_resolution?.value !== undefined
              ? String(dynamicKpis.avg_human_resolution.value)
              : "0 min",
          trend: dynamicKpis.avg_human_resolution?.trend || "",
        },
        {
          label: dynamicKpis.automation_rate?.label || "Automation Rate",
          value:
            dynamicKpis.automation_rate?.value !== undefined
              ? String(dynamicKpis.automation_rate.value)
              : "0%",
          trend: dynamicKpis.automation_rate?.trend || "+0%",
        },
        {
          label: dynamicKpis.csat_score?.label || "CSAT Score",
          value:
            dynamicKpis.csat_score?.value !== undefined
              ? String(dynamicKpis.csat_score.value)
              : "N/A",
          trend: dynamicKpis.csat_score?.trend || "",
        },
        {
          label: dynamicKpis.resolved_today?.label || "Resolved Today",
          value:
            dynamicKpis.resolved_today?.value !== undefined
              ? String(dynamicKpis.resolved_today.value)
              : "0",
          trend: dynamicKpis.resolved_today?.trend || "",
        },
      ];

      let yPos = 58;
      let xPos = 15;
      const cardWidth = (pageWidth - 40) / 2;
      const cardHeight = 25;

      const getTrendColor = (label: string, trend: string) => {
        if (!trend) return [107, 114, 128]; // gray-500

        const isNegative = trend.startsWith("-");
        const isPositive = trend.startsWith("+");

        if ((label || "").toLowerCase().includes("resolution")) {
          if (isNegative) return [34, 197, 94]; // Green
          if (isPositive) return [239, 68, 68]; // Red
        } else {
          if (isPositive) return [34, 197, 94]; // Green
          if (isNegative) return [239, 68, 68]; // Red
        }

        const lowerTrend = (trend || "").toLowerCase();
        if (
          lowerTrend === "excellent" ||
          lowerTrend === "on target"
        ) {
          return [34, 197, 94]; // Green
        }

        return [107, 114, 128]; // gray-500
      };

      kpis.forEach((kpi, index) => {
        // Draw Card border
        doc.setDrawColor(243, 244, 246);
        doc.setFillColor(252, 253, 255);
        doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "FD");

        // Label
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(156, 163, 175);
        doc.text(kpi.label, xPos + 5, yPos + 8);

        // Value
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 24, 39);
        doc.text(kpi.value, xPos + 5, yPos + 18);

        // Trend (Dynamically colored text)
        doc.setFontSize(8);
        const rgb = getTrendColor(kpi.label, kpi.trend);
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        doc.text(kpi.trend, xPos + cardWidth - 25, yPos + 18);

        // Layout logic
        if ((index + 1) % 2 === 0) {
          yPos += cardHeight + 5;
          xPos = 15;
        } else {
          xPos = 15 + cardWidth + 10;
        }
      });

      // -- DATA TABLE SECTION --
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text("Inquiry Distribution Breakdown", 15, yPos);

      const head = ["Category", "Volume", "Percentage"];
      const totalVolume =
        data.category_distribution?.reduce(
          (acc: number, curr: any) => acc + (curr.value || 0),
          0,
        ) || 1;
      const body =
        data.category_distribution && data.category_distribution.length > 0
          ? data.category_distribution.map((cat: any) => {
              const name = cat.name || "General";
              const val = cat.value !== undefined ? String(cat.value) : "0";
              const percentage =
                totalVolume > 0
                  ? `${((cat.value / totalVolume) * 100).toFixed(1)}%`
                  : "0%";
              return [name, val, percentage];
            })
          : [["No category data", "0", "0%"]];

      yPos += 10;
      // Header row
      doc.setFillColor(243, 244, 246);
      doc.rect(15, yPos, pageWidth - 30, 10, "F");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);

      const colOffsets = [20, 100, 160];

      head.forEach((h, i) => {
        doc.text(h, colOffsets[i], yPos + 7);
      });

      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);

      body.forEach((row: string[]) => {
        row.forEach((cell: string, cellIndex: number) => {
          doc.text(cell, colOffsets[cellIndex], yPos + 8);
        });
        yPos += 10;
        doc.setDrawColor(249, 250, 251);
        doc.line(15, yPos, pageWidth - 15, yPos);
      });

      // -- FOOTER --
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        "© 2024 Illogre Inc. | Confidential Intelligence Report",
        15,
        285,
      );
      doc.text("Page 1 of 1", pageWidth - 30, 285);

      doc.save(`Illogre_Report_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error("PDF Fail", e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400 print:p-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Track performance and insights across all support operations
          </p>
        </div>
        {!isLoading && (
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Select
              value={range}
              onValueChange={(value) => setRange(value ?? "7days")}
            >
              <SelectTrigger className="w-36 h-10!  rounded-full bg-white border-gray-100 text-sm">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExportingCSV || !data}
              className="h-10! px-6 bg-white border-gray-100 text-gray-700 hover:bg-gray-50 transition-all"
            >
              {isExportingCSV ? "Generating..." : "Export CSV"}
              <Download className="size-4" />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExportingPDF || !data}
              className="h-10! px-6 bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
            >
              {isExportingPDF ? "Preparing..." : "Export PDF"}
              <Download className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 gap-2">
          <Spinner className="size-6" /> Loading analytics
        </div>
      ) : data ? (
        <>
          {/* Top Cards Section */}
          <AnalyticsCards data={data.kpis} />

          {/* Middle Row Charts: Volume & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-12 xl:col-span-8 flex flex-col h-full">
              <TicketVolumeChart data={data.ticket_volume} />
            </div>
            <div className="lg:col-span-12 xl:col-span-4 flex flex-col h-full">
              <CategoryDistribution data={data.category_distribution} />
            </div>
          </div>

          {/* Bottom Row Charts: Accuracy & Resolution Time */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-12 xl:col-span-7 flex flex-col h-full">
              <AccuracyTrendChart data={data.accuracy_trend} />
            </div>
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col h-full">
              <ResolutionComparison data={data.resolution_comparison} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64 text-red-500">
          Failed to load analytics data.
        </div>
      )}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          aside,
          nav,
          header,
          .print\\:hidden,
          button {
            display: none !important;
          }
          .animate-in {
            animation: none !important;
          }
          .grid {
            gap: 1.5rem !important;
          }
          .rounded-3xl {
            border-radius: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
