import { LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Line } from "recharts";
import { getWhoStandard, ageInMonths } from "@/lib/whoStandards";

type M = { id: string; measured_at: string; value: number; measurement_type: string };

export default function GrowthChart({
  measurements,
  birthDate,
  gender,
  kind = "weight",
}: { measurements: M[]; birthDate: string; gender: string | null; kind?: "weight" | "height" }) {
  const filtered = measurements.filter((m) => m.measurement_type === kind);
  const std = getWhoStandard(kind, gender);

  const points = std.map((s) => {
    const mAtAge = filtered
      .map((m) => ({ ...m, age: ageInMonths(birthDate, new Date(m.measured_at)) }))
      .filter((m) => Math.abs(m.age - s.month) < 1.5)
      .sort((a, b) => Math.abs(a.age - s.month) - Math.abs(b.age - s.month))[0];
    return { month: s.month, p3: s.p3, p50: s.p50, p97: s.p97, child: mAtAge ? Number(mAtAge.value) : null };
  });

  const unit = kind === "weight" ? "kg" : "cm";

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" tickFormatter={(v) => `${v}m`} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: any) => (v == null ? "-" : `${v} ${unit}`)} labelFormatter={(l) => `${l} mois`} contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="p97" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.08} name="P97" />
          <Line type="monotone" dataKey="p50" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" dot={false} name="Médiane OMS" />
          <Line type="monotone" dataKey="child" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} name="Votre enfant" connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}