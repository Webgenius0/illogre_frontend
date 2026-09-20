"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <div className="max-w-sm w-full bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 text-center space-y-4 relative">
        {/* Icon & Badge */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-md shadow-red-500/10 transition-transform duration-300 hover:scale-105">
            <AlertTriangle size={22} />
          </div>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
            System Notice
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Something went wrong!
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 leading-relaxed">
            An unexpected error occurred while processing your request. Please try reloading the page or return to the dashboard.
          </p>
        </div>

        {/* Error message detail if present */}
        {error?.message && (
          <div className="p-2.5 bg-red-50/70 rounded-xl border border-red-100 text-[11px] font-mono text-red-600 max-h-20 overflow-y-auto text-left leading-tight">
            {error.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw size={13} className="text-[#B2E08A]" />
            Try Again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto px-4 py-2 rounded-xl border-gray-200 text-gray-700 font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-all"
            >
              <Home size={13} />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
