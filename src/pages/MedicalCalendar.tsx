import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Syringe, Stethoscope, Baby, Target, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { useChildren } from "@/hooks/useChildren";
import { useAppointments } from "@/hooks/useAppointments";
import { useVaccines, useMilestones } from "@/hooks/useTracking";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, addWeeks,
  isSameMonth, isSameDay, isToday, parseISO, differenceInMonths, addMonths as addM,
} from "date-fns";
import { fr } from "date-fns/locale";

type EventType = "visit" | "vaccine" | "milestone";

interface CalEvent {
  id: string;
  date: Date;
  title: string;
  subtitle?: string;
  type: EventType;
  done?: boolean;
  time?: string;
}

// French mandatory visit schedule (age in months → label)
const MANDATORY_VISITS: { ageMonths: number; label: string }[] = [
  { ageMonths: 0, label: "Examen des 8 premiers jours" },
  { ageMonths: 1, label: "Visite du 1er mois" },
  { ageMonths: 2, label: "Visite du 2e mois" },
  { ageMonths: 3, label: "Visite du 3e mois" },
  { ageMonths: 4, label: "Visite du 4e mois" },
  { ageMonths: 5, label: "Visite du 5e mois" },
  { ageMonths: 6, label: "Visite du 6e mois" },
  { ageMonths: 9, label: "Visite du 9e mois" },
  { ageMonths: 12, label: "Visite des 12 mois" },
  { ageMonths: 17, label: "Visite des 16-18 mois" },
  { ageMonths: 24, label: "Visite des 24 mois" },
  { ageMonths: 36, label: "Visite des 3 ans" },
  { ageMonths: 48, label: "Visite des 4 ans" },
];

// French vaccine schedule (age in months → vaccines)
const VACCINE_SCHEDULE: { ageMonths: number; label: string }[] = [
  { ageMonths: 2, label: "DTP-Hib-HepB-Polio + Pneumocoque (1re dose)" },
  { ageMonths: 4, label: "DTP-Hib-HepB-Polio + Pneumocoque (2e dose)" },
  { ageMonths: 5, label: "Méningocoque C (1re dose)" },
  { ageMonths: 11, label: "DTP-Hib-HepB-Polio + Pneumocoque (rappel)" },
  { ageMonths: 12, label: "ROR + Méningocoque C (rappel)" },
  { ageMonths: 17, label: "ROR (rappel, 16-18 mois)" },
];

const TYPE_META: Record<EventType, { icon: typeof Syringe; label: string; dot: string; chip: string }> = {
  visit: { icon: Stethoscope, label: "Visite", dot: "bg-primary", chip: "bg-primary/10 text-primary" },
  vaccine: { icon: Syringe, label: "Vaccin", dot: "bg-destructive", chip: "bg-medical-light-red text-destructive" },
  milestone: { icon: Target, label: "Jalon", dot: "bg-success", chip: "bg-medical-light-green text-success" },
};

