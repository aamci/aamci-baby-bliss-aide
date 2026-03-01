import { Bell, Bot, ChevronRight, Calendar, Syringe, Baby, Heart, Moon, Apple, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const childName = "Emma";
const childAge = "8 mois et 12 jours";
const parentName = "Marie";

const contentCards = [
  { title: "Diversification alimentaire à 8 mois", tag: "Nutrition", icon: Apple, color: "bg-medical-light-green text-medical-green", slug: "diversification-alimentaire" },
  { title: "Le sommeil de bébé : les bons réflexes", tag: "Sommeil", icon: Moon, color: "bg-medical-light-blue text-primary", slug: "sommeil-bebe" },
  { title: "Stimuler la motricité fine", tag: "Éveil", icon: Brain, color: "bg-medical-light-orange text-medical-orange", slug: "diversification-alimentaire" },
  { title: "Quand consulter en urgence ?", tag: "Santé", icon: Heart, color: "bg-medical-light-red text-medical-red", slug: "diversification-alimentaire" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {parentName[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Bonjour {parentName} 👋</h1>
            <p className="text-sm text-muted-foreground">Comment va {childName} aujourd'hui ?</p>
          </div>
        </div>
        <button className="relative p-2" onClick={() => navigate("/notifications")} aria-label="Notifications">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>

      {/* Child selector */}
      <button className="medical-card flex items-center gap-3 bg-accent w-full text-left" onClick={() => navigate("/child-profile")}>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Baby className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">{childName}</p>
          <p className="text-xs text-muted-foreground">{childAge}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Alerts */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">À faire cette semaine</h2>
        <div className="medical-card flex items-center gap-3 border-l-4 border-medical-orange">
          <div className="w-10 h-10 rounded-xl bg-medical-light-orange flex items-center justify-center">
            <Calendar className="w-5 h-5 text-medical-orange" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Visite du 9ème mois</p>
            <p className="text-xs text-muted-foreground">Dans 18 jours · Obligatoire</p>
          </div>
          <button
            className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            onClick={() => navigate("/tracking")}
          >
            Prendre RDV
          </button>
        </div>

        <div className="medical-card flex items-center gap-3 border-l-4 border-medical-red">
          <div className="w-10 h-10 rounded-xl bg-medical-light-red flex items-center justify-center">
            <Syringe className="w-5 h-5 text-medical-red" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Vaccin ROR</p>
            <p className="text-xs text-muted-foreground">Recommandé avant 12 mois</p>
          </div>
          <button
            className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            onClick={() => navigate("/tracking")}
          >
            Voir
          </button>
        </div>
      </section>

      {/* Content carousel */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Pour {childName} à {childAge.split(" ")[0]} mois</h2>
          <button className="text-xs font-semibold text-primary" onClick={() => navigate("/contents")}>
            Voir tout
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {contentCards.map((card, i) => (
            <div
              key={i}
              className="medical-card min-w-[200px] flex-shrink-0 space-y-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/article/${card.slug}`)}
            >
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-foreground leading-tight">{card.title}</p>
              <span className="inline-block text-[11px] font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
                {card.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section>
        <div
          className="medical-card-elevated bg-gradient-to-br from-primary/5 to-accent cursor-pointer space-y-3 active:scale-[0.98] transition-transform"
          onClick={() => navigate("/assistant")}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Assistant Parents</h3>
              <p className="text-xs text-muted-foreground">Réponses en quelques secondes</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {["Mon bébé a de la fièvre", "Quand introduire les solides ?", "Mon enfant ne dort pas bien"].map((q, i) => (
              <span key={i} className="text-xs bg-card text-muted-foreground px-3 py-1.5 rounded-full whitespace-nowrap border border-border">
                {q}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Weight mini chart */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">Suivi de {childName}</h2>
        <div className="medical-card space-y-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/tracking")}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Courbe de poids</p>
            <span className="text-xs text-muted-foreground">Dernière mesure : 7.8 kg</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {[4.2, 5.1, 5.8, 6.5, 7.0, 7.4, 7.8].map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/20"
                  style={{ height: `${(w / 8) * 100}%` }}
                >
                  <div className="w-full h-full rounded-t-md bg-primary" style={{ opacity: 0.3 + (i / 7) * 0.7 }} />
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs font-semibold text-primary flex items-center gap-1">
            Voir le suivi complet <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* Documents CTA */}
      <section>
        <div className="medical-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/documents")}>
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-lg">📁</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Documents médicaux</p>
            <p className="text-xs text-muted-foreground">8 documents · 12.5 Mo utilisés</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </section>
    </div>
  );
};

export default Home;
