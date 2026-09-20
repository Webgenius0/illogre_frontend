"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTeamRole } from "@/hooks/team.api";
import { Spinner } from "../ui/spinner";
type EditMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
  currentRole: string;
  onSuccessAction?: (title: string, message: string) => void;
};

export function EditMemberModal({
  isOpen,
  onClose,
  memberId,
  currentRole,
  onSuccessAction,
}: EditMemberModalProps) {
  const [role, setRole] = useState("Support Agent");

  useEffect(() => {
    if (isOpen) {
      setRole(currentRole || "Support Agent");
    }
  }, [isOpen, currentRole]);

  const { mutate: updateRole, isPending } = useUpdateTeamRole(memberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    updateRole(
      { role },
      {
        onSuccess: () => {
          if (onSuccessAction) {
            onSuccessAction(
              "Role Updated Successfully",
              "The team member's role has been successfully updated.",
            );
          } else {
            onClose();
          }
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 p-8 rounded-xl gap-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-semibold">
            Edit Team Member Role
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold block">Role</label>
            <Select value={role} onValueChange={(val) => setRole(val || "")}>
              <SelectTrigger className="h-10! bg-white w-full">
                <SelectValue placeholder="Select the job Role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="Support Manager">Support Manager</SelectItem>
                <SelectItem value="Support Agent">Support Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-10 bg-gray-50 border-none text-gray-700 font-bold hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-10 bg-linear-to-tr from-primary to-secondary text-black"
            >
              Save Changes {isPending && <Spinner />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
