import React from "react";
import jsPDF from "jspdf";
import {
  Download,
  CreditCard,
  ExternalLink,
  Calendar,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Invoice = {
  sl_no: number;
  invoice_id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  action_url?: string;
};

type BillingHistoryProps = {
  invoices?: Invoice[];
  isPending?: boolean;
  setActiveTab: (tab: "plans" | "history") => void;
};

export default function BillingHistory({
  invoices = [],
  setActiveTab,
  isPending,
}: BillingHistoryProps) {
  const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Modern Colors
    const primaryColor: [number, number, number] = [178, 224, 138]; // #B2E08A
    const primaryDarkColor: [number, number, number] = [18, 161, 80]; // Theme green
    const textColor: [number, number, number] = [51, 51, 51];
    const lightGray: [number, number, number] = [245, 245, 245];

    // Header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("INVOICE", 14, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Illogre", 160, 20);
    doc.text("support@illogre.com", 160, 26);

    // Invoice Details
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Valued Customer", 14, 66);

    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details:", 120, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice ID: ${invoice.invoice_id}`, 120, 66);
    doc.text(`Date: ${invoice.date}`, 120, 72);
    doc.text(`Status: ${invoice.status}`, 120, 78);

    // Table Header
    doc.setFillColor(...lightGray);
    doc.rect(14, 90, 182, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 16, 98);
    doc.text("Amount", 170, 98);

    // Table Content
    doc.setFont("helvetica", "normal");
    doc.text(invoice.description, 16, 110);
    doc.text(invoice.amount, 170, 110);

    // Total Line
    doc.setDrawColor(...lightGray);
    doc.line(14, 120, 196, 120);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Total:", 140, 130);
    doc.text(invoice.amount, 170, 130);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", 105, 270, { align: "center" });

    doc.save(`${invoice.invoice_id}.pdf`);
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      header: "SL No",
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "invoice_id",
      header: "Invoice ID",
      cell: ({ row }) => <span>{row.getValue("invoice_id")}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-500 font-medium">
          {row.getValue("date")}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span>{row.getValue("description")}</span>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          {row.getValue("amount")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className="bg-[#E4F5D5] text-[#12A150] border-none px-3 py-1 rounded-lg font-medium text-[10px] pointer-events-none">
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-8">Action</div>,
      cell: ({ row }) => (
        <div className="text-right pr-8">
          <button
            onClick={() => generateInvoicePDF(row.original)}
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: invoices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Payment Method Card */}
      <h3 className="text-xl font-semibold">Current Subscription Plans</h3>
      <div className="bg-white p-4 rounded-xl border border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#B2E08A]/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        <div className="flex items-center gap-6 relative">
          <div className="size-10 bg-blue-50 rounded-md flex items-center justify-center border border-blue-100 transition-transform duration-300">
            <DollarSign className="text-blue-600 size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">Growth</h3>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-gray-400 flex items-center gap-1.5">
                ($79/month) Up to 2,500 tickets
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("plans")}
          className="px-3 py-1.5 rounded-md border border-[#B2E08A] font-medium text-gray-900 text-xs transition-all whitespace-nowrap bg-linear-to-r from-secondary/20 to-primary/10 relative z-10"
        >
          Change Plan
        </button>
      </div>

      {/* Invoices Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-none bg-linear-to-r from-secondary/20 to-primary/20"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-medium py-4 text-sm first:pl-8 last:pr-8"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow
                    key={`skeleton-${i}`}
                    className="h-16 border-b border-gray-50"
                  >
                    {columns.map((_, index) => (
                      <TableCell key={`cell-${index}`} className="first:pl-10">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group hover:bg-gray-50/80 font-normal transition-all border-b border-gray-100 last:border-0 h-16"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="font-normal first:pl-10"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-sm font-medium text-gray-900">
                        No results found
                      </p>
                      <p className="text-xs">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
