"use client";
import PlanCard from "@/components/billing/PlanCard";
import { usePricingPlans } from "@/hooks/pricing.api";
import { useState } from "react";

export const PricingCardSkeleton = () => {
  return (
    <div className="relative bg-white p-8 rounded-3xl border border-gray-100 flex flex-col gap-6 animate-pulse">
      {/* Title Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
      </div>

      {/* Price Skeleton */}
      <div className="flex items-baseline gap-2">
        <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>

      {/* Features List Skeleton */}
      <div className="flex-1 space-y-4 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Checkmark Circle */}
            <div className="mt-1 h-5 w-5 bg-gray-200 rounded-full shrink-0" />
            {/* Feature Text Line */}
            <div
              className={`h-4 bg-gray-100 rounded mt-0.5 ${i % 2 === 0 ? "w-full" : "w-5/6"}`}
            />
          </div>
        ))}
      </div>

      {/* Button Skeleton */}
      <div className="w-full h-12 bg-gray-200 rounded-full" />
    </div>
  );
};

export default function Page() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const { data, isPending } = usePricingPlans();
  const pricings = data?.data || [];
  const filteredPricings = pricings.filter(
    (plan: any) => plan.billing_period === billingCycle,
  );

  console.log(data);

  return (
    <div>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 px-10 pt-10">
        {/* Billing Cycle Selector */}
        <div className="flex flex-col items-center gap-6 py-4 relative">
          <h4 className="text-3xl font-semibold text-center">
            Subscription Plans
          </h4>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#B2E08A]/10 blur-[100px] -z-10 rounded-full" />

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-gray-100 relative overflow-hidden group">
            <div
              className={`absolute inset-0 bg-linear-to-r from-transparent via-[#B2E08A]/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000`}
            />
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${billingCycle === "monthly" ? "bg-[#B2E08A] text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${billingCycle === "annual" ? "bg-[#B2E08A] text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              Annual
              <span className="bg-gray-900 text-[#B2E08A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 max-w-375 w-full mx-auto">
          {isPending ? (
            [...Array(3)].map((_, index) => <PricingCardSkeleton key={index} />)
          ) : filteredPricings?.length > 0 ? (
            filteredPricings?.map((plan: any, i: number) => (
              <PlanCard
                key={`${billingCycle}-${plan.id}`}
                index={i}
                {...plan}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No pricing plans available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
