export function TeamStats({ data }: { data?: any }) {
  const stats = [
    {
      label: "Team Members",
      value: data?.total_members ?? 0,
      color: "text-gray-900",
    },
    {
      label: "Online Now",
      value: data?.online_now ?? 0,
      color: "text-gray-900",
    },
    {
      label: "Total Resolved",
      value: data?.total_resolved ?? 0,
      color: "text-gray-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl border border-gray-100 space-y-2"
        >
          <p className="text-gray-500 font-medium text-base">{stat.label}</p>
          <p className={`text-4xl font-bold tracking-tighter ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
