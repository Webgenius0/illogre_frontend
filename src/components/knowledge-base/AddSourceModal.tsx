import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SourceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const sourceOptions: SourceOption[] = [
  {
    id: "document",
    title: "Upload Document",
    description: "Upload a PDF document",
    icon: <Upload className="h-5 w-5" />,
    color: "bg-rose-50 text-rose-500",
  },
  {
    id: "text",
    title: "Input Text File",
    description: "Add a Input Text File",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-blue-50 text-blue-500",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (optionId: string) => void;
}

export function AddSourceModal({ isOpen, onClose, onSelect }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-106 rounded-3xl p-6 overflow-hidden">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">
            Add Knowledge Source
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how to add content to your knowledge base
          </DialogDescription>
        </DialogHeader>

        {/* <div className="space-y-3">
          {sourceOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="w-full flex items-center gap-4 p-4 rounded-md border border-gray-100 hover:bg-gray-50 hover:border-emerald-100 transition-all text-left outline-none focus:ring-2 focus:ring-emerald-500/20 group"
            >
              <div
                className={`p-2.5 rounded-xl ${option.color} group-hover:scale-110 transition-transform`}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 leading-none mb-1">
                  {option.title}
                </div>
                <div className="text-xs text-muted-foreground leading-none">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-11 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
