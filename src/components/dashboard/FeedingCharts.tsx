import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { FeedingLog } from "@/hooks/useLogs";

const COLORS = ["hsl(var(--primary))", "hsl(var(--medical-orange))", "hsl(var(--success))"];

export default function FeedingCharts({ logs }: { logs: FeedingLog[] }) {
  const days: Record<string, { day: string; ml: number }> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    days[k] = { day: d.toLocaleDateString("fr-FR", { weekday: "short" }), ml: 0 };
  }
  const kinds = { Sein: 0, Biberon: 0, Solide: 0 };
  logs.forEach((l) => {
    const k = l.fed_at.slice(0, 10);
    if (days[k] && l.amount_ml) days[k].ml += l.amount_ml;
    if (l.kind === "breast") kinds.Sein++;
    else if (l.kind === "bottle") kinds.Biberon++;
    else kinds.Solide++;
  });
  const pie = Object.entries(kinds).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  return (
    <div className="space-y-4">
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={Object.values(days)} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="ml" />
            <Tooltip formatter={(v: any) => `${v} ml`} contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="ml" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {pie.length > 0 && (
        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                {pie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}