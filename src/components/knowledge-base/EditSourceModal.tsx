"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  type KnowledgeSource,
  type KnowledgeBaseDetailData,
} from "@/lib/types/knowledge-base";

import {
  useAddKnowledgeSource,
  useUpdateKnowledgeSource,
} from "@/hooks/knowledge-base.api";

interface Props {
  source?: KnowledgeSource | KnowledgeBaseDetailData | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

type FormValues = {
  name: string;
  type: "file" | "text";
  category: string;
  file?: FileList;
  text?: string;
};

export function EditSourceModal({
  source,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const { mutate: addSource, isPending: isAdding } = useAddKnowledgeSource();

  const sourceId = source ? String(source.id) : null;
  const { mutate: updateSource, isPending: isUpdating } =
    useUpdateKnowledgeSource(sourceId);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      type: "file",
      category: "Policies",
      text: "",
    },
  });

  const type = watch("type");
  const category = watch("category");

  useEffect(() => {
    if (isOpen) {
      const sourceType =
        source?.type === "document" || source?.type === "file" ? "file" : "text";
      const sourceContent = "content" in (source || {}) ? (source as any).content : "";

      reset({
        name: source?.name || "",
        type: sourceType,
        category: source?.category || "Policies",
        text: sourceContent || "",
      });
    }
  }, [source, isOpen, reset]);

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("category", values.category);

    if (values.type === "file" && values.file?.[0]) {
      if (values.file[0].size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      formData.append("file", values.file[0]);
    }

    if (values.type === "text" && values.text) {
      formData.append("text", values.text);
    }

    const onSuccess = () => handleOpenChange(false);

    if (source) {
      formData.append("_method", "PATCH");

      updateSource(formData, {
        onSuccess,
      });
      return;
    }

    addSource(formData, {
      onSuccess,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger>
          {trigger || (
            <Button className="h-12 px-6 w-full sm:w-auto bg-linear-to-r from-secondary to-primary text-foreground">
              <Plus className="h-5 w-5" />
              Add Source
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-120 rounded-3xl p-6 overflow-hidden">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold">
            {source ? "Edit Knowledge Source" : "Add Knowledge Source"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            {source
              ? "Update the details for this knowledge source"
              : "Fill in the details for your new knowledge source"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-2 text-left">
            <label className="text-sm font-semibold block">Source Name</label>

            <Input
              {...register("name", {
                required: "Source name is required",
              })}
              placeholder="e.g. Refund Policy Summary"
              className={`h-10 bg-gray-50 text-sm ${
                errors.name ? "border-red-500" : ""
              }`}
            />

            {errors.name && (
              <p className="text-xs text-red-500 font-medium ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2 text-left">
            <label className="text-sm font-semibold block">Category</label>

            <Select
              value={category}
              onValueChange={(val: string | null) => {
                if (val) setValue("category", val);
              }}
            >
              <SelectTrigger className="h-10! bg-gray-50 w-full text-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Policies">Policies</SelectItem>
                <SelectItem value="FAQs">FAQs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2 text-left">
            <label className="text-sm font-semibold block">Source Type</label>

            <Select
              value={type}
              onValueChange={(val: string | null) => {
                if (val === "file" || val === "text") {
                  setValue("type", val);
                }
              }}
            >
              <SelectTrigger className="h-10! bg-gray-50 w-full text-sm capitalize">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="file">File Upload (PDF, DOCX)</SelectItem>
                <SelectItem value="text">Raw Text Input</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File or Text */}
          <div className="space-y-2 text-left">
            {type === "file" ? (
              <>
                <label className="text-sm font-semibold block">
                  Upload File
                </label>

                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  {...register("file", {
                    validate: (files) =>
                      !!source || (files && files.length > 0) || "File is required",
                  })}
                  className={`h-10 bg-gray-50 text-sm py-1.5 ${
                    errors.file ? "border-red-500" : ""
                  }`}
                />

                {errors.file && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.file.message as string}
                  </p>
                )}

                {source && (
                  <p className="text-xs text-gray-400 ml-1 italic">
                    Leave empty to keep existing file
                  </p>
                )}
              </>
            ) : (
              <>
                <label className="text-sm font-semibold block">
                  Input Text Content
                </label>

                <Textarea
                  {...register("text", {
                    required:
                      type === "text" ? "Text content is required" : false,
                  })}
                  placeholder="Paste or type your knowledge content here..."
                  className={`min-h-28 bg-gray-50 text-sm ${
                    errors.text ? "border-red-500" : ""
                  }`}
                />

                {errors.text && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.text.message}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isAdding || isUpdating}
              className="flex-1 h-10 text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-sm font-semibold"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isAdding || isUpdating}
              className="flex-1 h-10 bg-linear-to-r from-primary to-secondary text-foreground text-sm flex items-center gap-2 font-semibold"
            >
              {(isAdding || isUpdating) && <Spinner className="size-4" />}

              {source
                ? isUpdating
                  ? "Updating..."
                  : "Save Changes"
                : isAdding
                  ? "Adding..."
                  : "Create Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
