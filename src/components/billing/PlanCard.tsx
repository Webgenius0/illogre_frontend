"use client";

import { Check, MoveRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { useCheckout } from "@/hooks/pricing.api";

interface PlanCardProps {
  name: string;
  price: string;
  id?: number;
  is_popular?: number;
  detailed_features?: string[];
  accentColor?: string;
  isPopular?: boolean;
  isPending?: boolean;
  btntext?: string;
  billing_period?: string;
  index?: number;
}

export default function PlanCard({
  name,
  price,
  is_popular,
  detailed_features,
  id,
  btntext = "Select This Plan",
  billing_period,
  index = 0,
}: PlanCardProps) {
  const user = useSelector((state: any) => state.auth.user);

  const checkoutMutation = useCheckout();

  const HandleCheckout = () => {
    checkoutMutation.mutate({ email: user?.email, pricing_plan_id: id });
  };

  return (
    <div
      className={`relative bg-white p-5 rounded-2xl border border-gray-100/90 flex flex-col justify-between gap-4 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {is_popular === 1 && (
        <div className="absolute top-3.5 right-3.5 animate-in fade-in zoom-in duration-300">
          <Badge className="bg-linear-to-r from-secondary to-primary text-gray-900 border-none px-3 py-1 rounded-full text-xs font-semibold gap-1">
            Popular
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            ${price}
          </span>
          <span className="text-gray-400 font-medium text-xs">
            {billing_period === "annual" ? "/ year" : "/ month"}
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {detailed_features?.map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 bg-[#54D62C] p-0.5 rounded-full shrink-0">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-gray-600 text-xs font-medium leading-tight">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={HandleCheckout}
        disabled={checkoutMutation?.isPending}
        className={`w-full h-9 px-4 text-xs rounded-full font-semibold bg-linear-to-r from-primary/90 to-secondary/60 text-foreground hover:opacity-95 transition-opacity mt-2`}
      >
        <span>{btntext}</span>
        {checkoutMutation?.isPending ? <Spinner /> : <MoveRight size={16} />}
      </Button>
    </div>
  );
}
