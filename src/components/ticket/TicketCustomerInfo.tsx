import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Ticket,
  Package,
  Truck,
  Navigation,
} from "lucide-react";

interface TicketCustomerInfoProps {
  customer?: {
    name: string;
    email: string;
    avatar?: string | null;
    location?: string;
    customer_since?: string;
    total_orders?: number | string;
    total_value?: string;
    prev_tickets?: number | string;
  } | null;
  orders?: Array<{
    order_id: string;
    status: string;
    items: number | string;
    total: string;
    tracking_number: string;
    courier: string;
    ship_to: string;
  }> | null;
}

export function TicketCustomerInfo({
  customer,
  orders,
}: TicketCustomerInfoProps) {
  const customerName = customer?.name || "Customer";
  const initial = customerName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-5 overflow-y-auto custom_scroll bg-white rounded-2xl p-5 h-auto border border-gray-100">
      {/* Customer Info Card */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
          Customer Profile
        </h2>

        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-sm">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 text-[15px] truncate">
              {customerName}
            </span>
            <span className="text-[13px] font-medium text-gray-500 truncate">
              {customer?.email || "No email"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col gap-1.5 border border-transparent hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Location</span>
            </div>
            <span className="text-[13px] font-medium text-gray-900 truncate">
              {customer?.location || "N/A"}
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col gap-1.5 border border-transparent hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Since</span>
            </div>
            <span className="text-[13px] font-bold text-gray-900 truncate">
              {customer?.customer_since || "N/A"}
            </span>
          </div>
          <div className="bg-[#f8f9ff] rounded-xl p-3.5 flex flex-col gap-1.5 border border-[#eef1ff]">
            <div className="flex items-center gap-1.5 text-blue-600/80">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Orders</span>
            </div>
            <span className="text-[14px] font-bold text-blue-900">
              {customer?.total_orders ?? "0"}
            </span>
          </div>
          <div className="bg-[#f0fdf4] rounded-xl p-3.5 flex flex-col gap-1.5 border border-[#dcfce7]">
            <div className="flex items-center gap-1.5 text-green-600/80">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Value</span>
            </div>
            <span className="text-[14px] font-bold text-green-900 truncate">
              {customer?.total_value || "$0"}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col gap-1.5 border border-transparent hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Ticket className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Previous Tickets</span>
            </div>
            <span className="text-[13px] font-bold text-gray-900">
              {customer?.prev_tickets ?? "0"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100 my-1" />

      {/* Orders Details */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
          Recent Orders
        </h2>
        {orders && orders.length > 0 ? (
          orders.map((order, idx) => (
            <div
              key={idx}
              className="rounded-xl p-4 flex flex-col gap-4 border border-gray-200 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">
                  {order.order_id}
                </span>
                <Badge className="bg-[#eef8b8] text-gray-800 hover:bg-[#eef8b8] font-bold px-2.5 py-0.5 rounded-md text-[11px] shadow-none border-none uppercase tracking-wide">
                  {order.status || "Ready to Ship"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{order.items} items</span>
                <span className="text-gray-300">•</span>
                <span className="font-bold text-gray-700">{order.total}</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                      Tracking / Courier
                    </span>
                    <span className="text-[13px] font-bold text-gray-900">
                      {order.tracking_number || "N/A"}{" "}
                      <span className="font-medium text-gray-500 text-xs ml-1">
                        ({order.courier || "N/A"})
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Navigation className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                      Shipping Address
                    </span>
                    <span className="text-[13px] font-medium text-gray-700 leading-relaxed">
                      {order.ship_to || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl p-8 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 bg-gray-50 text-center text-gray-500">
            <ShoppingBag className="w-8 h-8 text-gray-300 mb-1" />
            <span className="text-sm font-bold text-gray-700">
              No Active Orders
            </span>
            <span className="text-xs font-medium">
              This customer hasn't placed any orders recently.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
