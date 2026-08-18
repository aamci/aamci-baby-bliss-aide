import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CalendarPlus, Check, X, CheckCircle2, Clock, Users, ListChecks, Bell,
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";
import PageTransition from "@/components/PageTransition";
import ListenButton from "@/components/ListenButton";
import { useChildren } from "@/hooks/useChildren";
import { useAppointments, useUpdateAppointment } from "@/hooks/useAppointments";
import { useReminders } from "@/hooks/useReminders";
import { CARE_PLAN, CARE_TYPE_LABEL } from "@/lib/carePlan";
import { toast } from "sonner";

type Status = "upcoming" | "confirmed" | "cancelled" | "done";

const STATUS_META: Record<Status, { label: string; chip: string }> = {
  upcoming: { label: "À confirmer", chip: "bg-medical-light-blue text-primary" },
  confirmed: { label: "Confirmé", chip: "bg-medical-light-green text-success" },
  cancelled: { label: "Annulé", chip: "bg-muted text-muted-foreground line-through" },
  done: { label: "Fait", chip: "bg-medical-light-green text-success" },
};

const DEFAULT_PREP = [
  "Le carnet de santé de l'enfant",
  "La carte Vitale et l'attestation de mutuelle",
  "La liste de vos questions, même les plus simples",
];

/** Actions à préparer : issues du parcours de soins si le RDV y correspond. */
const prepFor = (name: string): string[] => {
  const lower = (name || "").toLowerCase();
  const step = CARE_PLAN.find((s) => lower.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(lower));
  const extra = step?.prepare ? [step.prepare] : [];
  return [...extra, ...DEFAULT_PREP];
};

