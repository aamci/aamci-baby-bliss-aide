import { TrendingUp, Syringe, Calendar, Baby, Plus, Check, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

const tabs = ["Croissance", "Vaccins", "Visites", "Jalons"];

const weights = [
  { date: "Naissance", value: 3.3 },
  { date: "1 mois", value: 4.2 },
  { date: "2 mois", value: 5.1 },
  { date: "4 mois", value: 5.8 },
  { date: "6 mois", value: 7.0 },
  { date: "8 mois", value: 7.8 },
];

const vaccines = [
  { name: "BCG", status: "done", date: "15/07/2025" },
  { name: "Hexavalent (1ère dose)", status: "done", date: "10/08/2025" },
  { name: "Hexavalent (2ème dose)", status: "done", date: "10/10/2025" },
  { name: "Pneumocoque (1ère dose)", status: "done", date: "10/08/2025" },
  { name: "ROR (1ère dose)", status: "upcoming", date: "Recommandé à 12 mois" },
  { name: "Méningocoque C", status: "upcoming", date: "Recommandé à 12 mois" },
];

const visits = [
  { name: "Visite du 8ème jour", status: "done", date: "08/06/2025" },
  { name: "Visite du 1er mois", status: "done", date: "01/07/2025" },
  { name: "Visite du 2ème mois", status: "done", date: "01/08/2025" },
  { name: "Visite du 4ème mois", status: "done", date: "01/10/2025" },
  { name: "Visite du 9ème mois", status: "upcoming", date: "Dans 18 jours" },
  { name: "Visite du 12ème mois", status: "future", date: "Juin 2026" },
];

const milestones = [
  { name: "Se retourne ventre-dos", domain: "Motricité", acquired: true, age: "5 mois" },
  { name: "S'assoit avec appui", domain: "Motricité", acquired: true, age: "6 mois" },
  { name: "Attrape un objet", domain: "Motricité fine", acquired: true, age: "4 mois" },
  { name: "Babille (ba-ba, ma-ma)", domain: "Langage", acquired: true, age: "7 mois" },
  { name: "S'assoit sans appui", domain: "Motricité", acquired: false, age: "8-9 mois" },
  { name: "Fait coucou/au revoir", domain: "Social", acquired: false, age: "9-10 mois" },
];

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

const Tracking = () => {
  const [active, setActive] = useState("Croissance");

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Suivi d'Emma</h1>
          <p className="text-sm text-muted-foreground">8 mois et 12 jours</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              active === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Croissance */}
      {active === "Croissance" && (
        <div className="space-y-4 animate-fade-in">
          <div className="medical-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Courbe de poids</h3>
              </div>
              <span className="text-xs text-muted-foreground">OMS · Fille</span>
            </div>
            {/* Simple chart */}
            <div className="flex items-end gap-2 h-32 pt-4">
              {weights.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-medium text-primary">{w.value}</span>
                  <div className="w-full rounded-t-lg bg-primary/15 relative" style={{ height: `${(w.value / 9) * 100}%` }}>
                    <div className="absolute inset-0 rounded-t-lg bg-primary" style={{ opacity: 0.3 + (i / 6) * 0.7 }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{w.date.slice(0, 3)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ✅ Poids dans la zone normale (50ème percentile)
            </p>
          </div>
        </div>
      )}

      {/* Vaccins */}
      {active === "Vaccins" && (
        <div className="space-y-3 animate-fade-in">
          {vaccines.map((v, i) => (
            <div key={i} className="medical-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${statusBg(v.status)} flex items-center justify-center`}>
                {v.status === "done" ? <Check className="w-4 h-4 text-success" /> : <Syringe className="w-4 h-4 text-medical-orange" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.date}</p>
              </div>
              {statusIcon(v.status)}
            </div>
          ))}
        </div>
      )}

      {/* Visites */}
      {active === "Visites" && (
        <div className="space-y-3 animate-fade-in">
          {visits.map((v, i) => (
            <div key={i} className="medical-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${statusBg(v.status)} flex items-center justify-center`}>
                {v.status === "done" ? <Check className="w-4 h-4 text-success" /> : <Calendar className="w-4 h-4 text-medical-orange" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.date}</p>
              </div>
              {v.status === "upcoming" && (
                <button className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg">
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
          {milestones.map((m, i) => (
            <div key={i} className="medical-card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${m.acquired ? "bg-medical-light-green" : "bg-muted"} flex items-center justify-center`}>
                {m.acquired ? <Check className="w-4 h-4 text-success" /> : <Baby className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.domain} · {m.age}</p>
              </div>
              {!m.acquired && (
                <button className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg">
                  ✅ Acquis
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tracking;
