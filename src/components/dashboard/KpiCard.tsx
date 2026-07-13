import { LucideIcon } from "lucide-react";

export default function KpiCard({ icon: Icon, label, value, sub, tone = "primary" }: {
  icon: LucideIcon; label: string; value: string; sub?: string;
  tone?: "primary" | "orange" | "green" | "red";
}) {
  const toneMap = {
    primary: "bg-medical-light-blue text-primary",
    orange: "bg-medical-light-orange text-medical-orange",
    green: "bg-medical-light-green text-success",
    red: "bg-medical-light-red text-destructive",
  } as const;
  return (
    <div className="medical-card space-y-2 min-w-0">
      <div className={`w-9 h-9 rounded-xl ${toneMap[tone]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] font-medium text-muted-foreground truncate">{label}</p>
      <p className="text-lg font-bold text-foreground truncate">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}