const dateLabel = (dateStr: string, time?: string | null) => {
  const d = parseISO(dateStr);
  const t = time ? ` à ${time.slice(0, 5)}` : "";
  if (isToday(d)) return `Aujourd'hui${t}`;
  if (isTomorrow(d)) return `Demain${t}`;
  return format(d, "EEEE d MMMM yyyy", { locale: fr }) + t;
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const { data: children } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const selectedChild = children?.find((c) => c.id === selectedChildId) ?? children?.[0] ?? null;
  const { data: appointments = [], isLoading } = useAppointments(selectedChild?.id);
  const updateMut = useUpdateAppointment();
  const { active, upcoming: futureReminders } = useReminders(selectedChild?.id);
  const [openPrep, setOpenPrep] = useState<string | null>(null);

  const { next, history } = useMemo(() => {
    const withDate = appointments.filter((a: any) => !!a.visit_date);
    const next = withDate
      .filter((a: any) => a.status !== "done" && a.status !== "cancelled" && !isPast(parseISO(a.visit_date)))
      .sort((a: any, b: any) => a.visit_date.localeCompare(b.visit_date));
    const history = withDate
      .filter((a: any) => a.status === "done" || a.status === "cancelled" || isPast(parseISO(a.visit_date)))
      .sort((a: any, b: any) => b.visit_date.localeCompare(a.visit_date));
    return { next, history };
  }, [appointments]);

  const setStatus = (appt: any, status: Status) => {
    if (!selectedChild) return;
    updateMut.mutate(
      { id: appt.id, child_id: selectedChild.id, status },
      {
        onSuccess: () => toast.success(`Rendez-vous ${STATUS_META[status].label.toLowerCase()}`),
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const notPlanned = active.filter((r) => {
    const t = r.step.title.toLowerCase();
    return !appointments.some((a: any) => (a.name || "").toLowerCase().includes(t) && a.status !== "cancelled");
  });

  const AppointmentCard = ({ appt, past }: { appt: any; past?: boolean }) => {
    const status = (appt.status || "upcoming") as Status;
    const meta = STATUS_META[status] ?? STATUS_META.upcoming;
    const days = differenceInCalendarDays(parseISO(appt.visit_date), new Date());
    const prep = prepFor(appt.name);
    const isOpen = openPrep === appt.id;

    return (
      <article className="medical-card space-y-3" aria-label={appt.name}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
            <h3 className="text-sm font-bold text-foreground mt-1 leading-tight break-words">{appt.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
              {dateLabel(appt.visit_date, appt.visit_time)}
            </p>
            {appt.doctor_name && <p className="text-[11px] text-muted-foreground">Avec {appt.doctor_name}</p>}
            {!past && days >= 0 && (
              <p className="text-[11px] text-primary mt-0.5">
                {days === 0 ? "C'est aujourd'hui" : `Dans ${days} jour${days > 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </div>

        {!past && (
          <div>
            <button
              onClick={() => setOpenPrep(isOpen ? null : appt.id)}
              aria-expanded={isOpen}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary min-h-11"
            >
              <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />
              À préparer avant le rendez-vous
            </button>
            {isOpen && (
              <div className="bg-muted/60 rounded-xl p-3 space-y-2">
                <ul className="space-y-1.5">
                  {prep.map((p) => (
                    <li key={p} className="text-xs text-foreground flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <ListenButton text={`Avant le rendez-vous ${appt.name}. ${prep.join(". ")}`} label="Écouter la préparation" />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {status !== "confirmed" && status !== "done" && (
            <button
              onClick={() => setStatus(appt, "confirmed")}
              className="flex-1 min-w-[100px] min-h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Confirmer
            </button>
          )}
          {status !== "done" && (
            <button
              onClick={() => setStatus(appt, "done")}
              className="min-h-11 px-3 rounded-xl bg-muted text-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4" aria-hidden="true" /> Fait
            </button>
          )}
          {status !== "cancelled" && status !== "done" && (
            <button
              onClick={() => setStatus(appt, "cancelled")}
              className="min-h-11 px-3 rounded-xl bg-muted text-muted-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" aria-hidden="true" /> Annuler
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto px-4 pt-6 pb-24 space-y-5">
        <header className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">Mes RDV</h1>
            <p className="text-xs text-muted-foreground truncate">
              {selectedChild ? `Prochains examens de ${selectedChild.first_name}` : "Ajoutez un enfant pour commencer"}
            </p>
          </div>
          <button
            onClick={() => navigate("/appointments")}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
            aria-label="Ajouter un rendez-vous"
          >
            <CalendarPlus className="w-5 h-5" />
          </button>
        </header>

        {children && children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                  selectedChild?.id === child.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {child.first_name}
              </button>
            ))}
          </div>
        )}

        <section aria-labelledby="next-title" className="space-y-3">
          <h2 id="next-title" className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            Prochains rendez-vous
          </h2>
          {isLoading ? (
            <div className="medical-card text-sm text-muted-foreground">Chargement…</div>
          ) : next.length === 0 ? (
            <div className="medical-card text-sm text-muted-foreground">
              Aucun rendez-vous planifié pour le moment.
            </div>
          ) : (
            next.map((a: any) => <AppointmentCard key={a.id} appt={a} />)
          )}
        </section>

        {notPlanned.length > 0 && (
          <section aria-labelledby="todo-title" className="space-y-3">
            <h2 id="todo-title" className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              À planifier bientôt
            </h2>
            {notPlanned.map((r) => (
              <article key={r.key} className="medical-card flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-xl shrink-0" aria-hidden="true">
                  {r.step.pictogram}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground">{CARE_TYPE_LABEL[r.step.type]}</span>
                  <h3 className="text-sm font-bold text-foreground leading-tight">{r.step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.message}</p>
                  <button
                    onClick={() => navigate("/appointments")}
                    className="mt-2 min-h-11 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <CalendarPlus className="w-4 h-4" aria-hidden="true" /> Prendre RDV
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {history.length > 0 && (
          <section aria-labelledby="past-title" className="space-y-3">
            <h2 id="past-title" className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Historique
            </h2>
            {history.slice(0, 10).map((a: any) => <AppointmentCard key={a.id} appt={a} past />)}
          </section>
        )}

        <button
          onClick={() => navigate("/notification-settings")}
          className="w-full medical-card flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Rappels et heures calmes</p>
            <p className="text-xs text-muted-foreground">Choisissez quand recevoir vos rappels</p>
          </div>
        </button>

        {futureReminders.length > 0 && (
          <p className="text-[11px] text-muted-foreground text-center">
            {futureReminders.length} étape{futureReminders.length > 1 ? "s" : ""} du parcours de soins prévue{futureReminders.length > 1 ? "s" : ""} plus tard.
          </p>
        )}
      </div>
    </PageTransition>
  );
};

export default MyAppointments;
