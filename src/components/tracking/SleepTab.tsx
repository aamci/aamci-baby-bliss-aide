import { useState, useEffect } from "react";
import { Moon, Sun, Trash2, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSleepLogs, useAddSleepLog, useDeleteSleepLog, type SleepLog } from "@/hooks/useLogs";

export default function SleepTab({ childId }: { childId?: string }) {
  const { data: logs = [] } = useSleepLogs(childId);
  const add = useAddSleepLog();
  const del = useDeleteSleepLog();
  const [timerStart, setTimerStart] = useState<number | null>(() => {
    if (!childId) return null;
    const s = localStorage.getItem(`sleepTimer:${childId}`);
    return s ? Number(s) : null;
  });
  const [now, setNow] = useState(Date.now());
  const [kind, setKind] = useState<"night" | "nap">("nap");

  useEffect(() => {
    if (!timerStart) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerStart]);

  const startTimer = () => {
    if (!childId) return;
    const t = Date.now();
    setTimerStart(t);
    localStorage.setItem(`sleepTimer:${childId}`, String(t));
  };
  const stopTimer = () => {
    if (!childId || !timerStart) return;
    add.mutate(
      { child_id: childId, start_at: new Date(timerStart).toISOString(), end_at: new Date().toISOString(), kind },
      { onSuccess: () => { toast.success("Sommeil enregistré"); setTimerStart(null); localStorage.removeItem(`sleepTimer:${childId}`); }, onError: (e) => toast.error(e.message) },
    );
  };

  const totalToday = logs.filter((l) => new Date(l.start_at).toDateString() === new Date().toDateString()).reduce((s, l) => s + (l.duration_min || 0), 0);
  const elapsed = timerStart ? Math.floor((now - timerStart) / 1000) : 0;
  const fmtSec = (s: number) => `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m${String(s % 60).padStart(2, "0")}s`;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="medical-card space-y-3">
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground">Aujourd'hui</p><p className="text-2xl font-bold text-foreground">{Math.floor(totalToday / 60)}h{String(totalToday % 60).padStart(2, "0")}</p></div>
          <Moon className="w-8 h-8 text-primary" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setKind("nap")} className={`flex-1 py-2 rounded-xl text-xs font-medium ${kind === "nap" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Sun className="w-3.5 h-3.5 inline mr-1" /> Sieste</button>
          <button onClick={() => setKind("night")} className={`flex-1 py-2 rounded-xl text-xs font-medium ${kind === "night" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Moon className="w-3.5 h-3.5 inline mr-1" /> Nuit</button>
        </div>
        {timerStart ? (
          <>
            <p className="text-center text-sm font-mono font-bold text-primary tabular-nums">{fmtSec(elapsed)}</p>
            <Button onClick={stopTimer} className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90"><Square className="w-4 h-4 mr-2" /> Arrêter</Button>
          </>
        ) : (
          <Button onClick={startTimer} disabled={!childId} className="w-full h-12 rounded-xl"><Play className="w-4 h-4 mr-2" /> Démarrer le sommeil</Button>
        )}
      </div>
      <div className="space-y-2">
        {logs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Aucun sommeil enregistré</p> : logs.slice(0, 20).map((l: SleepLog) => (
          <div key={l.id} className="medical-card flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${l.kind === "night" ? "bg-medical-light-blue text-primary" : "bg-medical-light-orange text-medical-orange"} flex items-center justify-center`}>{l.kind === "night" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{new Date(l.start_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              <p className="text-xs text-muted-foreground">{l.duration_min ? `${Math.floor(l.duration_min / 60)}h${String(l.duration_min % 60).padStart(2, "0")}` : "En cours"} · {l.kind === "night" ? "Nuit" : "Sieste"}</p>
            </div>
            <button onClick={() => del.mutate({ id: l.id, child_id: l.child_id })} aria-label="Supprimer" className="p-2 text-muted-foreground"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}