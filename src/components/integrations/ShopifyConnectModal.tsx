"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnectShopify } from "@/hooks/owner.api";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface ShopifyConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ShopifyConnectModal({
  open,
  onOpenChange,
  onSuccess,
}: ShopifyConnectModalProps) {
  const [shop, setShop] = useState("");
  const [status, setStatus] = useState<"form" | "connecting" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: connectShopify, isPending } = useConnectShopify();

  useEffect(() => {
    if (open) {
      setShop("");
      setStatus("form");
      setErrorMessage("");
    }
  }, [open]);

  const handleConnect = () => {
    if (!shop.trim()) {
      toast.error("Please enter your Shopify store URL");
      return;
    }

    const formattedShop = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");

    setStatus("connecting");

    connectShopify(
      { shop: formattedShop },
      {
        onSuccess: (data) => {
          if (data?.url) {
            // Keep status screen active until browser navigates away to Shopify
            window.location.href = data?.url;
          } else {
            toast.success("Shopify store connected successfully!");
            setStatus("success");
            onSuccess?.();
          }
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message || "Failed to connect Shopify store";
          toast.error(msg);
          setErrorMessage(msg);
          setStatus("error");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && status === "connecting") return;
        if (!isOpen) {
          setTimeout(() => setStatus("form"), 200);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent
        className={
          status === "form"
            ? "sm:max-w-[425px]"
            : "sm:max-w-md p-8 sm:p-12 rounded-2xl gap-0 border-none text-center bg-white"
        }
      >
        {status === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Shopify</DialogTitle>
              <DialogDescription>
                Enter your Shopify store URL to connect your store.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="shop" className="text-sm font-medium">
                  Shop Name / URL
                </label>
                <Input
                  id="shop"
                  placeholder="e.g. mystore.myshopify.com"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isPending || !shop.trim()}
                className="text-foreground cursor-pointer"
              >
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                Connect
              </Button>
            </DialogFooter>
          </>
        )}

        {status === "connecting" && (
          <div className="flex flex-col items-center py-6 text-center animate-in fade-in duration-150">
            <div className="size-20 rounded-full border border-blue-500/20 flex items-center justify-center bg-blue-50 relative mb-4 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
              <Loader2 className="text-[#162943] w-10 h-10 animate-spin stroke-[2.5px]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Connecting Shopify Store...
            </h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">
              Redirecting to Shopify for authorization. Please wait a moment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-full border border-primary/20 flex items-center justify-center bg-gray-50 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/30 shadow-lg">
                  <Check className="text-secondary w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Shopify Store Connected!
            </h2>
            <p className="text-[#6B6B6B] text-base mb-8 font-medium">
              Your Shopify store is now successfully connected to Tixolve.
            </p>
            <Button
              onClick={() => {
                setStatus("form");
                onOpenChange(false);
              }}
              className="w-full h-12 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-black font-semibold text-base rounded-lg transition-all duration-300 cursor-pointer"
            >
              Continue
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-full border border-red-500/20 flex items-center justify-center bg-gray-50 relative shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-white/30 shadow-lg">
                  <X className="text-red-500 w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Connection Failed
            </h2>
            <p className="text-[#6B6B6B] text-base mb-8 font-medium">
              {errorMessage}
            </p>
            <Button
              onClick={() => setStatus("form")}
              variant="outline"
              className="w-full h-12 font-semibold text-base rounded-lg transition-all duration-300 cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
