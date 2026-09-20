"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRemoveTeamMember } from "@/hooks/team.api";
import { Spinner } from "../ui/spinner";

type DeleteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
  email: string | null;
  onSuccessAction?: (title: string, message: string) => void;
};

export function DeleteMemberModal({
  isOpen,
  onClose,
  memberId,
  email,
  onSuccessAction,
}: DeleteMemberModalProps) {
  const { mutate: deleteMember, isPending } = useRemoveTeamMember(memberId);

  const handleDelete = () => {
    if (!memberId || !email) return;
    deleteMember(
      { email },
      {
        onSuccess: () => {
          if (onSuccessAction) {
            onSuccessAction(
              "Member Removed Successfully",
              "The team member has been successfully removed from your team.",
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
      <DialogContent className="sm:max-w-md p-8 rounded-xl gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Remove Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="text-center text-gray-600">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-gray-900">{email}</span> from the
          team? This action cannot be undone.
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
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 h-10 bg-rose-500 hover:bg-rose-600 text-white"
          >
            Remove Member {isPending && <Spinner />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
