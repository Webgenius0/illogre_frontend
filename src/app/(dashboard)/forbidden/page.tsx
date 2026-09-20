"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
      <div className="max-w-sm w-full bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-lg text-center space-y-4 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -z-10" />

        {/* Icon & Badge */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-md shadow-amber-500/10 transition-transform duration-300 hover:scale-105">
            <ShieldAlert size={22} />
          </div>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            Permission Required (403)
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 leading-relaxed">
            You don’t have permission to access or manage this workspace resource. If you believe this is an error, please contact your team owner.
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
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
