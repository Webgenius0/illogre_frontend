"use client";

import React from "react";
import { QuickSetupConfig } from "@/components/automation/QuickSetupConfig";

export default function AutomationPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">AI Automation</h1>
          <p className="text-sm text-muted-foreground">
            Configure automated responses and actions
          </p>
        </div>
      </div>

      <div className="space-y-6 mt-8">
        <QuickSetupConfig />
      </div>
    </div>
  );
}
