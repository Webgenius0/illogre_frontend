import React, { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { type KnowledgeArticle, type KnowledgeChunk } from "@/lib/types/knowledge-base";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AnyArticle = KnowledgeArticle | KnowledgeChunk;

interface Props {
  data: AnyArticle[];
  searchQuery: string;
}

export function ArticleTable({ data, searchQuery }: Props) {
  const columns = useMemo<ColumnDef<AnyArticle>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Article Title",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="font-medium text-gray-900 truncate">
              {row.getValue("title")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="rounded-lg bg-gray-50 text-gray-500 border-gray-100 font-normal px-2 py-0.5 text-xs"
          >
            {row.getValue("category")}
          </Badge>
        ),
      },
      {
        id: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => {
          const item = row.original;
          const dateStr = "last_updated" in item ? item.last_updated : item.lastUpdated;
          return (
            <span className="text-gray-500 text-sm whitespace-nowrap">
              {dateStr}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          switch (status) {
            case "Indexed":
            case "Resolved":
              return (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-50/50 rounded-full px-3 py-1 w-fit">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{status}</span>
                </div>
              );
            case "Processing":
              return (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 bg-amber-50/50 rounded-full px-3 py-1 w-fit">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing</span>
                </div>
              );
            case "Error":
              return (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-50/50 rounded-full px-3 py-1 w-fit">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Error</span>
                </div>
              );
            default:
              return (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-3 py-1 w-fit">
                  <span>{status}</span>
                </div>
              );
          }
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: () => {},
  });

  return (
    <div className="rounded-3xl border border-gray-100 overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-linear-to-r from-secondary/30 to-primary/30">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-none hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-gray-700 font-semibold h-12 first:pl-6 last:pr-6"
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-gray-50/50 border-gray-100 first:border-t"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-4 first:pl-6 last:pr-6"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No articles discovered yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
