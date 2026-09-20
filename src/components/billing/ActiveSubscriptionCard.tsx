"use client";

import { CreditCard, RefreshCw, ExternalLink, ShieldCheck, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCancelSubscription, useResumeSubscription, useBillingPortal } from "@/hooks/billing.api";
import { Spinner } from "@/components/ui/spinner";

interface ActiveSubscriptionCardProps {
  currentPlan?: {
    is_active?: boolean;
    name?: string;
    price?: string;
    description?: string;
    auto_renew?: boolean;
    on_grace_period?: boolean;
    ends_at?: string | null;
    next_payment_date?: string | null;
    next_payment_amount?: string | null;
    payment_method?: {
      brand?: string;
      last4?: string;
      exp_month?: number | null;
      exp_year?: number | null;
    } | null;
  };
  isLoading?: boolean;
}

export default function ActiveSubscriptionCard({
  currentPlan,
  isLoading = false,
}: ActiveSubscriptionCardProps) {
  const cancelMutation = useCancelSubscription();
  const resumeMutation = useResumeSubscription();
  const portalMutation = useBillingPortal();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const isActive = currentPlan?.is_active;
  const autoRenew = currentPlan?.auto_renew;
  const onGracePeriod = currentPlan?.on_grace_period;
  const endsAt = currentPlan?.ends_at;
  const nextPaymentDate = currentPlan?.next_payment_date || endsAt;
  const nextPaymentAmount = currentPlan?.next_payment_amount || currentPlan?.price;
  const card = currentPlan?.payment_method;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100/80 shadow-xs space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#B2E08A]/10 blur-[90px] -z-10 rounded-full" />

      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
            {isActive ? (
              onGracePeriod ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-3 py-1 rounded-full font-medium">
                  Cancels Soon
                </Badge>
              ) : (
                <Badge className="bg-[#10B981]/15 text-[#10B981] border-none text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  Active
                </Badge>
              )
            ) : (
              <Badge className="bg-gray-100 text-gray-600 border-none text-xs px-3 py-1 rounded-full font-medium">
                Free / Inactive
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isActive
              ? currentPlan?.description || "Your subscription is active and managed via Stripe."
              : "Choose a pricing plan below to activate full features."}
          </p>
        </div>

        {isActive && (
          <Button
            variant="outline"
            onClick={() => portalMutation.mutate({})}
            disabled={portalMutation.isPending}
            className="rounded-full text-xs font-semibold px-4 py-2 flex items-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 shrink-0"
          >
            {portalMutation.isPending ? <Spinner /> : <ExternalLink size={14} />}
            Manage Stripe Portal
          </Button>
        )}
      </div>

      {isActive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Active Plan Details */}
          <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500">
                Current Plan
              </span>
              <div className="text-lg font-extrabold text-gray-900 mt-1">{currentPlan?.name}</div>
            </div>
            <div className="text-sm font-semibold text-[#12A150] pt-1">{currentPlan?.price}</div>
          </div>

          {/* Next Payment Date / Net Payment */}
          <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-500" />
                Next Payment Date
              </span>
              <div className="text-lg font-extrabold text-gray-900 mt-1">
                {nextPaymentDate || "N/A"}
              </div>
            </div>
            <div className="text-xs text-gray-500 pt-1">
              {onGracePeriod ? (
                <span className="text-amber-600 font-medium">Access ends on {nextPaymentDate}</span>
              ) : autoRenew ? (
                <span>Next payment: <strong className="text-gray-800">{nextPaymentAmount}</strong></span>
              ) : (
                <span>No upcoming charge</span>
              )}
            </div>
          </div>

          {/* Saved Payment Method */}
          <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <CreditCard size={13} className="text-emerald-500" />
                Saved Payment Card
              </span>
              {card ? (
                <div className="text-base font-bold text-gray-900 flex items-center gap-2 mt-1">
                  <span>{card.brand || "Card"}</span>
                  <span className="text-xs font-normal text-gray-500">•••• {card.last4}</span>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-700 mt-1">Saved on Stripe</div>
              )}
            </div>
            <div className="text-xs text-gray-400 pt-1 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              {card ? "Auto-saved on checkout" : "Card secured by Stripe"}
            </div>
          </div>

          {/* Auto-Renewal Status & Controls */}
          <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <RefreshCw size={13} />
                Auto-Renewal Status
              </span>
              <div className="text-sm font-bold mt-1">
                {autoRenew ? (
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Auto-Renewal Enabled
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    Auto-Renewal Disabled
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              {onGracePeriod ? (
                <Button
                  size="sm"
                  onClick={() => resumeMutation.mutate({})}
                  disabled={resumeMutation.isPending}
                  className="w-full text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {resumeMutation.isPending ? <Spinner /> : "Resume Auto-Renewal"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => cancelMutation.mutate({})}
                  disabled={cancelMutation.isPending}
                  className="w-full text-xs font-semibold rounded-xl text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  {cancelMutation.isPending ? <Spinner /> : "Cancel Auto-Renewal"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
