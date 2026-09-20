"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export type ActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

export function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Upgrade Plan",
  cancelText = "Cancel",
  onConfirm,
}: ActionModalProps) {
  const router = useRouter();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      router.push("/billing");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-8 rounded-xl gap-0 border-none text-center bg-white">
        <div className="flex justify-center mb-5">
          <div className="size-16 rounded-full border border-amber-500/20 flex items-center justify-center bg-amber-50 relative shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500 text-center leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11">
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} className="flex-1 h-11 ">
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
