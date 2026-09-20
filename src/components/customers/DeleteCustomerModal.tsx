"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCustomer } from "@/hooks/customers.api";
import { Spinner } from "../ui/spinner";

type DeleteCustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | number | null;
  customerName: string | null;
  onSuccessAction?: (title: string, message: string) => void;
};

export function DeleteCustomerModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  onSuccessAction,
}: DeleteCustomerModalProps) {
  const { mutate: deleteCustomer, isPending } = useDeleteCustomer(customerId);

  const handleDelete = () => {
    if (!customerId) return;
    deleteCustomer(undefined, {
      onSuccess: () => {
        if (onSuccessAction) {
          onSuccessAction(
            "Customer Deleted Successfully",
            "The customer has been successfully removed from your database.",
          );
        } else {
          onClose();
        }
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-8 rounded-xl gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Delete Customer
          </DialogTitle>
        </DialogHeader>

        <div className="text-center text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">{customerName}</span>? 
          This action cannot be undone.
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
            Delete Customer {isPending && <Spinner />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
