"use client";

import React, { useState } from "react";
import {
  Search,
  MessageSquare,
  ShoppingBag,
  Mail,
  HelpCircle,
  Loader2,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import RightArrowSvg from "../svg/RightArrowSvg";
import Link from "next/link";

import { useTickets } from "@/hooks/tickets.api";

const getSourceIcon = (source: string) => {
  const lower = source?.toLowerCase()?.trim();
  if (lower === "email" || lower === "gmail" || lower === "outlook")
    return Mail;
  if (lower === "chat") return MessageSquare;
  if (lower === "shopify") return ShoppingBag;
  return HelpCircle;
};

const getPriorityColor = (priority: string) => {
  const lower = priority?.toLowerCase()?.trim();
  if (lower === "urgent" || lower === "high" || lower === "hight")
    return "text-red-500";
  if (lower === "medium") return "text-amber-500";
  return "text-green-500";
};

const getStatusStyles = (status: string) => {
  const lower = status?.toLowerCase()?.trim();
  if (lower === "closed") {
    return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
  }
  if (lower === "resolved") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
  }
  if (lower === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
  }
  return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
};

export function TicketsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState("10");

  const { data: response, isLoading } = useTickets({
    search: searchQuery,
    status: statusFilter,
    source: sourceFilter,
    category: categoryFilter,
    page: currentPage,
    per_page: perPage,
  });

  const tickets = response?.data || [];
  const pagination = response?.pagination;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          Tickets
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage and resolve customer inquiries
        </p>
      </div>
      <div className="rounded-2xl bg-white flex flex-col p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between w-full">
            <div className="relative">
              <Search className="absolute left-3 top-2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets by ID, name, email, subject..."
                className="w-full sm:w-62 md:w-87 pl-9 rounded-full bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(val) =>
                  handleFilterChange(setStatusFilter, val || "all")
                }
              >
                <SelectTrigger className="sm:min-w-25 w-full rounded-full text-gray-700 capitalize">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-150 rounded-md shadow-md">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sourceFilter}
                onValueChange={(val) =>
                  handleFilterChange(setSourceFilter, val || "all")
                }
              >
                <SelectTrigger className="sm:min-w-25 w-full rounded-full text-gray-700 capitalize">
                  <SelectValue placeholder="Select Sources" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-150 rounded-md shadow-md">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(val) =>
                  handleFilterChange(setCategoryFilter, val || "all")
                }
              >
                <SelectTrigger className="sm:min-w-40 w-full rounded-full text-gray-700 capitalize">
                  <SelectValue placeholder="Select Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-150 rounded-md shadow-md">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="order status">Order Status</SelectItem>
                  <SelectItem value="returns">Returns</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-2xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-2 bg-gray-50/50">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">
                Loading tickets...
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 gap-1 bg-gray-50/50">
              <p className="text-base font-semibold text-gray-700">
                No matching tickets found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            <Table className="min-w-200">
              <TableHeader className="bg-linear-to-r from-secondary/20 to-primary/20">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="font-medium text-gray-700 rounded-tl-lg py-2 pl-4">
                    Ticket ID
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Customer
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Subject
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Source
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Confidence
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Priority
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-2">
                    Assigned
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 rounded-tr-lg text-right py-2 pr-4">
                    Updated
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 rounded-tr-lg text-right py-2 pr-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: any) => {
                  const SourceIcon = getSourceIcon(ticket.source);
                  const customerName =
                    ticket.customer?.name || "Unknown Customer";
                  const initial = customerName.charAt(0);

                  return (
                    <TableRow key={ticket.id} className="border-b">
                      <TableCell className="font-medium text-gray-600 py-2">
                        {ticket.ticket_id}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 uppercase">
                            {initial}
                          </div>
                          <span className="font-medium text-gray-700">
                            {customerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium text-gray-700 max-w-62 truncate"
                            title={ticket.subject}
                          >
                            {ticket.subject}
                          </span>
                          <span
                            className="text-xs text-muted-foreground mt-0.5 max-w-62 truncate"
                            title={ticket.body?.replace(/<[^>]*>?/gm, "")}
                          >
                            {ticket.body
                              ? ticket.body.replace(/<[^>]*>?/gm, "")
                              : ticket.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs w-max text-gray-600 font-medium">
                          <SourceIcon className="h-3.5 w-3.5 text-gray-500" />
                          {ticket.source}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${ticket.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {ticket.confidence}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`py-2 font-semibold capitalize ${getPriorityColor(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`font-medium rounded-full px-2.5 ${getStatusStyles(ticket.status)}`}
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-sm font-medium text-gray-600">
                        {ticket.assigned_user?.name || ticket.assigned || "Unassigned"}
                      </TableCell>
                      <TableCell className="py-2 text-right text-sm text-muted-foreground">
                        {ticket.updated}
                      </TableCell>
                      <TableCell className="py-2 text-right text-sm text-muted-foreground">
                        <Link href={`tickets/${ticket.id}`}>
                          <Button
                            variant={"outline"}
                            className="cursor-pointer h-8 text-xs px-3"
                          >
                            View <RightArrowSvg />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
                {pagination.total} entries
              </span>
              <div className="flex items-center gap-2 sm:border-l sm:pl-3 sm:ml-1 border-gray-200">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={perPage}
                  onValueChange={(val) => {
                    setPerPage(val || "10");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-17 text-xs bg-white">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.last_page}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.last_page, prev + 1),
                  )
                }
                className="cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
