import { useState } from "react";
import { Droplet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDiaperLogs, useAddDiaperLog, useDeleteDiaperLog, type DiaperLog } from "@/hooks/useLogs";

export default function DiaperTab({ childId }: { childId?: string }) {
  const { data: logs = [] } = useDiaperLogs(childId);
  const add = useAddDiaperLog();
  const del = useDeleteDiaperLog();
  const [kind, setKind] = useState<"wet" | "dirty" | "both">("wet");
  const submit = () => {
    if (!childId) return;
    add.mutate({ child_id: childId, kind }, { onSuccess: () => toast.success("Couche enregistrée"), onError: (e) => toast.error(e.message) });
  };
  const today = logs.filter((l) => new Date(l.changed_at).toDateString() === new Date().toDateString());
  const label = (k: string) => k === "wet" ? "Urine" : k === "dirty" ? "Selles" : "Mixte";
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="medical-card space-y-3">
        <div className="flex justify-between"><div><p className="text-xs text-muted-foreground">Aujourd'hui</p><p className="text-lg font-bold text-foreground">{today.length} change{today.length > 1 ? "s" : ""}</p></div><Droplet className="w-8 h-8 text-primary" /></div>
        <div className="grid grid-cols-3 gap-2">{(["wet", "dirty", "both"] as const).map((k) => (<button key={k} onClick={() => setKind(k)} className={`py-3 rounded-xl text-xs font-medium ${kind === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{label(k)}</button>))}</div>
        <Button onClick={submit} disabled={add.isPending || !childId} className="w-full h-12 rounded-xl">Ajouter le change</Button>
      </div>
      <div className="space-y-2">
        {logs.slice(0, 20).map((l: DiaperLog) => (
          <div key={l.id} className="medical-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-medical-light-blue text-primary flex items-center justify-center"><Droplet className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground truncate">{label(l.kind)}</p><p className="text-xs text-muted-foreground">{new Date(l.changed_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div>
            <button onClick={() => del.mutate({ id: l.id, child_id: l.child_id })} aria-label="Supprimer" className="p-2 text-muted-foreground"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}