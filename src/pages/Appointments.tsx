import { useState } from "react";
import { Calendar, Plus, Check, Clock, Stethoscope, ChevronRight } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useChildren } from "@/hooks/useChildren";
import { useAppointments, useAddAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { format, isToday, isTomorrow, isPast, isFuture, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { fr } from "date-fns/locale";

const appointmentTypes = [
  "Visite mensuelle",
  "Visite obligatoire",
  "Vaccination",
  "Contrôle de croissance",
  "Consultation spécialiste",
  "Urgence",
  "Autre",
];

const Appointments = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [form, setForm] = useState({ name: "", doctor_name: "", visit_date: "", visit_time: "", notes: "" });

  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const { data: appointments = [] } = useAppointments(firstChild?.id);
  const addAppt = useAddAppointment();
  const updateAppt = useUpdateAppointment();

  const currentMonth = startOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: currentMonth, end: endOfMonth(currentMonth) });
  const firstDayOffset = (getDay(currentMonth) + 6) % 7; // Monday start

  const appointmentsForDate = (date: Date) =>
    appointments.filter((a) => a.visit_date && isSameDay(parseISO(a.visit_date), date));

  const upcomingAppointments = appointments
    .filter((a) => a.visit_date && a.status !== "done" && isFuture(parseISO(a.visit_date)))
    .slice(0, 5);

  const pastAppointments = appointments
    .filter((a) => a.status === "done" || (a.visit_date && isPast(parseISO(a.visit_date))))
    .reverse()
    .slice(0, 5);

  const handleAdd = () => {
    if (!form.name || !form.visit_date || !firstChild) return;
    addAppt.mutate(
      { child_id: firstChild.id, ...form },
      {
        onSuccess: () => {
          toast.success("Rendez-vous ajouté !");
          setShowAdd(false);
          setForm({ name: "", doctor_name: "", visit_date: "", visit_time: "", notes: "" });
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const markDone = (id: string) => {
    if (!firstChild) return;
    updateAppt.mutate(
      { id, child_id: firstChild.id, status: "done" },
      { onSuccess: () => toast.success("RDV marqué comme effectué") }
    );
  };

  const formatDateLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Aujourd'hui";
    if (isTomorrow(d)) return "Demain";
    return format(d, "EEEE d MMMM", { locale: fr });
  };

  const prevMonth = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Rendez-vous</h1>
          <p className="text-sm text-muted-foreground">
            {firstChild ? `Planning de ${firstChild.first_name}` : "Ajoutez un enfant"}
          </p>
        </div>
        <button
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
          onClick={() => setShowAdd(true)}
          aria-label="Nouveau rendez-vous"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="medical-card space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1 text-muted-foreground">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <h3 className="font-semibold text-sm text-foreground capitalize">
            {format(selectedDate, "MMMM yyyy", { locale: fr })}
          </h3>
          <button onClick={nextMonth} className="p-1 text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
            <span key={d} className="text-[10px] font-medium text-muted-foreground">{d}</span>
          ))}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const hasAppt = appointmentsForDate(day).length > 0;
            const isSelected = isSameDay(day, selectedDate);
            const today = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`relative w-8 h-8 mx-auto rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : today
                    ? "bg-accent text-accent-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {day.getDate()}
                {hasAppt && (
                  <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Appointments for selected date */}
        {appointmentsForDate(selectedDate).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground">
              {format(selectedDate, "d MMMM", { locale: fr })}
            </p>
            {appointmentsForDate(selectedDate).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  a.status === "done" ? "bg-medical-light-green" : "bg-medical-light-blue"
                }`}>
                  {a.status === "done" ? <Check className="w-4 h-4 text-success" /> : <Stethoscope className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{a.name}</p>
                  {a.doctor_name && <p className="text-xs text-muted-foreground">{a.doctor_name}</p>}
                </div>
                {a.status !== "done" && (
                  <button
                    onClick={() => markDone(a.id)}
                    className="text-xs font-semibold text-primary bg-accent px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                  >
                    Fait
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Prochains rendez-vous</h2>
          {upcomingAppointments.map((a) => (
            <div key={a.id} className="medical-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-medical-light-blue flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.visit_date ? formatDateLabel(a.visit_date) : "À planifier"}
                  {a.doctor_name ? ` · ${a.doctor_name}` : ""}
                </p>
              </div>
              <button
                onClick={() => markDone(a.id)}
                className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg active:scale-95 transition-transform shrink-0"
              >
                Fait
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Past */}
      {pastAppointments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Historique</h2>
          {pastAppointments.map((a) => (
            <div key={a.id} className="medical-card flex items-center gap-3 opacity-70">
              <div className="w-10 h-10 rounded-xl bg-medical-light-green flex items-center justify-center">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.visit_date ? format(parseISO(a.visit_date), "d MMM yyyy", { locale: fr }) : ""}
                  {a.doctor_name ? ` · ${a.doctor_name}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-medical-light-blue flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Aucun rendez-vous planifié</p>
          <Button onClick={() => setShowAdd(true)} size="sm" className="rounded-xl">
            Planifier un RDV
          </Button>
        </div>
      )}

      {/* Add Drawer */}
      <Drawer open={showAdd} onOpenChange={setShowAdd}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Nouveau rendez-vous</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Type de rendez-vous</label>
              <div className="flex flex-wrap gap-2">
                {appointmentTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, name: t }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      form.name === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Date du rendez-vous</label>
              <input
                type="date"
                value={form.visit_date}
                onChange={(e) => setForm((f) => ({ ...f, visit_date: e.target.value }))}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Médecin (optionnel)</label>
              <input
                type="text"
                value={form.doctor_name}
                onChange={(e) => setForm((f) => ({ ...f, doctor_name: e.target.value }))}
                placeholder="Dr. Martin"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Notes (optionnel)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Informations complémentaires..."
                rows={2}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleAdd}
              disabled={addAppt.isPending || !form.name || !form.visit_date}
              className="w-full h-12 text-sm font-semibold rounded-xl"
            >
              {addAppt.isPending ? "Enregistrement..." : "Planifier le rendez-vous"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Appointments;
