"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmailSvg from "../svg/EmailSvg";
import CallSvg from "../svg/CallSvg";
import LocationSvg from "../svg/LocationSvg";
import CalenderSvg from "../svg/CalenderSvg";
import { Button } from "@/components/ui/button";
import { useCustomerDetails } from "@/hooks/customers.api";
import { Spinner } from "../ui/spinner";

interface CustomerDetailsViewProps {
  id: string;
}

export function CustomerDetailsView({ id }: CustomerDetailsViewProps) {
  const router = useRouter();
  const { data: customerDetails, isLoading } = useCustomerDetails(id);
  const customer = customerDetails?.data;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] items-center justify-center flex flex-col gap-2">
        <Spinner className="size-8" />
        Loding...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 font-medium">Customer not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const allTickets = [
    ...(customer.tickets?.open || []).map((t: any) => ({
      ...t,
      status: "Open",
    })),
    ...(customer.tickets?.closed || []).map((t: any) => ({
      ...t,
      status: "Closed",
    })),
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400 font-urbanist pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{customer.name}</h1>
              <p className="text-gray-400 text-sm font-medium">
                Customer ID: {customer.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Orders", value: customer.total_orders || 0 },
          {
            label: "Lifetime Value",
            value: customer.ltv || "$0.00",
          },
          { label: "Open Tickets", value: customer.tickets?.open?.length || 0 },
          { label: "Status", value: customer.status || "New" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100/50 flex flex-col gap-2"
          >
            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100/50">
            <h3 className="text-lg font-bold mb-8">Customer Details</h3>
            <div className="space-y-6">
              {[
                { icon: <EmailSvg />, label: "Email", value: customer.email },
                {
                  icon: <CallSvg />,
                  label: "Phone",
                  value: customer.phone || "N/A",
                },
                {
                  icon: <LocationSvg />,
                  label: "Address",
                  value: customer.country || "N/A",
                },
                {
                  icon: (
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase">
                      {customer.status}
                    </Badge>
                  ),
                  label: "Customer Status",
                  value: customer.status,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="mt-0.5">{item.icon}</span>

                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100/50 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Tickets</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader className="bg-linear-to-r from-secondary/30 to-primary/30">
                  <TableRow className="border-none">
                    <TableHead className="pl-8 font-bold">Subject</TableHead>
                    <TableHead className="pr-8 font-bold text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTickets.length > 0 ? (
                    allTickets.map((ticket: any, i: number) => (
                      <TableRow
                        key={i}
                        className="border-gray-100 hover:bg-gray-50/30 transition-colors"
                      >
                        <TableCell className="pl-8 text-sm py-3 font-semibold text-gray-700">
                          {ticket.subject || "No Subject"}
                        </TableCell>
                        <TableCell className="pr-8 text-right py-3">
                          <Badge
                            className={cn(
                              "border-none text-xs py-0 px-2 rounded-full",
                              ticket.status === "Open"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-green-100 text-green-600",
                            )}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="h-24 text-center text-gray-400"
                      >
                        No tickets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Recent Order */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100/50 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Order History</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader className="bg-linear-to-r from-secondary/20 to-primary/20">
                  <TableRow className="border-none">
                    <TableHead className="pl-8 font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Total</TableHead>
                    <TableHead className="pr-8 font-bold text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.order_history?.length > 0 ? (
                    customer.order_history.map((order: any, i: number) => (
                      <TableRow
                        key={i}
                        className="border-gray-100 hover:bg-gray-50/30 transition-colors"
                      >
                        <TableCell className="pl-8 text-xs font-semibold text-gray-500">
                          #{order.id}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-gray-500">
                          {order.date || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-gray-700">
                          {order.total || "$0.00"}
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Badge className="bg-green-50 text-green-600 border-none text-xs py-0 px-2 rounded-full">
                            {order.status || "Completed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-gray-400"
                      >
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Metrics - Keeping UI structure but simplified since some fields aren't in example */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100/50 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Customer Metrics</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader className="bg-linear-to-r from-secondary/20 to-primary/20">
                  <TableRow className="border-none">
                    <TableHead className="pl-8 font-bold w-1/2">
                      Metric
                    </TableHead>
                    <TableHead className="pr-8 font-bold text-right">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      label: "Total Orders",
                      value: customer.total_orders || 0,
                    },
                    {
                      label: "Lifetime Value (LTV)",
                      value: customer.ltv || "$0.00",
                    },
                    {
                      label: "Account Status",
                      value: customer.status || "New",
                    },
                  ].map((metric, i) => (
                    <TableRow key={i} className="border-gray-100">
                      <TableCell className="pl-8 text-sm font-semibold text-gray-500">
                        {metric.label}
                      </TableCell>
                      <TableCell className="pr-8 text-right text-sm font-bold text-gray-800">
                        {metric.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
