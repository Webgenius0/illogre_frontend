"use client";

import React, { useRef, useEffect, useState } from "react";
import { Bot, Paperclip, FileText, Send, User, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Message = {
  id: string;
  sender: string;
  role: "user" | "ai" | "agent";
  text: string;
  time: string;
  isInternal?: boolean;
  isInitial?: boolean;
  subject?: string;
};

interface TicketChatProps {
  messages: Message[];
  replyText: string;
  setReplyText: (text: string) => void;
  replyMode: "public" | "internal";
  setReplyMode: (mode: "public" | "internal") => void;
  onSendReply: () => void;
  isSending?: boolean;
}

/**
 * Separates the primary message body from email reply quotes / headers.
 */
export function parseEmailMessage(input: string): { cleanBody: string; quotedText: string | null } {
  if (!input) return { cleanBody: "", quotedText: null };

  // 1. Check for HTML quote containers (e.g. gmail_quote, blockquote)
  const htmlQuoteMatch = input.match(/(<div[^>]*class=["'](?:gmail_quote|yahoo_quoted)["'][^>]*>[\s\S]*|<blockquote[\s\S]*<\/blockquote>)/i);
  if (htmlQuoteMatch && htmlQuoteMatch.index !== undefined && htmlQuoteMatch.index > 0) {
    const cleanBody = input.slice(0, htmlQuoteMatch.index).trim();
    const quotedText = input.slice(htmlQuoteMatch.index).trim();
    if (cleanBody) {
      return { cleanBody, quotedText };
    }
  }

  // 2. Check for text header patterns like "On ... wrote:", "From: ...", "-----Original Message-----", etc.
  const headerPatterns = [
    /(?:\r?\n|^)(?:\s*>*\s*)*On\s+[\s\S]+?\s+wrote:\s*/i,
    /(?:\r?\n|^)(?:\s*>*\s*)*From:\s+[^\n]+(?:\r?\nTo:\s+[^\n]+)?/i,
    /(?:\r?\n|^)(?:\s*>*\s*)*-{3,}\s*(?:Original|Forwarded) Message\s*-{3,}/i,
  ];

  for (const pattern of headerPatterns) {
    const match = input.match(pattern);
    if (match && match.index !== undefined && match.index > 0) {
      const cleanBody = input.slice(0, match.index).trim();
      const quotedText = input.slice(match.index).trim();
      if (cleanBody) {
        return { cleanBody, quotedText };
      }
    }
  }

  // 3. Check for blockquotes starting with >
  const blockquoteMatch = input.match(/(?:\r?\n)+(?:\s*>+[^\n]*)+$/);
  if (blockquoteMatch && blockquoteMatch.index !== undefined && blockquoteMatch.index > 0) {
    const cleanBody = input.slice(0, blockquoteMatch.index).trim();
    const quotedText = input.slice(blockquoteMatch.index).trim();
    if (cleanBody) {
      return { cleanBody, quotedText };
    }
  }

  return { cleanBody: input, quotedText: null };
}

function ExpandableMessageContent({
  text,
  isHtml = false,
  subject,
}: {
  text: string;
  isHtml?: boolean;
  subject?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);

  const { cleanBody } = parseEmailMessage(text);

  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > 160) {
        setShouldShowToggle(true);
      } else {
        setShouldShowToggle(false);
      }
    }
  }, [cleanBody]);

  const hasHtmlTags = isHtml || /<[a-z][\s\S]*>/i.test(cleanBody);

  return (
    <div className="relative w-full">
      <div
        ref={contentRef}
        className={`transition-all duration-200 ${
          !isExpanded && shouldShowToggle
            ? "max-h-[150px] overflow-hidden"
            : ""
        }`}
      >
        {subject && (
          <span className="text-sm font-semibold text-gray-900 block mb-2">
            {subject}
          </span>
        )}
        {hasHtmlTags ? (
          <div
            className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none break-words [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all"
            dangerouslySetInnerHTML={{ __html: cleanBody }}
          />
        ) : (
          <p className="text-[13px] text-gray-800 font-medium leading-relaxed whitespace-pre-wrap break-words">
            {cleanBody}
          </p>
        )}
      </div>

      {shouldShowToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none inline-flex items-center gap-1 cursor-pointer"
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

export function TicketChat({
  messages,
  replyText,
  setReplyText,
  replyMode,
  setReplyMode,
  onSendReply,
  isSending = false,
}: TicketChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAttachment = () => {
    alert("Attachment dialog opened");
  };

  const handleTemplateSelect = (type: string) => {
    let templateHtml = "";
    if (type === "greeting") {
      templateHtml =
        "<p>Hi there,</p><p>Thank you for reaching out to us. How can we assist you today?</p><p>Best regards,<br/>Support Team</p>";
    } else if (type === "apology") {
      templateHtml =
        "<p>Dear customer,</p><p>We sincerely apologize for the inconvenience this has caused you. We are looking into this right away.</p><p>Best regards,<br/>Support Team</p>";
    } else if (type === "tracking") {
      templateHtml =
        "<p>Hi,</p><p>Your order is currently in transit. You can track it here: [Insert Link]. It should arrive soon.</p><p>Best regards,<br/>Support Team</p>";
    }

    setReplyText(
      replyText ? replyText + "<p></p>" + templateHtml : templateHtml,
    );
  };

  return (
    <div className="bg-white rounded-2xl py-6 flex flex-col h-[calc(100vh-200px)] sticky top-0 left-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 px-6 custom-scrollbar"
      >
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="w-full flex justify-start">
                <div className="flex flex-col items-start gap-1 max-w-[85%] text-wrap overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700 shadow-xs shrink-0">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-900 text-xs">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                      Customer
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{msg.time}</span>
                  </div>
                  {msg.isInitial ? (
                    <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl rounded-tl-sm p-4.5 flex flex-col gap-2 shadow-xs w-full">
                      <ExpandableMessageContent
                        subject={msg.subject}
                        text={msg.text}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#F8FAFC] border border-slate-200/90 shadow-xs rounded-2xl rounded-tl-sm p-4 text-[13px] text-slate-800 leading-relaxed w-full">
                      <ExpandableMessageContent
                        text={msg.text}
                        isHtml={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (msg.role === "ai" || msg.role === "agent") {
            const isInternal = msg.isInternal;
            const isAi = msg.role === "ai";

            return (
              <div key={msg.id} className="w-full flex justify-end">
                <div className="flex flex-col items-end gap-1 max-w-[85%] text-wrap overflow-hidden">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-[11px] text-gray-400 font-medium">{msg.time}</span>
                    {isInternal ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                        INTERNAL NOTE
                      </span>
                    ) : isAi ? (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                        AI AGENT
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        AGENT
                      </span>
                    )}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-xs shrink-0 ${
                        isInternal
                          ? "bg-amber-500 text-white"
                          : isAi
                          ? "bg-indigo-600 text-white"
                          : "bg-[#162943] text-white font-bold text-xs"
                      }`}
                    >
                      {isAi ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-full text-wrap rounded-2xl rounded-tr-sm p-4 text-[13px] leading-relaxed shadow-sm ${
                      isInternal
                        ? "bg-[#FFFBEB] border border-[#FEF3C7] text-[#92400E] [&_p]:text-[#92400E] [&_div]:text-[#92400E] [&_span]:text-[#92400E]"
                        : isAi
                        ? "bg-[#F0F9FF] border border-blue-200 text-[#0C4A6E] [&_p]:text-[#0C4A6E] [&_div]:text-[#0C4A6E] [&_span]:text-[#0C4A6E]"
                        : "bg-[#162943] text-white border border-[#162943] [&_p]:text-white [&_div]:text-white [&_span]:text-white [&_a]:text-blue-200"
                    }`}
                  >
                    <ExpandableMessageContent
                      text={msg.text}
                      isHtml={true}
                    />
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Input Area */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3 px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReplyMode("public")}
            className={`${replyMode === "public" ? "bg-green-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"} text-xs font-medium px-3 py-1.5 rounded-full transition-colors`}
          >
            Public Reply
          </button>
          <button
            onClick={() => setReplyMode("internal")}
            className={`${replyMode === "internal" ? "bg-amber-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"} text-xs font-medium px-3 py-1.5 rounded-full transition-colors`}
          >
            Internal Note
          </button>
        </div>

        <div
          className={`border rounded-xl flex flex-col pt-3 pb-2 px-3 transition-all ${
            replyMode === "internal"
              ? "bg-amber-50/30 border-amber-200 focus-within:ring-1 focus-within:ring-amber-400 focus-within:border-amber-400"
              : "bg-gray-50/50 border-gray-200 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary"
          }`}
        >
          <div className="flex-1 w-full bg-transparent">
            <TiptapEditor
              value={replyText}
              onChange={setReplyText}
              className="flex flex-col bg-transparent"
              editorClassName="!p-0 !min-h-[80px]"
            />
          </div>
          <div className="flex items-center justify-between mt-2 pt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handleAttachment}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-medium mr-1"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-medium focus:outline-none">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Template</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50"
                >
                  <DropdownMenuItem
                    onClick={() => handleTemplateSelect("greeting")}
                    className="cursor-pointer rounded-lg text-sm px-3 py-2 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900 outline-none transition-colors"
                  >
                    Greeting & Help
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTemplateSelect("apology")}
                    className="cursor-pointer rounded-lg text-sm px-3 py-2 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900 outline-none transition-colors"
                  >
                    Apology & Investigation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTemplateSelect("tracking")}
                    className="cursor-pointer rounded-lg text-sm px-3 py-2 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900 outline-none transition-colors"
                  >
                    Order Tracking Info
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              onClick={onSendReply}
              disabled={
                isSending || !replyText.replace(/<[^>]*>?/gm, "").trim()
              }
              className={`${replyMode === "public" ? "bg-primary hover:bg-[#b8d641] text-gray-900" : "bg-amber-500 hover:bg-amber-600 text-white"} font-medium text-sm px-5 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50`}
            >
              <Send className="w-4 h-4" />
              {isSending
                ? "Sending..."
                : replyMode === "public"
                  ? "Send Reply"
                  : "Add Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
