"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

interface ShopifyProcessingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function ShopifyProcessingModal({
  open,
  onOpenChange,
  onComplete,
}: ShopifyProcessingModalProps) {
  const [status, setStatus] = useState<"processing" | "success">("processing");

  useEffect(() => {
    if (open) {
      setStatus("processing");
      const timer = setTimeout(() => {
        setStatus("success");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8 rounded-2xl border-none text-center bg-white">
        {status === "processing" && (
          <div className="flex flex-col items-center py-4">
            <div className="size-20 rounded-full border border-blue-500/20 flex items-center justify-center bg-blue-50 relative mb-6">
              <Loader2 className="text-[#162943] w-10 h-10 animate-spin stroke-[2.5px]" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Connecting Shopify Store...
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
              Syncing customers, orders, and store settings. Please wait a moment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in duration-200">
            <div className="size-20 rounded-full border border-emerald-500/20 flex items-center justify-center bg-emerald-50 relative mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center border border-white/30 shadow-lg">
                <Check className="text-white w-8 h-8 stroke-[3px]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Shopify Store Connected!
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 max-w-xs">
              Your Shopify store is connected successfully and customer data is synced.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                onComplete?.();
              }}
              className="w-full h-11 bg-[#162943] hover:bg-black text-white font-semibold text-sm rounded-xl transition-all"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
