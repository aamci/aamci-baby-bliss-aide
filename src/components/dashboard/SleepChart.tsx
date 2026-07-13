import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { SleepLog } from "@/hooks/useLogs";

export default function SleepChart({ logs }: { logs: SleepLog[] }) {
  const days: Record<string, { day: string; nuit: number; sieste: number }> = {};
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    days[k] = { day: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), nuit: 0, sieste: 0 };
  }
  logs.forEach((l) => {
    if (!l.duration_min) return;
    const k = l.start_at.slice(0, 10);
    if (!days[k]) return;
    const h = l.duration_min / 60;
    if (l.kind === "night") days[k].nuit += h; else days[k].sieste += h;
  });
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={Object.values(days)} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={1} />
          <YAxis tick={{ fontSize: 10 }} unit="h" />
          <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)} h`} contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="nuit" stackId="a" fill="hsl(var(--primary))" name="Nuit" />
          <Bar dataKey="sieste" stackId="a" fill="hsl(var(--medical-orange))" name="Sieste" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}