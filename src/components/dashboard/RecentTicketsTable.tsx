"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
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

export function RecentTicketsTable({
  data,
  isPending,
}: {
  data?: any;
  isPending?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>("all");

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((ticket: any) => {
      const matchesSearch = (ticket?.ticket_id || "")
        .toLowerCase()
        .includes((searchQuery || "").toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
        (ticket?.status || "").toLowerCase() === filterStatus?.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filterStatus]);

  // Helper to get status styles
  const getStatusStyles = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
      case "open":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
    }
  };
  return (
    <div className="rounded-2xl bg-white flex flex-col p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
        <h3 className="text-lg font-semibold">Recent Tickets</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 md:w-80 pl-9 rounded-full bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="sm:w-32 w-full rounded-full bg-white text-gray-700 capitalize">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <Table className="min-w-200">
          <TableHeader className="bg-linear-to-r from-secondary/20 to-primary/20">
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="font-medium text-gray-700 rounded-tl-lg py-3 pl-4">
                Ticket ID
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-3">
                Customer
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-3">
                Subject
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-3">
                Source
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-3">
                Confidence
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-3">
                Status
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-3">
                Assigned
              </TableHead>
              <TableHead className="font-medium text-gray-700 rounded-tr-lg text-right py-3 pr-4">
                Updated
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading tickets...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  No tickets found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              // Data List
              filteredData.map((ticket: any, index: number) => (
                <TableRow key={ticket.ticket_id || index} className="border-b">
                  <TableCell className="font-medium text-gray-600 py-4">
                    {ticket.ticket_id}
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 uppercase">
                        {ticket.customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-700">
                        {ticket.customer.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {ticket.subject}
                      </span>
                      {ticket.subSubject && (
                        <span className="text-xs text-muted-foreground">
                          {ticket.subSubject}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs w-max text-gray-600 font-medium">
                      {ticket.source}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ticket.confidence > 70
                              ? "bg-green-500"
                              : ticket.confidence > 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${ticket.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {ticket.confidence}%
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={`${getStatusStyles(ticket.status)} font-medium rounded-full px-2.5`}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 text-sm font-medium text-gray-600">
                    {ticket.assigned}
                  </TableCell>

                  <TableCell className="py-4 text-right text-sm text-muted-foreground">
                    {ticket.updated}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
