"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#B2E08A]/15 rounded-full blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <div className="max-w-sm w-full bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 text-center space-y-4 relative">
        {/* Icon & Badge */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gray-900 text-[#B2E08A] flex items-center justify-center shadow-md shadow-gray-900/10 transition-transform duration-300 hover:scale-105">
            <FileQuestion size={22} />
          </div>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#12A150]/10 text-[#12A150]">
            Error 404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border-gray-200 text-gray-700 font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={13} />
            Go Back
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Home size={13} className="text-[#B2E08A]" />
              Return Home
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-gray-400 pt-1">
          Need help? <Link href="/auth/login" className="text-gray-700 underline font-medium">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
