import type { DiaperLog } from "@/hooks/useLogs";

export default function DiaperHeatmap({ logs }: { logs: DiaperLog[] }) {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const now = new Date();
  logs.forEach((l) => {
    const d = new Date(l.changed_at);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400_000);
    if (diff >= 7) return;
    const dow = (d.getDay() + 6) % 7;
    grid[dow][d.getHours()]++;
  });
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[420px]">
        <div className="grid grid-cols-[20px_repeat(24,minmax(0,1fr))] gap-0.5 text-[8px] text-muted-foreground mb-1">
          <div />
          {Array.from({ length: 24 }).map((_, h) => <div key={h} className="text-center">{h % 3 === 0 ? h : ""}</div>)}
        </div>
        {grid.map((row, i) => (
          <div key={i} className="grid grid-cols-[20px_repeat(24,minmax(0,1fr))] gap-0.5 mb-0.5">
            <div className="text-[10px] text-muted-foreground flex items-center">{dayLabels[i]}</div>
            {row.map((v, h) => (
              <div key={h} className="aspect-square rounded-sm" style={{ backgroundColor: v === 0 ? "hsl(var(--muted))" : `hsl(var(--primary) / ${0.25 + (v / max) * 0.75})` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}