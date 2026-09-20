"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  Globe,
  CheckCircle2,
  Clock,
  Database,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  type KnowledgeBaseDetailData,
  type KnowledgeSource,
} from "@/lib/types/knowledge-base";
import { ArticleTable } from "./ArticleTable";
import BrainSvg from "../svg/BrainSvg";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useTestKnowledgeQuery } from "@/hooks/knowledge-base.api";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface Props {
  source: KnowledgeBaseDetailData | KnowledgeSource;
  onBack?: () => void;
  onEdit?: (source: any) => void;
  onDelete?: (id: string | number) => void;
  onReindex?: (id: string | number) => void;
  isReindexing?: boolean;
  onTestQuery?: (query: string) => void;
  isTestingQuery?: boolean;
}

export function SourceDetailView({
  source,
  onBack,
  onEdit,
  onDelete,
  onReindex,
  isReindexing,
  onTestQuery,
  isTestingQuery,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [testInput, setTestInput] = useState("");
  const [apiTestResponse, setApiTestResponse] = useState<any>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Normalize data between KnowledgeBaseDetailData and legacy KnowledgeSource
  const id = source.id;
  const name = source.name;
  const category = source.category;
  const type =
    ("type" in source ? source.type : (source as KnowledgeSource).type) ||
    "text";
  const status = source.status || "Indexed";
  const lastUpdated =
    ("last_updated" in source
      ? source.last_updated
      : (source as KnowledgeSource).lastSynced) || "Recently";
  const fileSize =
    ("file_size" in source
      ? source.file_size
      : (source as KnowledgeSource).fileSize) || null;
  const filePath = "file_path" in source ? source.file_path : null;
  const content = "content" in source ? source.content : null;
  const articleCount =
    ("article_count" in source
      ? source.article_count
      : (source as KnowledgeSource).articleCount) ?? 0;
  const url =
    ("url" in source ? (source as KnowledgeSource).url : null) ||
    filePath ||
    null;

  // test query
  const { mutate: testQueryMutation, isPending: isTestingMutation } =
    useTestKnowledgeQuery(id);

  const isLoadingTest = isTestingQuery || isTestingMutation;

  // AI Status Object
  const aiStatus =
    "ai_status" in source && source.ai_status
      ? source.ai_status
      : {
          status: status === "Indexed" ? "Indexed (AI Ready)" : status,
          progress:
            status === "Indexed" ? 100 : status === "Processing" ? 60 : 0,
          last_indexed: lastUpdated,
        };

  // Source Details Object
  const sourceDetails =
    "source_details" in source && source.source_details
      ? source.source_details
      : {
          source_type: type,
          articles_extracted: articleCount,
          last_indexed: lastUpdated,
        };

  const chunks =
    ("chunks" in source ? source.chunks : (source as KnowledgeSource).chunks) ||
    [];

  // run test query
  const handleRunTest = () => {
    if (!testInput.trim()) return;

    testQueryMutation(
      { query: testInput.trim() },
      {
        onSuccess: (res: any) => {
          const resData = res?.data || res;
          setApiTestResponse(resData);
        },
        onError: (error: AxiosError<any>) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to test query";
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {name}
            </h1>
            <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span className="truncate max-w-50">
                  {url || filePath || `${category} • ${type}`}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <div
                className={cn(
                  "flex items-center gap-1 font-medium",
                  status === "Indexed"
                    ? "text-emerald-500"
                    : status === "Error"
                      ? "text-rose-500"
                      : "text-amber-500",
                )}
              >
                {status === "Indexed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : status === "Error" ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                )}
                <span>{status}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Last updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onReindex?.(id)}
            disabled={isReindexing}
            className="h-11 bg-white border-gray-100 font-semibold gap-2"
          >
            {isReindexing && <Spinner />} Re-Index
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(source)}
              className="h-11 bg-white border-gray-100 font-semibold gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {/* {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(id)}
              className="h-11 bg-white border-gray-100 text-rose-500 hover:text-rose-600 font-semibold gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )} */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content Box with See More / Show Less limit */}
          {content && (() => {
            const CONTENT_LIMIT = 350;
            const isLongContent = content.length > CONTENT_LIMIT;
            const displayedContent =
              isLongContent && !isContentExpanded
                ? content.slice(0, CONTENT_LIMIT) + "..."
                : content;

            return (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Source Content</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed font-mono whitespace-pre-wrap transition-all">
                    {displayedContent}
                  </p>
                  {isLongContent && (
                    <button
                      type="button"
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-1 pl-1 cursor-pointer"
                    >
                      <span>{isContentExpanded ? "Show less" : "See more"}</span>
                      {isContentExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Chunks Table Header & Search */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">
                Extracted Articles & Sections ({chunks.length})
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles and section chunks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-11 bg-white border-gray-100 text-sm rounded-2xl"
              />
            </div>
            <ArticleTable data={chunks} searchQuery={searchQuery} />
          </div>
        </div>

        {/* Sidebar Widgets Column */}
        <div className="space-y-6">
          {/* AI Processing Status */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <Database className="size-5 text-[#4F46E5]" />
              <h3 className="font-bold">AI Processing Status</h3>
            </div>
            <div className="flex items-start gap-1.5 text-xs font-medium leading-none">
              <CheckCircle2 className="size-3 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-900">
                  {aiStatus.status}
                </span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Documents are processed and converted into embeddings so the
                  AI can retrieve relevant information when generating
                  responses.
                </p>
              </div>
            </div>

            <div className="space-y-2 border border-gray-100 p-4 rounded-2xl mt-4 bg-gray-50/50">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-700">Processing Progress</span>
                <span className="text-emerald-500">{aiStatus.progress}%</span>
              </div>
              <Progress
                value={aiStatus.progress}
                className="rounded-full h-2"
              />
              <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last indexed: {aiStatus.last_indexed}</span>
              </div>
            </div>
          </div>

          {/* Source Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">Source Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Source Type</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {sourceDetails.source_type}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Articles Extracted</span>
                <span className="font-semibold text-gray-900">
                  {sourceDetails.articles_extracted}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-semibold text-gray-900">{category}</span>
              </div>
              {fileSize && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">File Size</span>
                  <span className="font-semibold text-gray-900">
                    {fileSize}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Indexed</span>
                <span className="font-semibold text-gray-900">
                  {sourceDetails.last_indexed}
                </span>
              </div>
            </div>
          </div>

          {/* Test AI Query Card */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 bg-white">
              <div className="flex items-center gap-3">
                <BrainSvg />
                <span className="font-bold text-gray-900">Test AI Query</span>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <textarea
                placeholder="Ask a question to test knowledge retrieval..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full h-24 p-4 rounded-lg bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all text-sm outline-none resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleRunTest}
                  disabled={isLoadingTest || !testInput.trim()}
                  className="h-11 px-6 bg-linear-to-r from-secondary to-primary text-foreground font-semibold gap-2"
                >
                  {isLoadingTest ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Run Test
                </Button>
              </div>

              {apiTestResponse?.ai_response && (
                <div className="pt-2">
                  <div className="text-sm font-semibold mb-2">AI Response</div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {apiTestResponse?.ai_response}
                  </p>
                </div>
              )}

              {apiTestResponse?.sources_used && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500">
                    Sources Used
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Response time:{" "}
                      {apiTestResponse?.sources_used?.response_time}
                    </span>
                    <span>•</span>
                    <span>Model: {apiTestResponse?.sources_used?.model}</span>
                    <span>•</span>
                    <span>
                      Embedding: {apiTestResponse?.sources_used?.embedding}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
