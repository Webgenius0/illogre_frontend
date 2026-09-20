"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTicketDetails, useSendTicketReply, useAddInternalNote } from "@/hooks/tickets.api";
import { TicketHeader } from "@/components/ticket/TicketHeader";
import { TicketChat, Message } from "@/components/ticket/TicketChat";
import { TicketAIAnalysis } from "@/components/ticket/TicketAIAnalysis";
import { TicketCustomerInfo } from "@/components/ticket/TicketCustomerInfo";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { data: response, isLoading, refetch } = useTicketDetails(id as string);
  const ticketData = response?.data;
  const ticket = ticketData?.ticket;

  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState<string>("");
  const [replyMode, setReplyMode] = useState<"public" | "internal">("public");

  useEffect(() => {
    if (ticket) {
      let mapped: Message[] = [];
      if (ticket.messages && ticket.messages.length > 0) {
        mapped = ticket.messages.map((msg: any, i: number) => {
          let role: "user" | "ai" | "agent" = "user";
          const senderType = (msg.sender_type || "").toLowerCase();

          if (msg.is_ai || senderType === "ai") {
            role = "ai";
          } else if (msg.is_internal || senderType === "agent" || senderType === "admin" || senderType === "owner") {
            role = "agent";
          } else if (senderType === "customer" || senderType === "user") {
            role = "user";
          } else {
            const customerEmail = ticket?.customer_email || ticket?.customer?.email;
            const customerName = ticket?.customer_name || ticket?.customer?.name;
            const msgSenderName = msg.sender_name || msg.sender;
            const msgSenderEmail = msg.sender_email;

            if (
              (customerEmail && msgSenderEmail && msgSenderEmail.toLowerCase() === customerEmail.toLowerCase()) ||
              (customerName && msgSenderName && msgSenderName.toLowerCase() === customerName.toLowerCase())
            ) {
              role = "user";
            } else {
              role = "agent";
            }
          }

          const senderDisplayName =
            msg.sender_name ||
            msg.sender ||
            (role === "user"
              ? (ticket.customer_name || ticket.customer?.name || "Customer")
              : "Agent");

          const formattedTime = msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : (msg.time || "Recently");

          return {
            id: (msg.id || i + 1).toString(),
            sender: senderDisplayName,
            role: role,
            text: msg.body || msg.text || "",
            time: formattedTime,
            isInternal: Boolean(msg.is_internal),
            isInitial: i === 0,
            subject: i === 0 ? ticket.subject : undefined,
          };
        });
        setMessages(mapped);
      } else {
        const initialMessage: Message = {
          id: "initial-0",
          sender: ticket.customer_name || ticket.customer?.name || "Customer",
          role: "user",
          text: ticket.body || "No message content",
          time: ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          isInitial: true,
          subject: ticket.subject || "No Subject",
        };
        setMessages([initialMessage]);
      }
    }
  }, [ticket]);

  const { mutateAsync: sendReply } = useSendTicketReply(id as string);
  const { mutateAsync: addInternalNote } = useAddInternalNote(id as string);
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    // Tiptap might leave empty tags
    const plainText = replyText.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) return;

    setIsSending(true);
    try {
      if (replyMode === "internal") {
        await addInternalNote({
          note: replyText,
          reply_text: replyText,
        });
      } else {
        await sendReply({
          reply_text: replyText,
          is_internal: false,
        });
      }

      setReplyText("");
      refetch();
    } catch (error) {
      console.error("Failed to send reply or internal note", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleApproveSuggested = (text: string) => {
    setReplyMode("public");
    setReplyText(text);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#EEEEEE] gap-2">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Loading ticket details...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#EEEEEE] gap-4">
        <span className="text-lg font-semibold text-gray-700">Ticket not found</span>
        <Link href="/tickets">
          <Button variant="outline">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 min-h-screen bg-[#EEEEEE] animate-in fade-in slide-in-from-bottom-3 duration-400">
      <TicketHeader ticket={ticket} />

      <div className="flex-1 lg:h-[calc(100vh-80px)] flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Panel: Chat Interface */}
          <div className="lg:col-span-5 flex flex-col min-h-0 pb-6 lg:pb-0 h-150 lg:h-full">
            <TicketChat
              messages={messages}
              replyText={replyText}
              setReplyText={setReplyText}
              replyMode={replyMode}
              setReplyMode={setReplyMode}
              onSendReply={handleSendReply}
              isSending={isSending}
            />
          </div>

          {/* Middle Panel: AI Analysis & Actions */}
          <div className="lg:col-span-4 self-start flex flex-col min-h-0 h-auto bg-white p-5 rounded-2xl overflow-auto border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <TicketAIAnalysis
              onApproveSuggested={handleApproveSuggested}
              aiAnalysis={ticket.ai_analysis}
              confidence={ticket.confidence}
            />
          </div>

          {/* Right Panel: Customer Context */}
          <div className="lg:col-span-3 flex flex-col min-h-0 h-150 lg:h-screen sticky top-0 right-0 z-40">
            <TicketCustomerInfo
              customer={ticket.customer}
              orders={ticket.orders}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
