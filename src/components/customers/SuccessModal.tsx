"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-8 sm:p-12 rounded-2xl gap-0 border-none text-center bg-white">
        <div className="flex justify-center mb-6">
          <div className="size-20 rounded-full border border-primary/20 flex items-center justify-center bg-gray-50 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/30 shadow-lg">
              <Check className="text-secondary w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-[#6B6B6B] text-base mb-8 font-medium">{message}</p>
        <Button
          onClick={onClose}
          className="w-full h-12 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-black font-semibold text-base rounded-lg transition-all duration-300"
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
