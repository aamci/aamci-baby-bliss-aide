import { ArrowLeft, Settings, CalendarPlus, Check, Clock, ChevronDown, Baby, HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import PageTransition from "@/components/PageTransition";
import ListenButton from "@/components/ListenButton";
import { useReminders, useSetReminderState, type Reminder } from "@/hooks/useReminders";
import { CARE_TYPE_LABEL } from "@/lib/carePlan";
import { toast } from "sonner";

const PHASE_STYLE: Record<string, { chip: string; label: string; card: string }> = {
  open: { chip: "bg-medical-light-green text-success", label: "C'est le moment", card: "border-l-4 border-success" },
  "still-possible": { chip: "bg-medical-light-orange text-medical-orange", label: "Encore possible", card: "border-l-4 border-medical-orange" },
  soon: { chip: "bg-medical-light-blue text-primary", label: "Bientôt", card: "border-l-4 border-primary" },
  future: { chip: "bg-muted text-muted-foreground", label: "À prévoir", card: "" },
  done: { chip: "bg-muted text-muted-foreground", label: "Fait", card: "" },
};

const ReminderCard = ({ reminder, onDone, onSnooze }: { reminder: Reminder; onDone: () => void; onSnooze: () => void }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const style = PHASE_STYLE[reminder.phase] ?? PHASE_STYLE.future;
  const spoken = `${reminder.step.title}. ${reminder.message} ${reminder.step.why} ${reminder.step.prepare ?? ""}`;

  return (
    <article className={`medical-card space-y-2 ${style.card}`} aria-label={`${reminder.step.title} pour ${reminder.child.first_name}`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0 text-xl" aria-hidden="true">
          {reminder.step.pictogram}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.chip}`}>{style.label}</span>
            <span className="text-[10px] text-muted-foreground">{CARE_TYPE_LABEL[reminder.step.type]}</span>
          </div>
          <h3 className="text-sm font-bold text-foreground mt-1 leading-tight">{reminder.step.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{reminder.message}</p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
            {reminder.windowLabel}
          </p>
          {reminder.snoozedUntil && (
            <p className="text-[11px] text-primary mt-1">Rappel reporté au {format(reminder.snoozedUntil, "d MMMM", { locale: fr })}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 text-[11px] font-semibold text-primary min-h-11"
      >
        Pourquoi c'est utile ?
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="bg-muted/60 rounded-xl p-3 space-y-2">
          <p className="text-xs text-foreground leading-relaxed">{reminder.step.why}</p>
          {reminder.step.prepare && <p className="text-xs text-muted-foreground">💡 {reminder.step.prepare}</p>}
          <ListenButton text={spoken} label="Écouter l'explication" />
        </div>
      )}

      {reminder.phase !== "done" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => navigate("/appointments")}
            className="flex-1 min-h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <CalendarPlus className="w-4 h-4" aria-hidden="true" /> Prendre RDV
          </button>
          <button
            onClick={onDone}
            className="min-h-11 px-3 rounded-xl bg-muted text-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
            aria-label={`Marquer ${reminder.step.title} comme fait`}
          >
            <Check className="w-4 h-4" aria-hidden="true" /> Fait
          </button>
          <button
            onClick={onSnooze}
            className="min-h-11 px-3 rounded-xl bg-muted text-muted-foreground text-xs font-bold active:scale-95 transition-transform"
            aria-label={`Me le rappeler plus tard pour ${reminder.step.title}`}
          >
            Plus tard
          </button>
        </div>
      )}
    </article>
  );
};

const Notifications = () => {
  const navigate = useNavigate();
  const { active, upcoming, done, hasChild, isLoading } = useReminders();
  const setState = useSetReminderState();

  const markDone = (r: Reminder) =>
    setState.mutate(
      {
        child_id: r.child.id,
        reminder_key: r.step.key,
        status: "done",
        completed_at: new Date().toISOString().split("T")[0],
      },
      { onSuccess: () => toast.success("Bien noté, c'est fait 🎉") }
    );

  const snooze = (r: Reminder) =>
    setState.mutate(
      {
        child_id: r.child.id,
        reminder_key: r.step.key,
        status: "snoozed",
        snoozed_until: addDays(new Date(), 14).toISOString().split("T")[0],
      },
      { onSuccess: () => toast.success("On vous le rappellera dans 2 semaines, sans pression") }
    );

  return (
    <PageTransition>
      <main className="min-h-screen bg-background max-w-lg mx-auto pb-8" aria-label="Rappels du parcours de soins">
        <div className="px-4 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-foreground" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">Mes rappels</h1>
              <p className="text-xs text-muted-foreground">
                {active.length > 0 ? `${active.length} chose${active.length > 1 ? "s" : ""} à prévoir` : "Rien d'urgent aujourd'hui"}
              </p>
            </div>
          </div>
          <button onClick={() => navigate("/notification-settings")} className="p-2 min-h-11 min-w-11 text-muted-foreground" aria-label="Paramètres de notifications">
            <Settings className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-4 space-y-5">
          {!hasChild && !isLoading && (
            <button className="medical-card w-full text-left space-y-2 bg-accent" onClick={() => navigate("/child-profile")}>
              <Baby className="w-8 h-8 text-primary" aria-hidden="true" />
              <p className="font-bold text-sm">Ajoutez votre enfant</p>
              <p className="text-xs text-muted-foreground">Dès sa date de naissance connue, nous calculons tous ses rendez-vous de santé et ses vaccins, et nous vous prévenons au bon moment.</p>
            </button>
          )}

          {hasChild && (
            <div className="medical-card bg-accent flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chaque étape a une <strong className="text-foreground">période souple</strong>, pas une date couperet. Si vous êtes en retard, ce n'est pas grave : tout reste rattrapable.
              </p>
            </div>
          )}

          {active.length > 0 && (
            <section className="space-y-2" aria-label="À prévoir maintenant">
              <h2 className="text-sm font-bold text-foreground">À prévoir maintenant</h2>
              {active.map((r) => (
                <ReminderCard key={r.key} reminder={r} onDone={() => markDone(r)} onSnooze={() => snooze(r)} />
              ))}
            </section>
          )}

          {upcoming.length > 0 && (
            <section className="space-y-2" aria-label="Prochaines étapes">
              <h2 className="text-sm font-bold text-foreground">Prochaines étapes</h2>
              {upcoming.slice(0, 6).map((r) => (
                <ReminderCard key={r.key} reminder={r} onDone={() => markDone(r)} onSnooze={() => snooze(r)} />
              ))}
            </section>
          )}

          {done.length > 0 && (
            <section className="space-y-2" aria-label="Étapes réalisées">
              <h2 className="text-sm font-bold text-muted-foreground">Déjà fait ({done.length})</h2>
              {done.slice(0, 5).map((r) => (
                <div key={r.key} className="medical-card flex items-center gap-3 opacity-70">
                  <span className="text-lg" aria-hidden="true">{r.step.pictogram}</span>
                  <p className="text-xs font-semibold text-foreground flex-1 truncate">{r.step.title}</p>
                  <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </PageTransition>
  );
};

export default Notifications;
