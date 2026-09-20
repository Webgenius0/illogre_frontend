export type SourceStatus = "Indexed" | "Processing" | "Error";

export type SourceType = "text" | "document";

export type SourceCategory = "Policies" | "FAQs";

export interface KnowledgeSource {
  id: string;
  name: string;
  category: SourceCategory;
  type: SourceType;
  status: SourceStatus;
  articleCount: number;
  fileSize?: string;
  lastSynced: string;
  url?: string;
  chunks?: KnowledgeArticle[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content?: string;
  lastUpdated: string;
  status: "Resolved" | "Processing" | "Error" | "Indexed";
}

export interface KnowledgeBaseStats {
  name: string;
  value: number;
}

export interface AIStatus {
  status: string;
  progress: number;
  last_indexed: string;
}

export interface SourceDetailsInfo {
  source_type: string;
  articles_extracted: number;
  last_indexed: string;
}

export interface SourcesUsed {
  response_time: string;
  model: string;
  embedding: string;
}

export interface TestQuery {
  ai_response: string;
  sources_used: SourcesUsed;
}

export interface KnowledgeChunk {
  id: number | string;
  title: string;
  category: string;
  status: string;
  last_updated: string;
  content?: string;
}

export interface KnowledgeBaseDetailData {
  id: number | string;
  name: string;
  type: string;
  category: string;
  status: string;
  file_path?: string | null;
  file_size?: string | null;
  content?: string | null;
  article_count: number;
  last_updated: string;
  ai_status?: AIStatus;
  source_details?: SourceDetailsInfo;
  test_query?: TestQuery;
  chunks?: KnowledgeChunk[];
}
