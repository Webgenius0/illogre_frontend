"use client";

import React, { useMemo, useState } from "react";
import {
  MoreVertical,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Edit,
  Trash2,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InviteMemberModal } from "./InviteMemberModal";
import { EditMemberModal } from "./EditMemberModal";
import { DeleteMemberModal } from "./DeleteMemberModal";
import { SuccessModal } from "./SuccessModal";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Support Manager" | "Support Agent" | string;
  tickets: number;
  resolved: number;
  status: string;
  is_online?: boolean;
  last_active: string;
  initial: string;
  initialBg: string;
};

const columnHelper = createColumnHelper<TeamMember>();

export function TeamTable({
  members,
  isPending,
}: {
  members?: TeamMember[];
  isPending?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [successConfig, setSuccessConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  const showSuccess = (title: string, message: string) => {
    setSuccessConfig({ isOpen: true, title, message });
  };

  const data: TeamMember[] = useMemo(() => members || [], [members]);

  // 2. Define your columns with TanStack
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Member",
        cell: (info) => {
          const member = info.row.original;
          // Generate initials from name (e.g., "Mila Manager" -> "MM")
          const initials = member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full flex items-center justify-center font-bold bg-blue-100 text-blue-600">
                {initials}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900">{member.name}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {member.email}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => {
          const role = info.getValue();
          // Dynamic Role Colors
          const roleStyles: Record<string, string> = {
            Admin: "bg-purple-50 text-purple-600",
            "Support Manager": "bg-blue-50 text-blue-600",
            "Support Agent": "bg-green-50 text-green-600",
          };

          return (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border-none whitespace-nowrap",
                roleStyles[role] || "bg-gray-50 text-gray-600",
              )}
            >
              {role}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("tickets", {
        header: "Tickets",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("resolved", {
        header: "Resolved",
        cell: (info) => (
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-medium">{info.getValue()}</span>
            <CheckCircle2 className="size-4 text-green-500" />
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const isOnline = info.row.original.is_online;

          return (
            <div className="flex items-center gap-2 justify-center">
              <div
                className={cn(
                  "size-2 rounded-full",
                  isOnline ? "bg-green-500" : "bg-gray-400",
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium capitalize",
                  isOnline ? "text-green-600" : "text-gray-400",
                )}
              >
                {status}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("last_active", {
        header: "Last active",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Action",
        cell: (info) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="size-8 p-0 rounded-full">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className=" border-gray-100 shadow-xl p-2 w-32"
            >
              <DropdownMenuItem
                className="text-gray-700 cursor-pointer gap-2"
                onClick={() => {
                  setSelectedMember(info.row.original);
                  setEditModalOpen(true);
                }}
              >
                <Edit className="size-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-rose-500 hover:text-rose-600 cursor-pointer gap-2"
                onClick={() => {
                  setSelectedMember(info.row.original);
                  setDeleteModalOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{data?.length} members</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 bg-linear-to-r from-secondary to-primary text-black border-none transition-transform active:scale-95 shrink-0"
        >
          <Plus className="size-5" />
          Invite Member
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border custom_scroll">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/50">
                {headerGroup.headers.map((header) => {
                  // ... alignment logic from your previous code
                  return (
                    <TableHead
                      key={header.id}
                      className={cn("py-4 px-6 text-center")}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length} className="py-8 px-6">
                    <div className="flex items-center gap-4 animate-pulse">
                      <div className="size-10 bg-gray-200 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Users className="size-12 text-gray-200 mb-2" />
                    <p className="font-medium">No team members found</p>
                    <p className="text-sm">
                      Try adjusting your filters or adding new members.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-6 text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccessAction={(title, msg) => {
          setIsModalOpen(false);
          showSuccess(title, msg);
        }}
      />

      <EditMemberModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
        }}
        memberId={selectedMember?.id || null}
        currentRole={selectedMember?.role || ""}
        onSuccessAction={(title, msg) => {
          setEditModalOpen(false);
          setSelectedMember(null);
          showSuccess(title, msg);
        }}
      />

      <DeleteMemberModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedMember(null);
        }}
        memberId={selectedMember?.id || null}
        email={selectedMember?.name || null}
        onSuccessAction={(title, msg) => {
          setDeleteModalOpen(false);
          setSelectedMember(null);
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
