"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KnowledgeBaseStats } from "@/components/knowledge-base/KnowledgeBaseStats";
import { SourceCard } from "@/components/knowledge-base/SourceCard";
import { EditSourceModal } from "@/components/knowledge-base/EditSourceModal";
import { type KnowledgeSource } from "@/lib/types/knowledge-base";
import { cn } from "@/lib/utils";
import { useKnowledgeBaseList } from "@/hooks/knowledge-base.api";

const categories = ["All", "FAQs", "Policies"];

function SourceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 relative overflow-hidden animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl">
          <div className="h-5 w-5 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>

      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />

      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-14 bg-gray-100 rounded" />
        <span className="text-gray-300">•</span>
        <div className="h-3 w-10 bg-gray-100 rounded" />
      </div>

      <div className="h-px w-full bg-gray-100 mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <span className="text-gray-300">•</span>
          <div className="h-3 w-10 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-gray-100 rounded-full" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // API Hooks
  const { data: knowledgeData, isLoading } = useKnowledgeBaseList();

  const sources: KnowledgeSource[] =
    knowledgeData?.data?.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      category: item.category || "Policies",
      type: item.type === "file" ? "document" : "text",
      status: item.status || (item.is_indexed ? "Indexed" : item.error_message ? "Error" : "Processing"),
      articleCount: item.article_count || 0,
      fileSize: item.file_size,
      lastSynced: item.last_updated || item.updated_at || "Recently",
      url: item.file_path || item.file_url || "",
      chunks: item.chunks || [],
    })) || [];

  const stats = [
    { name: "Total Sources", value: knowledgeData?.stats?.total_sources ?? sources.length },
    {
      name: "Indexed",
      value: knowledgeData?.stats?.indexed ?? sources.filter((s) => s.status === "Indexed").length,
    },
    {
      name: "Processing",
      value: knowledgeData?.stats?.processing ?? sources.filter((s) => s.status === "Processing").length,
    },
    {
      name: "Errors",
      value: knowledgeData?.stats?.errors ?? sources.filter((s) => s.status === "Error").length,
    },
  ];

  const filteredSources = sources.filter((source) => {
    const matchesTab = activeTab === "All" || source.category === activeTab;
    const matchesSearch = (source?.name || "")
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCardClick = (source: KnowledgeSource) => {
    router.push(`/knowledge_base/${source.id}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          Knowledge Base
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage AI training sources and documentation
        </p>
      </div>
      <KnowledgeBaseStats stats={stats} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex bg-white p-1 rounded-md border border-gray-100 overflow-x-auto no-scrollbar whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === cat
                  ? "bg-linear-to-r from-secondary to-primary"
                  : " hover:bg-gray-50",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
            <Input
              placeholder="Search knowledge sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-11 rounded-md bg-white border-gray-100 text-sm w-full"
            />
          </div>
          <EditSourceModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? [...Array(6)].map((_, i) => <SourceCardSkeleton key={i} />)
          : filteredSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onClick={handleCardClick}
              />
            ))}

        {filteredSources.length === 0 && !isLoading && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No sources found
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              We couldn't find any knowledge sources matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
