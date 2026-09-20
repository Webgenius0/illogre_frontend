import type { KnowledgeBaseStats } from "@/lib/types/knowledge-base";

interface KnowledgeBaseStatsProps {
  stats: KnowledgeBaseStats[];
}

export function KnowledgeBaseStats({ stats }: KnowledgeBaseStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats?.map((stat: KnowledgeBaseStats, index: number) => (
        <div
          key={index}
          className="rounded-2xl bg-white p-6 border border-gray-100"
        >
          <div className="text-sm font-medium text-muted-foreground mb-4">
            {stat.name}
          </div>
          <div className="text-3xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
