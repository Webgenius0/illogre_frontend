"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import RightArrowSvg from "../svg/RightArrowSvg";
import { AddEditCustomerModal } from "./AddEditCustomerModal";
import EditSvg from "../svg/EditSvg";
import { useCustomers } from "@/hooks/customers.api";
import { SuccessModal } from "./SuccessModal";
import { DeleteCustomerModal } from "./DeleteCustomerModal";
import { Spinner } from "../ui/spinner";
import BinSvg from "../svg/BinSvg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
export type Customer = {
  id: string | number;
  name: string;
  email: string;
  country: string;
  orders: number;
  tickets: number;
  value: string | number;
  status: "VIP" | "Regular" | "New" | string;
  last_active: string;
  total_orders?: number;
  total_spent?: number;
};

export function CustomerTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eachcustomer, seteachcustomer] = useState<Customer>();

  const [successConfig, setSuccessConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState("10");

  const router = useRouter();

  // API Hook
  const { data: customersData, isLoading } = useCustomers({
    search: globalFilter,
    page: currentPage,
    per_page: perPage,
  });

  const customers = customersData?.data || [];
  const pagination = customersData?.pagination;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
    setCurrentPage(1);
  };

  const showSuccess = (title: string, message: string) => {
    setSuccessConfig({ isOpen: true, title, message });
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: "sl_no",
        header: "SL No",
        cell: (info) => (
          <span className="text-gray-500 font-medium pl-4">
            {info.row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Customers",
        cell: ({ row }) => {
          const name = row.getValue("name") as string;
          const email = row.original.email;
          const initial = name?.charAt(0).toUpperCase() || "?";

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary">
                {initial}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-[15px]">
                  {name}
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  {email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "country",
        header: "Location",
        cell: (info) => (
          <span className="text-gray-600 font-medium">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "orders",
        header: "Orders",
        cell: (info) => (
          <span className="text-gray-600 font-medium">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "tickets",
        header: "Tickets",
        cell: (info) => (
          <span className="text-gray-600 font-medium">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: (info) => {
          const val = info.getValue() as string | number;
          return (
            <span className="text-secondary font-bold">
              {typeof val === "number" ? `$${val.toLocaleString()}` : val}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          let badgeClass = "";

          switch (status) {
            case "VIP":
              badgeClass = "bg-[#F5F1FF] text-[#A855F7]";
              break;
            case "Regular":
              badgeClass = "bg-[#EFF6FF] text-[#3B82F6]";
              break;
            case "New":
              badgeClass = "bg-[#ECFDF5] text-[#10B981]";
              break;
            default:
              badgeClass = "bg-gray-100 text-gray-600";
          }

          return (
            <Badge
              variant="outline"
              className={cn(
                "font-medium rounded-full py-1 px-3 border-none capitalize text-[11px]",
                badgeClass,
              )}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "last_active",
        header: "Last Active",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  seteachcustomer(row.original);
                  setIsModalOpen(true);
                }}
              >
                <EditSvg />
              </div>

              <div
                className="cursor-pointer text-rose-500 hover:text-rose-600 transition-colors"
                onClick={() => {
                  seteachcustomer(row.original);
                  setDeleteModalOpen(true);
                }}
              >
                <BinSvg />
              </div>

              <Button
                variant="outline"
                className="ml-2 cursor-pointer h-8 text-xs px-3"
                onClick={() => router.push(`/customers/${row.original.id}`)}
              >
                View <RightArrowSvg />
              </Button>
            </div>
          );
        },
      },
    ],
    [router],
  );

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-3xl bg-white flex flex-col p-6 space-y-4 border border-gray-100/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h3 className="text-xl font-semibold">
          All Customers ({customers.length})
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search customers..."
              value={globalFilter ?? ""}
              onChange={handleSearch}
              className="w-full sm:w-80 md:w-md pl-14 h-10 bg-gray-50/50 border-gray-100 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary/30 shadow-none text-base placeholder:text-gray-400 font-medium transition-all"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <Table className="min-w-275">
          <TableHeader className="bg-linear-to-r from-secondary/20 to-primary/20 border-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-none"
              >
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={cn(
                      "h-10 font-bold text-gray-600 py-2 transition-colors select-none",
                      header.column.getCanSort() &&
                        "cursor-pointer hover:text-gray-900",
                      index === 0 ? "pl-8" : "pl-4",
                      index === headerGroup.headers.length - 1
                        ? "pr-8"
                        : "pr-4",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <div className="size-4 shrink-0 opacity-50">
                          {{
                            asc: <ChevronUp className="size-4" />,
                            desc: <ChevronDown className="size-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="size-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Spinner className="size-7" />
                    <p className="text-gray-500 font-medium">
                      Loading customers...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-50/40 transition-colors group"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-2 transition-all",
                        index === 0 ? "pl-8" : "pl-4",
                        index === row.getVisibleCells().length - 1
                          ? "pr-8"
                          : "pr-4",
                      )}
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
                  className="h-32 text-center text-gray-400 font-medium"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
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
                <SelectTrigger className="h-8 w-17.5 text-xs bg-white">
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

      <AddEditCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccessAction={(title, msg) => {
          setIsModalOpen(false);
          showSuccess(title, msg);
        }}
        customer={eachcustomer}
      />

      <DeleteCustomerModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          seteachcustomer(undefined);
        }}
        customerId={eachcustomer?.id || null}
        customerName={eachcustomer?.name || null}
        onSuccessAction={(title, msg) => {
          setDeleteModalOpen(false);
          seteachcustomer(undefined);
          showSuccess(title, msg);
        }}
      />

      <SuccessModal
        isOpen={successConfig.isOpen}
        onClose={() => setSuccessConfig((prev) => ({ ...prev, isOpen: false }))}
        title={successConfig.title}
        message={successConfig.message}
      />
    </div>
  );
}
