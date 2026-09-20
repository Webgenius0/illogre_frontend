import {
  FileText,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { type KnowledgeSource } from "@/lib/types/knowledge-base";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  source: KnowledgeSource;
  onClick: (source: KnowledgeSource) => void;
}

export function SourceCard({ source, onClick }: Props) {
  const getIcon = () => {
    switch (source.type) {
      case "document":
        return <FileText className="h-5 w-5 text-rose-500" />;
      case "text":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (source.status) {
      case "Indexed":
        return (
          <Badge className="flex items-center gap-1.5 text-xs bg-green-50 font-medium text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Indexed</span>
          </Badge>
        );
      case "Processing":
        return (
          <Badge className="flex items-center gap-1.5 text-xs bg-amber-50 font-medium text-amber-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Processing</span>
          </Badge>
        );
      case "Error":
        return (
          <Badge className="flex items-center gap-1.5 text-xs bg-rose-50 font-medium text-rose-500">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Error</span>
          </Badge>
        );
    }
  };

  return (
    <div
      onClick={() => onClick(source)}
      className="group bg-white rounded-2xl p-5 border border-gray-100 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
          {getIcon()}
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1 truncate pr-4">
        {source.name}
      </h3>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <span>{source.category}</span>
        <span className="text-gray-300">•</span>
        <span>{source.type}</span>
      </div>

      <div className="h-px w-full bg-gray-100 mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{source.articleCount} articles</span>
          {source.fileSize && (
            <>
              <span className="text-gray-300">•</span>
              <span>{source.fileSize}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last synced: {source.lastSynced}</span>
        </div>
      </div>
    </div>
  );
}
