"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useKnowledgeBaseDetails,
  useDeleteKnowledgeSource,
  useReindexKnowledgeSource,
  useTestKnowledgeQuery,
} from "@/hooks/knowledge-base.api";
import { SourceDetailView } from "@/components/knowledge-base/SourceDetailView";
import { EditSourceModal } from "@/components/knowledge-base/EditSourceModal";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KnowledgeBaseDetailData } from "@/lib/types/knowledge-base";

export default function KnowledgeBaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: response, isLoading, isError } = useKnowledgeBaseDetails(
    id as string,
  );
  const { mutate: deleteSource } = useDeleteKnowledgeSource(id as string);
  const { mutate: reindexSource, isPending: isReindexing } =
    useReindexKnowledgeSource(id as string);
  const { mutate: testQuery, isPending: isTestingQuery } =
    useTestKnowledgeQuery(id as string);

  const [editingSource, setEditingSource] = useState<KnowledgeBaseDetailData | null>(
    null,
  );

  const detailData: KnowledgeBaseDetailData | null = response?.data || null;

  const handleBack = () => {
    router.push("/knowledge_base");
  };

  const handleEdit = (source: KnowledgeBaseDetailData) => {
    setEditingSource(source);
  };

  const handleDelete = (sourceId: string | number) => {
    if (
      window.confirm("Are you sure you want to delete this knowledge source?")
    ) {
      deleteSource(undefined, {
        onSuccess: () => {
          router.push("/knowledge_base");
        },
      });
    }
  };

  const handleReindex = () => {
    reindexSource({});
  };

  const handleTestQuery = (query: string) => {
    testQuery({ query });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 animate-in fade-in duration-300">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground font-medium">
          Loading knowledge base details...
        </span>
      </div>
    );
  }

  if (isError || !detailData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 font-bold text-xl">
          !
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">
            Knowledge Source Not Found
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            We couldn't retrieve the requested knowledge source details or it may have been deleted.
          </p>
        </div>
        <Link href="/knowledge_base">
          <Button variant="outline" className="gap-2 font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Base
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
      <SourceDetailView
        source={detailData}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReindex={handleReindex}
        isReindexing={isReindexing}
        onTestQuery={handleTestQuery}
        isTestingQuery={isTestingQuery}
      />

      <EditSourceModal
        source={editingSource}
        open={!!editingSource}
        onOpenChange={(open) => !open && setEditingSource(null)}
      />
    </div>
  );
}
