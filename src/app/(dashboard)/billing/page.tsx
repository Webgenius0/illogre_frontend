"use client";

import { useState } from "react";
import UsageCard from "@/components/billing/UsageCard";
import PlanCard from "@/components/billing/PlanCard";
import BillingHistory from "@/components/billing/BillingHistory";
import { useBillingOverview } from "@/hooks/billing.api";
import { usePricingPlans } from "@/hooks/pricing.api";
import { PricingCardSkeleton } from "@/app/auth/register/plans/page";
import ActiveSubscriptionCard from "@/components/billing/ActiveSubscriptionCard";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const { data: billingRes, isLoading: isBillingLoading } =
    useBillingOverview();
  const { data, isPending } = usePricingPlans();
  const pricings = data?.data || [];
  const filteredPricings = pricings.filter(
    (plan: any) => plan.billing_period === billingCycle,
  );

  const billingData = billingRes?.data || {};
  const usageOverview = billingData?.usage_overview;
  const currentPlan = billingData?.current_plan;
  const billingHistory = billingData?.billing_history || [];

  const usageStats = [
    {
      label: "Tickets Used",
      count: `${usageOverview?.tickets_used?.current || 0}`,
      total: `${usageOverview?.tickets_used?.total || 500}`,
      percentage: usageOverview?.tickets_used?.percentage || 0,
      barColor: "bg-[#7C3AED]",
      textColor: "text-[#7C3AED]",
    },
    {
      label: "Team Members",
      count: `${usageOverview?.team_members?.current || 0}`,
      total: `${usageOverview?.team_members?.total || 2}`,
      percentage: usageOverview?.team_members?.percentage || 0,
      barColor: "bg-[#10B981]",
      textColor: "text-[#10B981]",
    },
    {
      label: "AI Actions",
      count: `${usageOverview?.ai_actions?.current || 0}`,
      total: `${usageOverview?.ai_actions?.total || 1000}`,
      percentage: usageOverview?.ai_actions?.percentage || 0,
      barColor: "bg-[#F59E0B]",
      textColor: "text-[#F59E0B]",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-4">
      {/* Compact Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Billing & Subscription
          </h1>
          <p className="text-gray-400 font-medium text-xs mt-0.5">
            Manage your active plan, auto-renewal settings, and billing history.
          </p>
        </div>
      </div>

      {/* Usage Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {usageStats.map((stat, i) => (
          <UsageCard key={i} {...stat} />
        ))}
      </div>

      {/* Active Subscription Status & Auto-Renewal Card */}
      <ActiveSubscriptionCard
        currentPlan={currentPlan}
        isLoading={isBillingLoading}
      />

      {/* Combined Control Toolbar & Content */}
      <div className="space-y-4 pt-1">
        {/* Navigation Tabs + Billing Cycle Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-1.5 rounded-xl border border-gray-100">
          {/* Tabs */}
          <div className="inline-flex p-1 bg-gray-100/70 rounded-lg relative overflow-hidden">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-6 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeTab === "plans"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Billing History
            </button>
          </div>

          {/* Billing Cycle Switcher (Only when viewing plans) */}
          {activeTab === "plans" && (
            <div className="inline-flex items-center gap-1 bg-gray-100/70 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-[#B2E08A] text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-[#B2E08A] text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Annual
                <span className="bg-gray-900 text-[#B2E08A] text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                  Save 20%
                </span>
              </button>
            </div>
          )}
        </div>

        {activeTab === "plans" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-6 w-full">
              {isPending ? (
                [...Array(3)].map((_, index) => (
                  <PricingCardSkeleton key={index} />
                ))
              ) : filteredPricings?.length > 0 ? (
                filteredPricings?.map((plan: any, i: number) => (
                  <PlanCard
                    key={`${billingCycle}-${plan.id}`}
                    index={i}
                    {...plan}
                    btntext="Upgrade Plan"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                  No pricing plans available at the moment.
                </div>
              )}
            </div>
          </div>
        ) : (
          <BillingHistory
            isPending={isBillingLoading}
            invoices={billingHistory}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
}
