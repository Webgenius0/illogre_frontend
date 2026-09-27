"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";
import { useAssignTicket, useUpdateTicketStatus } from "@/hooks/tickets.api";
import { useTeamOverview } from "@/hooks/team.api";

const statusStyles: Record<string, string> = {
  low: "bg-gray-500 text-white",
  medium: "bg-blue-600 text-white",
  high: "bg-[#f09a37] text-white",
  urgent: "bg-red-600 text-white",
};

interface TicketHeaderProps {
  ticket?: {
    id?: string | number;
    ticket_id: string;
    priority: string;
    status: string;
    sla?: string;
    assigned?: string | null;
    assigned_user_id?: number | null;
    assigned_user?: {
      id: number;
      name: string;
      email?: string;
    } | null;
  } | null;
  onStatusChange?: (newStatus: string) => void;
}

export function TicketHeader({ ticket, onStatusChange }: TicketHeaderProps) {
  const [status, setStatus] = useState<string>(ticket?.status || "Open");
  const [priority, setPriority] = useState<string>(
    ticket?.priority?.toLowerCase()?.trim() || "high"
  );

  const { mutateAsync: updateStatus } = useUpdateTicketStatus(
    ticket?.id as string
  );
  const { mutate: assignTicket } = useAssignTicket(ticket?.id as string);
  const { data: teamRes } = useTeamOverview();
  const teamMembers: any[] = teamRes?.data?.team || teamRes?.data?.agents || teamRes?.data || [];

  useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status);
    }
    if (ticket?.priority) {
      setPriority(ticket.priority.toLowerCase().trim());
    }
  }, [ticket?.status, ticket?.priority]);

  const handleStatusSelect = async (newStatus: string | null) => {
    if (!newStatus) return;
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    if (ticket?.id) {
      try {
        await updateStatus({ status: newStatus });
      } catch (err) {
        console.error("Failed to update status", err);
      }
    }
  };

  const handleAssigneeSelect = (value: string | null) => {
    if (!value || !ticket?.id) return;
    if (value === "ai_agent") {
      assignTicket({ assigned_user_id: null, assigned: "AI Agent" });
    } else if (value === "support_team") {
      assignTicket({ assigned_user_id: null, assigned: "Support Team" });
    } else {
      const selectedMember = teamMembers.find((m) => String(m.id) === value);
      assignTicket({
        assigned_user_id: Number(value),
        assigned: selectedMember?.name || "Agent",
      });
    }
  };

  const getStatusBadgeColor = (st: string) => {
    const s = st.toLowerCase();
    if (s === "closed") return "bg-gray-800 text-white border-gray-700/40";
    if (s === "resolved") return "bg-emerald-600 text-white border-emerald-500/40";
    if (s === "pending") return "bg-amber-500 text-white border-amber-400/40";
    return "bg-blue-600 text-white border-blue-500/40";
  };

  const currentAssigneeValue = ticket?.assigned_user_id
    ? String(ticket.assigned_user_id)
    : ticket?.assigned === "Support Team"
    ? "support_team"
    : "ai_agent";

  const currentAssigneeName =
    ticket?.assigned_user?.name || ticket?.assigned || "AI Agent";

  return (
    <div className="bg-linear-to-tr from-secondary to-primary px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/tickets"
          className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          Ticket #{ticket?.ticket_id || "Loading..."}
        </h1>

        {/* Interactive Status Select */}
        <Select value={status} onValueChange={handleStatusSelect}>
          <SelectTrigger
            className={`h-auto w-auto border px-3.5 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer font-semibold text-xs focus:ring-0 focus:ring-offset-0 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-white! [&>svg]:opacity-100 transition-all shadow-xs ${getStatusBadgeColor(status)}`}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        {/* Interactive Assignee Select */}
        <Select value={currentAssigneeValue} onValueChange={handleAssigneeSelect}>
          <SelectTrigger className="h-auto w-auto bg-white/80 border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
            <SelectValue placeholder={currentAssigneeName}>
              Assignee: {currentAssigneeName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai_agent">AI Agent</SelectItem>
            <SelectItem value="support_team">Support Team</SelectItem>
            {teamMembers.map((member: any) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.name || member.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority}
          onValueChange={(val) => setPriority(val as string)}
        >
          <SelectTrigger
            className={`h-auto w-auto border-0 px-4 py-1.5 rounded-full flex items-center gap-2 cursor-pointer font-medium text-sm focus:ring-0 focus:ring-offset-0 [&>svg]:text-white capitalize [&>svg]:w-4 [&>svg]:h-4 ${statusStyles[priority] || statusStyles.high}`}
          >
            <SelectValue placeholder="Select Priority" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="urgent">Urgent Priority</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-gray-800 font-medium">
          <Clock className="w-5 h-5" />
          <span>{ticket?.sla || "2h"}</span>
          <span className="text-gray-600/80 font-normal ml-1">
            (SLA: {ticket?.sla || "2h"})
          </span>
        </div>
      </div>
    </div>
  );
}