const MedicalCalendar = () => {
  const navigate = useNavigate();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const { data: appointments = [] } = useAppointments(firstChild?.id);
  const { data: vaccines = [] } = useVaccines(firstChild?.id);
  const { data: milestones = [] } = useMilestones(firstChild?.id);

  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const events = useMemo<CalEvent[]>(() => {
    const list: CalEvent[] = [];
    const birth = firstChild?.birth_date ? parseISO(firstChild.birth_date) : null;

    // Real appointments from DB
    appointments.forEach((a: any) => {
      if (!a.visit_date) return;
      list.push({
        id: `appt-${a.id}`,
        date: parseISO(a.visit_date),
        title: a.name,
        subtitle: a.doctor_name || undefined,
        type: "visit",
        done: a.status === "done",
        time: a.visit_time?.slice(0, 5),
      });
    });

    if (birth) {
      const childAge = differenceInMonths(new Date(), birth);
      // Scheduled mandatory visits (future ones not already covered by a real appointment)
      MANDATORY_VISITS.forEach((v) => {
        if (v.ageMonths <= childAge) return; // past
        const d = addM(birth, v.ageMonths);
        list.push({ id: `mv-${v.ageMonths}`, date: d, title: v.label, subtitle: "Visite obligatoire", type: "visit" });
      });
      // Vaccine schedule
      VACCINE_SCHEDULE.forEach((v) => {
        if (v.ageMonths <= childAge) return;
        const d = addM(birth, v.ageMonths);
        const alreadyDone = vaccines.some((db: any) => db.status === "done" && db.name && v.label.toLowerCase().includes(db.name.toLowerCase().slice(0, 6)));
        if (alreadyDone) return;
        list.push({ id: `vac-${v.ageMonths}`, date: d, title: v.label, subtitle: "Calendrier vaccinal", type: "vaccine" });
      });
    }

    // Milestones with expected date
    milestones.filter((m: any) => !m.acquired && m.expected_age).forEach((m: any) => {
      const months = parseInt(String(m.expected_age).replace(/\D/g, ""), 10);
      if (!birth || isNaN(months)) return;
      const d = addM(birth, months);
      if (d < new Date()) return;
      list.push({ id: `mil-${m.id}`, date: d, title: m.name, subtitle: `Attendu vers ${m.expected_age}`, type: "milestone" });
    });

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [appointments, vaccines, milestones, firstChild?.birth_date]);

  const eventsOn = (day: Date) => events.filter((e) => isSameDay(e.date, day));
  const selectedEvents = eventsOn(selectedDay);

  const nextEvents = useMemo(() => events.filter((e) => e.date >= new Date()).slice(0, 5), [events]);

  // Calendar grid
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(view === "month" ? monthStart : cursor, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(view === "month" ? monthEnd : cursor, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const navigate_ = (dir: number) => setCursor(view === "month" ? addMonths(cursor, dir) : addWeeks(cursor, dir));

  if (!firstChild) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-8 space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/home")} aria-label="Retour" className="p-2 -ml-2 min-h-11 min-w-11"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-xl font-bold">Calendrier médical</h1>
          </div>
          <button className="medical-card-elevated w-full text-left space-y-2" onClick={() => navigate("/child-profile")}>
            <Baby className="w-8 h-8 text-primary" />
            <p className="font-bold text-foreground">Ajoutez votre enfant</p>
            <p className="text-xs text-muted-foreground">Pour voir le calendrier des visites, vaccins et jalons.</p>
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">Calendrier médical</h1>
            <p className="text-xs text-muted-foreground truncate">{firstChild.first_name} · visites, vaccins, jalons</p>
          </div>
          <CalendarDays className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
        </div>

        {/* View switch + navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 bg-muted rounded-lg p-0.5" role="tablist" aria-label="Vue calendrier">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md min-h-11 ${view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {v === "month" ? "Mois" : "Semaine"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate_(-1)} aria-label="Période précédente" className="p-2 min-h-11 min-w-11 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <p className="text-sm font-bold text-foreground min-w-[110px] text-center" aria-live="polite">
              {format(cursor, view === "month" ? "MMMM yyyy" : "d MMM", { locale: fr })}
            </p>
            <button onClick={() => navigate_(1)} aria-label="Période suivante" className="p-2 min-h-11 min-w-11 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="medical-card p-2">
          <div className="grid grid-cols-7 text-center mb-1" role="row">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-muted-foreground py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const dayEvents = eventsOn(day);
              const inMonth = isSameMonth(day, cursor);
              const selected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  aria-label={`${format(day, "EEEE d MMMM", { locale: fr })}${dayEvents.length ? `, ${dayEvents.length} événement(s)` : ""}`}
                  aria-pressed={selected}
                  className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs transition-colors min-h-[44px] ${
                    selected ? "bg-primary text-primary-foreground font-bold" :
                    isToday(day) ? "bg-accent text-foreground font-bold" :
                    inMonth || view === "week" ? "text-foreground" : "text-muted-foreground/40"
                  }`}
                >
                  {day.getDate()}
                  {dayEvents.length > 0 && (
                    <span className="flex gap-0.5 mt-0.5" aria-hidden="true">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-primary-foreground" : TYPE_META[e.type].dot}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 justify-center" aria-hidden="true">
          {(Object.keys(TYPE_META) as EventType[]).map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${TYPE_META[t].dot}`} /> {TYPE_META[t].label}
            </span>
          ))}
        </div>

        {/* Selected day events */}
        <section aria-label={`Événements du ${format(selectedDay, "d MMMM", { locale: fr })}`}>
          <h2 className="text-sm font-bold text-foreground mb-2">
            {isToday(selectedDay) ? "Aujourd'hui" : format(selectedDay, "EEEE d MMMM", { locale: fr })}
          </h2>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground medical-card text-center py-4">Aucun événement ce jour</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => {
                const meta = TYPE_META[e.type];
                return (
                  <div key={e.id} className="medical-card flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.chip}`}>
                      <meta.icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${e.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{e.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {e.time && <span className="inline-flex items-center gap-1 mr-1"><Clock className="w-3 h-3 inline" aria-hidden="true" />{e.time} · </span>}
                        {e.subtitle || meta.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section aria-label="Prochains événements">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-foreground">Prochainement</h2>
            <button className="text-xs font-semibold text-primary min-h-11" onClick={() => navigate("/appointments")}>Gérer les RDV</button>
          </div>
          <div className="space-y-2">
            {nextEvents.map((e) => {
              const meta = TYPE_META[e.type];
              return (
                <div key={e.id} className="medical-card flex items-center gap-3">
                  <div className="w-10 text-center shrink-0">
                    <p className="text-base font-extrabold text-foreground leading-none">{format(e.date, "d")}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{format(e.date, "MMM", { locale: fr })}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.chip}`}>
                    <meta.icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{e.subtitle || meta.label}</p>
                  </div>
                </div>
              );
            })}
            {nextEvents.length === 0 && (
              <p className="text-xs text-muted-foreground medical-card text-center py-4">Aucun événement à venir</p>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default MedicalCalendar;