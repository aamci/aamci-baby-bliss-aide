import { Bell, ChevronRight, Calendar, Syringe, Baby, Moon, Milk, Droplet, TrendingUp, Target, ArrowLeft, Activity } from "lucide-react";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren, useChildAge } from "@/hooks/useChildren";
import { useAppointments } from "@/hooks/useAppointments";
import { useMeasurements, useVaccines, useMilestones } from "@/hooks/useTracking";
import { useSleepLogs, useFeedingLogs, useDiaperLogs } from "@/hooks/useLogs";
import { useCoParents } from "@/hooks/useCoParents";
import { format, parseISO, isFuture, isToday, isTomorrow, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import PageTransition from "@/components/PageTransition";
import KpiCard from "@/components/dashboard/KpiCard";
import GrowthChart from "@/components/dashboard/GrowthChart";
import SleepChart from "@/components/dashboard/SleepChart";
import FeedingCharts from "@/components/dashboard/FeedingCharts";
import MilestoneRadar from "@/components/dashboard/MilestoneRadar";
import DiaperHeatmap from "@/components/dashboard/DiaperHeatmap";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);
  const { data: appointments = [] } = useAppointments(firstChild?.id);
  const { data: measurements = [] } = useMeasurements(firstChild?.id);
  const { data: vaccines = [] } = useVaccines(firstChild?.id);
  const { data: milestones = [] } = useMilestones(firstChild?.id);
  const { data: sleepLogs = [] } = useSleepLogs(firstChild?.id, 30);
  const { data: feedingLogs = [] } = useFeedingLogs(firstChild?.id, 30);
  const { data: diaperLogs = [] } = useDiaperLogs(firstChild?.id, 30);
  const { data: coparents = [] } = useCoParents(firstChild?.id);
  const { count: unreadCount } = useUnreadNotifications();
  const [growthKind, setGrowthKind] = useState<"weight" | "height">("weight");

  const today = new Date().toDateString();
  const sleepToday = sleepLogs.filter((l) => new Date(l.start_at).toDateString() === today).reduce((s, l) => s + (l.duration_min || 0), 0);
  const feedingsToday = feedingLogs.filter((l) => new Date(l.fed_at).toDateString() === today);
  const diapersToday = diaperLogs.filter((l) => new Date(l.changed_at).toDateString() === today).length;
  const lastFeed = feedingLogs[0];
  const lastFeedAgo = lastFeed ? Math.round((Date.now() - new Date(lastFeed.fed_at).getTime()) / 60000) : null;
  const weights = measurements.filter((m) => m.measurement_type === "weight");
  const currentWeight = weights[weights.length - 1];
  const prevWeight = weights[weights.length - 2];
  const weightDelta = currentWeight && prevWeight ? Number(currentWeight.value) - Number(prevWeight.value) : 0;
  const nextVaccine = vaccines.find((v) => v.status !== "done");
  const doneMilestones = milestones.filter((m) => m.acquired).length;
  const milestonePct = milestones.length > 0 ? Math.round((doneMilestones / milestones.length) * 100) : 0;
  const upcomingAppts = appointments.filter((a) => a.visit_date && a.status !== "done" && isFuture(parseISO(a.visit_date))).slice(0, 3);
  const nextAppt = upcomingAppts[0];

  const formatApptDate = (dateStr: string, visitTime?: string | null) => {
    const d = parseISO(dateStr);
    const timeStr = visitTime ? ` à ${visitTime.slice(0, 5)}` : "";
    if (isToday(d)) return `Aujourd'hui${timeStr}`;
    if (isTomorrow(d)) return `Demain${timeStr}`;
    return format(d, "d MMM", { locale: fr }) + timeStr;
  };

  if (!firstChild) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-8 space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/home")} aria-label="Retour" className="p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-xl font-bold">Tableau de bord</h1>
          </div>
          <button className="medical-card-elevated w-full text-left space-y-2 bg-gradient-to-br from-primary/10 to-accent" onClick={() => navigate("/child-profile")}>
            <Baby className="w-8 h-8 text-primary" />
            <p className="font-bold text-foreground">Ajouter votre enfant</p>
            <p className="text-xs text-muted-foreground">Pour visualiser les statistiques de croissance, sommeil, alimentation et jalons.</p>
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/home")} className="p-2 -ml-2" aria-label="Retour"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-bold truncate">Tableau de bord</h1>
          <button className="relative p-2 -mr-2" onClick={() => navigate("/notifications")} aria-label="Notifications">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
        </div>

        {/* Child summary */}
        <button className="medical-card flex items-center gap-3 bg-accent w-full text-left" onClick={() => navigate("/child-profile")}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Baby className="w-5 h-5 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{firstChild.first_name}</p>
            <p className="text-xs text-muted-foreground truncate">{childAge}{coparents.length > 1 ? ` · ${coparents.length} parents connectés` : ""}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={Moon} tone="primary" label="Sommeil 24h" value={`${Math.floor(sleepToday / 60)}h${String(sleepToday % 60).padStart(2, "0")}`} sub={`${sleepLogs.filter((l) => new Date(l.start_at).toDateString() === today).length} sessions`} />
          <KpiCard icon={Milk} tone="green" label="Dernier repas" value={lastFeedAgo != null ? (lastFeedAgo < 60 ? `${lastFeedAgo} min` : `${Math.floor(lastFeedAgo / 60)}h${String(lastFeedAgo % 60).padStart(2, "0")}`) : "—"} sub={`${feedingsToday.length} aujourd'hui`} />
          <KpiCard icon={Droplet} tone="orange" label="Couches" value={String(diapersToday)} sub="aujourd'hui" />
          <KpiCard icon={TrendingUp} tone={weightDelta >= 0 ? "green" : "red"} label="Poids actuel" value={currentWeight ? `${Number(currentWeight.value)} kg` : "—"} sub={prevWeight ? `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(2)} kg` : ""} />
          <KpiCard icon={Syringe} tone="red" label="Prochain vaccin" value={nextVaccine?.name?.slice(0, 12) || "À jour"} sub={nextVaccine?.recommended_age || ""} />
          <KpiCard icon={Target} tone="primary" label="Jalons" value={`${milestonePct}%`} sub={`${doneMilestones}/${milestones.length}`} />
        </div>

        {/* Growth chart */}
        <section className="medical-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Croissance</h2>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(["weight", "height"] as const).map((k) => (
                <button key={k} onClick={() => setGrowthKind(k)} className={`px-3 py-1 text-[11px] font-semibold rounded-md ${growthKind === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {k === "weight" ? "Poids" : "Taille"}
                </button>
              ))}
            </div>
          </div>
          {measurements.length > 0 ? (
            <GrowthChart measurements={measurements as any} birthDate={firstChild.birth_date} gender={firstChild.gender} kind={growthKind} />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">Ajoutez une mesure dans Suivi</p>
          )}
        </section>

        {/* Sleep chart */}
        <section className="medical-card space-y-2">
          <div className="flex items-center gap-2"><Moon className="w-4 h-4 text-primary" /><h2 className="text-sm font-bold">Sommeil 14 jours</h2></div>
          <SleepChart logs={sleepLogs} />
        </section>

        {/* Feeding */}
        <section className="medical-card space-y-2">
          <div className="flex items-center gap-2"><Milk className="w-4 h-4 text-success" /><h2 className="text-sm font-bold">Alimentation 7 jours</h2></div>
          {feedingLogs.length > 0 ? <FeedingCharts logs={feedingLogs} /> : <p className="text-xs text-muted-foreground text-center py-6">Aucun repas enregistré</p>}
        </section>

        {/* Milestones radar */}
        <section className="medical-card space-y-2">
          <div className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /><h2 className="text-sm font-bold">Jalons par domaine</h2></div>
          <MilestoneRadar milestones={milestones} />
        </section>

        {/* Diaper heatmap */}
        <section className="medical-card space-y-2">
          <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-medical-orange" /><h2 className="text-sm font-bold">Couches (7 derniers jours)</h2></div>
          {diaperLogs.length > 0 ? <DiaperHeatmap logs={diaperLogs} /> : <p className="text-xs text-muted-foreground text-center py-6">Aucune couche enregistrée</p>}
        </section>

        {/* Upcoming */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Prochains rendez-vous</h2>
            <button className="text-xs font-semibold text-primary" onClick={() => navigate("/appointments")}>Voir tous</button>
          </div>
          {upcomingAppts.length > 0 ? upcomingAppts.map((r) => (
            <div key={r.id} className="medical-card flex items-center gap-3 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/appointments")}>
              <div className="w-9 h-9 rounded-xl bg-medical-light-blue flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{formatApptDate(r.visit_date!, r.visit_time)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          )) : (
            <div className="medical-card text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">Aucun rendez-vous à venir</p>
              <button className="text-xs font-semibold text-primary" onClick={() => navigate("/appointments")}>Planifier</button>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
