import { TrendingUp, Syringe, Calendar, Baby, Plus, Check, Clock, AlertTriangle, X, Moon, Milk, Droplet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChildren, useChildAge } from "@/hooks/useChildren";
import { useMeasurements, useAddMeasurement, useVaccines, useVisits, useMilestones, useToggleMilestone } from "@/hooks/useTracking";
import { toast } from "sonner";
import SleepTab from "@/components/tracking/SleepTab";
import FeedingTab from "@/components/tracking/FeedingTab";
import DiaperTab from "@/components/tracking/DiaperTab";

const tabs = ["Croissance", "Sommeil", "Repas", "Couches", "Vaccins", "Visites", "Jalons"];

const Tracking = () => {
  const [active, setActive] = useState("Croissance");
  const [showAddMeasure, setShowAddMeasure] = useState(false);
  const [measureType, setMeasureType] = useState("weight");
  const [measureValue, setMeasureValue] = useState("");
  const [measureDate, setMeasureDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);

  const { data: measurements = [] } = useMeasurements(firstChild?.id);
  const { data: vaccines = [] } = useVaccines(firstChild?.id);
  const { data: visits = [] } = useVisits(firstChild?.id);
  const { data: milestones = [] } = useMilestones(firstChild?.id);
  const addMeasurement = useAddMeasurement();
  const toggleMilestone = useToggleMilestone();

  const weights = measurements.filter((m) => m.measurement_type === "weight");

  const statusIcon = (status: string) => {
    if (status === "done") return <Check className="w-4 h-4 text-success" />;
    if (status === "upcoming") return <Clock className="w-4 h-4 text-medical-orange" />;
    if (status === "late") return <AlertTriangle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const statusBg = (status: string) => {
    if (status === "done") return "bg-medical-light-green";
    if (status === "upcoming") return "bg-medical-light-orange";
    if (status === "late") return "bg-medical-light-red";
    return "bg-muted";
  };

  const handleAddMeasure = () => {
    if (!measureValue || !firstChild) return;
    const val = parseFloat(measureValue);
    if (isNaN(val)) return;
    addMeasurement.mutate(
      { child_id: firstChild.id, measurement_type: measureType, value: val, measured_at: measureDate },
      {
        onSuccess: () => {
          toast.success("Mesure enregistrée !");
          setShowAddMeasure(false);
          setMeasureValue("");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleToggleMilestone = (id: string, currentAcquired: boolean) => {
    if (!firstChild) return;
    toggleMilestone.mutate({ id, acquired: !currentAcquired, child_id: firstChild.id });
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {firstChild ? `Suivi de ${firstChild.first_name}` : "Suivi"}
          </h1>
          <p className="text-sm text-muted-foreground">{childAge || "Ajoutez un enfant"}</p>
        </div>
        <button
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
          onClick={() => setShowAddMeasure(true)}
          aria-label="Ajouter une mesure"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 min-w-fit whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              active === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add Measure Modal */}
      {showAddMeasure && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowAddMeasure(false)}>
          <div className="bg-card rounded-t-3xl w-full max-w-lg p-6 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Nouvelle mesure</h2>
              <button onClick={() => setShowAddMeasure(false)} className="p-2 text-muted-foreground" aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Type de mesure</label>
              <div className="flex gap-2">
                {[
                  { key: "weight", label: "Poids (kg)" },
                  { key: "height", label: "Taille (cm)" },
                  { key: "head", label: "Tour de tête (cm)" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setMeasureType(t.key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                      measureType === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Valeur</label>
              <input type="number" step="0.1" value={measureValue} onChange={(e) => setMeasureValue(e.target.value)}
                placeholder={measureType === "weight" ? "Ex: 8.2" : "Ex: 72"}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Date</label>
              <input type="date" value={measureDate} onChange={(e) => setMeasureDate(e.target.value)}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button onClick={handleAddMeasure} disabled={addMeasurement.isPending} className="w-full h-12 text-sm font-semibold rounded-xl" style={{ boxShadow: "var(--shadow-button)" }}>
              {addMeasurement.isPending ? "Enregistrement..." : "Enregistrer la mesure"}
            </Button>
          </div>
        </div>
      )}

      {/* Croissance */}
      {active === "Croissance" && (
        <div className="space-y-4 animate-fade-in">
          <div className="medical-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Courbe de poids</h3>
              </div>
              <span className="text-xs text-muted-foreground">OMS · {firstChild?.gender === "female" ? "Fille" : "Garçon"}</span>
            </div>
            {weights.length > 0 ? (
              <>
                <div className="flex items-end gap-2 h-32 pt-4">
                  {weights.slice(-7).map((w, i) => (
                    <div key={w.id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-medium text-primary">{Number(w.value)}</span>
                      <div className="w-full rounded-t-lg bg-primary/15 relative" style={{ height: `${(Number(w.value) / 15) * 100}%` }}>
                        <div className="absolute inset-0 rounded-t-lg bg-primary" style={{ opacity: 0.3 + (i / 7) * 0.7 }} />
                      </div>
                      <span className="text-[8px] text-muted-foreground truncate w-full text-center">{new Date(w.measured_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  ✅ Dernière mesure : {Number(weights[weights.length - 1].value)} kg
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Aucune mesure. Ajoutez la première !</p>
            )}
          </div>
        </div>
      )}

      {active === "Sommeil" && <SleepTab childId={firstChild?.id} />}
      {active === "Repas" && <FeedingTab childId={firstChild?.id} />}
      {active === "Couches" && <DiaperTab childId={firstChild?.id} />}

      {/* Vaccins */}
      {active === "Vaccins" && (
        <div className="space-y-3 animate-fade-in">
          {vaccines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun vaccin enregistré</p>
          ) : vaccines.map((v) => (
            <div key={v.id} className="medical-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${statusBg(v.status)} flex items-center justify-center`}>
                {v.status === "done" ? <Check className="w-4 h-4 text-success" /> : <Syringe className="w-4 h-4 text-medical-orange" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{v.name}</p>
                <p className="text-xs text-muted-foreground">
                  {v.administered_at ? new Date(v.administered_at).toLocaleDateString("fr-FR") : v.recommended_age || "À planifier"}
                </p>
              </div>
              {statusIcon(v.status)}
            </div>
          ))}
        </div>
      )}

      {/* Visites */}
      {active === "Visites" && (
        <div className="space-y-3 animate-fade-in">
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune visite enregistrée</p>
          ) : visits.map((v) => (
            <div key={v.id} className="medical-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${statusBg(v.status)} flex items-center justify-center`}>
                {v.status === "done" ? <Check className="w-4 h-4 text-success" /> : <Calendar className="w-4 h-4 text-medical-orange" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{v.name}</p>
                <p className="text-xs text-muted-foreground">
                  {v.visit_date ? new Date(v.visit_date).toLocaleDateString("fr-FR") : "À planifier"}
                </p>
              </div>
              {v.status === "upcoming" && (
                <button className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg active:scale-95 transition-transform shrink-0">
                  Prendre RDV
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Jalons */}
      {active === "Jalons" && (
        <div className="space-y-3 animate-fade-in">
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun jalon enregistré</p>
          ) : milestones.map((m) => (
            <div key={m.id} className="medical-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${m.acquired ? "bg-medical-light-green" : "bg-muted"} flex items-center justify-center`}>
                {m.acquired ? <Check className="w-4 h-4 text-success" /> : <Baby className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.domain} · {m.expected_age || ""}</p>
              </div>
              <button
                onClick={() => handleToggleMilestone(m.id, m.acquired)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all shrink-0 ${
                  m.acquired ? "text-success bg-medical-light-green" : "text-primary bg-accent"
                }`}
              >
                {m.acquired ? "✅ Acquis" : "Marquer"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tracking;
