import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

export default function MilestoneRadar({ milestones }: { milestones: any[] }) {
  const groups: Record<string, { total: number; done: number }> = {};
  milestones.forEach((m) => {
    const g = m.domain || "Général";
    if (!groups[g]) groups[g] = { total: 0, done: 0 };
    groups[g].total++;
    if (m.acquired) groups[g].done++;
  });
  const data = Object.entries(groups).map(([domain, v]) => ({ domain, pct: Math.round((v.done / Math.max(1, v.total)) * 100) }));
  if (data.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">Aucun jalon</p>;
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Radar dataKey="pct" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
          <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}