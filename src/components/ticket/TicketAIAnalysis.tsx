"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Check,
  Pencil,
  XCircle,
  RefreshCw,
  Ban,
  RotateCcw,
  Receipt,
  MapPin,
  CircleCheckBig,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface TicketAIAnalysisProps {
  onApproveSuggested: (text: string) => void;
  aiAnalysis?: {
    category: string;
    risk: string;
    tags: string[];
    reason: string;
    sources: string[];
    summary: string;
    suggested_reply: string;
  } | null;
  confidence?: number;
}

export function TicketAIAnalysis({
  onApproveSuggested,
  aiAnalysis,
  confidence = 96,
}: TicketAIAnalysisProps) {
  const [isRejected, setIsRejected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [suggestedText, setSuggestedText] = useState("");
  const [isReasonExpanded, setIsReasonExpanded] = useState(false);

  useEffect(() => {
    if (aiAnalysis?.suggested_reply) {
      let formatted = aiAnalysis.suggested_reply;
      // Convert plain text newlines to HTML paragraphs for proper layout
      if (!/<[a-z][\s\S]*>/i.test(formatted)) {
        formatted = formatted
          .split("\n\n")
          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("");
      }
      setSuggestedText(formatted);
    } else {
      setSuggestedText("");
    }
  }, [aiAnalysis?.suggested_reply]);

  const riskLevel = aiAnalysis?.risk || "LOW";
  const category = aiAnalysis?.category || "General";
  const reason = aiAnalysis?.reason || "No detailed analysis available.";
  const tags = aiAnalysis?.tags || [];
  const sources = aiAnalysis?.sources || [];
  const summary = aiAnalysis?.summary || "No automated summary available.";

  return (
    <div className="flex flex-col gap-6 h-auto overflow-y-auto pr-2 custom_scroll">
      {/* AI Analysis Block */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1 rounded-md">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-gray-900">AI Analysis</h2>
          </div>
          <Badge className="bg-[#eef8b8] text-gray-800 font-medium px-2 py-0.5 rounded-full text-xs shadow-none border-none">
            {confidence}% High Confidence
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Category</span>
            <span className="text-sm font-semibold text-gray-900">
              {category}
            </span>
          </div>
          <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Risk</span>
            <span className="text-sm font-semibold text-gray-900 uppercase">
              {riskLevel}
            </span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-gray-100/80 text-gray-700 font-normal shadow-none border border-gray-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2 mt-1">
          <span className="text-sm font-semibold text-gray-900">Reason</span>
          <p className="text-xs text-gray-700 font-medium leading-relaxed">
            {isReasonExpanded || reason.length <= 100
              ? reason
              : `${reason.substring(0, 100)}...`}
            {reason.length > 100 && (
              <button
                onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                className="text-blue-600 font-medium ml-1 hover:underline focus:outline-none"
              >
                {isReasonExpanded ? "See Less" : "See More"}
              </button>
            )}
          </p>
        </div>

        {sources.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-sm font-semibold text-gray-900">Sources</span>
            <div className="flex flex-wrap gap-2">
              {sources.map((src, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-indigo-50 text-indigo-700 border-none font-normal rounded-sm py-2 px-3 text-xs"
                >
                  {src}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 mt-1 border border-gray-100/50">
          <span className="text-sm font-semibold text-gray-900">
            AI Summary
          </span>
          <p className="text-xs text-gray-600 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Suggested Reply */}
      {!isRejected && suggestedText && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">
              Suggested Reply
            </h3>
            <span className="text-xs text-gray-400 font-medium">Click to edit directly</span>
          </div>
          <TiptapEditor
            value={suggestedText}
            onChange={setSuggestedText}
            readOnly={false}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApproveSuggested(suggestedText)}
              className="bg-primary hover:bg-[#b8d641] text-gray-900 font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors flex-1 justify-center cursor-pointer"
            >
              <CircleCheckBig className="size-4" />
              Approve & Use
            </button>
            <button
              onClick={() => setIsRejected(true)}
              className="bg-white border border-gray-200 hover:bg-red-50 text-red-600 font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4 opacity-70" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {/* 
      <div className="flex flex-col gap-3 mt-2 pb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Quick Actions</h3>

        <button className="flex items-center gap-3 w-full bg-[#f8fbff] hover:bg-[#eff6ff] border border-[#dbeafe] p-3 rounded-lg text-left transition-colors group cursor-pointer">
          <div className="p-1.5 bg-blue-100/50 rounded-md text-blue-600 group-hover:bg-blue-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-600">
              Resend Tracking Email
            </span>
            <span className="text-xs text-blue-500/80">
              Resend shipment tracking to customer
            </span>
          </div>
        </button>

        <button className="flex items-center gap-3 w-full bg-[#fffcfc] hover:bg-[#fef2f2] border border-[#fecaca] p-3 rounded-lg text-left transition-colors group cursor-pointer">
          <div className="p-1.5 bg-red-100/50 rounded-md text-red-600 group-hover:bg-red-100 transition-colors">
            <Ban className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-red-600">
              Cancel Order
            </span>
            <span className="text-xs text-red-500/80">
              Cancel and initiate refund
            </span>
          </div>
        </button>

        <button className="flex items-center gap-3 w-full bg-[#fffbf5] hover:bg-[#fff7ed] border border-[#fed7aa] p-3 rounded-lg text-left transition-colors group cursor-pointer">
          <div className="p-1.5 bg-orange-100/50 rounded-md text-orange-500 group-hover:bg-orange-100 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-orange-500">
              Start Refund
            </span>
            <span className="text-xs text-orange-500/80">
              Process partial or full refund
            </span>
          </div>
        </button>

        <button className="flex items-center gap-3 w-full bg-[#f8fcf8] hover:bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-lg text-left transition-colors group cursor-pointer">
          <div className="p-1.5 bg-green-100/50 rounded-md text-green-600 group-hover:bg-green-100 transition-colors">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-600">
              Return Instructions
            </span>
            <span className="text-xs text-green-500/80">
              Send return shipping label
            </span>
          </div>
        </button>

        <button className="flex items-center gap-3 w-full bg-[#f4faff] hover:bg-[#e0f2fe] border border-[#bae6fd] p-3 rounded-lg text-left transition-colors group cursor-pointer">
          <div className="p-1.5 bg-sky-100/50 rounded-md text-sky-600 group-hover:bg-sky-100 transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sky-600">
              Update Address
            </span>
            <span className="text-xs text-sky-500/80">
              Modify shipping destination
            </span>
          </div>
        </button>
      </div>
      */}
    </div>
  );
}
