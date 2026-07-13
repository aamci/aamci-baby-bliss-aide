import { useState } from "react";
import { Milk, Apple, Baby, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFeedingLogs, useAddFeedingLog, useDeleteFeedingLog, type FeedingLog } from "@/hooks/useLogs";

const presets = [30, 60, 90, 120, 150, 180, 210, 240];

export default function FeedingTab({ childId }: { childId?: string }) {
  const { data: logs = [] } = useFeedingLogs(childId);
  const add = useAddFeedingLog();
  const del = useDeleteFeedingLog();
  const [kind, setKind] = useState<"breast" | "bottle" | "solid">("bottle");
  const [amount, setAmount] = useState("");
  const [food, setFood] = useState("");

  const submit = () => {
    if (!childId) return;
    const payload: any = { child_id: childId, kind };
    if (kind === "bottle") payload.amount_ml = amount ? Number(amount) : null;
    if (kind === "solid") payload.food = food || "Repas";
    add.mutate(payload, { onSuccess: () => { toast.success("Repas enregistré"); setAmount(""); setFood(""); }, onError: (e) => toast.error(e.message) });
  };

  const today = logs.filter((l) => new Date(l.fed_at).toDateString() === new Date().toDateString());
  const todayMl = today.reduce((s, l) => s + (l.amount_ml || 0), 0);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="medical-card space-y-3">
        <div className="flex justify-between"><div><p className="text-xs text-muted-foreground">Aujourd'hui</p><p className="text-lg font-bold text-foreground">{today.length} repas · {todayMl} ml</p></div><Milk className="w-8 h-8 text-primary" /></div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setKind("breast")} className={`py-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 ${kind === "breast" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Baby className="w-4 h-4" />Sein</button>
          <button onClick={() => setKind("bottle")} className={`py-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 ${kind === "bottle" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Milk className="w-4 h-4" />Biberon</button>
          <button onClick={() => setKind("solid")} className={`py-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 ${kind === "solid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Apple className="w-4 h-4" />Solide</button>
        </div>
        {kind === "bottle" && (
          <>
            <div className="grid grid-cols-4 gap-2">{presets.map((p) => (<button key={p} onClick={() => setAmount(String(p))} className={`py-2 rounded-lg text-xs font-medium ${amount === String(p) ? "bg-accent text-accent-foreground border-2 border-primary" : "bg-muted text-muted-foreground"}`}>{p}ml</button>))}</div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Quantité (ml)" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </>
        )}
        {kind === "solid" && (<input type="text" value={food} onChange={(e) => setFood(e.target.value)} placeholder="Aliment (ex: purée carotte)" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />)}
        <Button onClick={submit} disabled={add.isPending || !childId} className="w-full h-12 rounded-xl">Enregistrer</Button>
      </div>
      <div className="space-y-2">
        {logs.slice(0, 20).map((l: FeedingLog) => (
          <div key={l.id} className="medical-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-medical-light-blue text-primary flex items-center justify-center">{l.kind === "breast" ? <Baby className="w-4 h-4" /> : l.kind === "bottle" ? <Milk className="w-4 h-4" /> : <Apple className="w-4 h-4" />}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{l.kind === "breast" ? "Sein" : l.kind === "bottle" ? `Biberon ${l.amount_ml || "?"} ml` : l.food || "Repas solide"}</p>
              <p className="text-xs text-muted-foreground">{new Date(l.fed_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <button onClick={() => del.mutate({ id: l.id, child_id: l.child_id })} aria-label="Supprimer" className="p-2 text-muted-foreground"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}