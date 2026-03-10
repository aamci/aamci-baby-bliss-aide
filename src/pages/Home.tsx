import { Bell, Bot, ChevronRight, Calendar, Syringe, Baby, Heart, Moon, Apple, Brain, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren, useChildAge } from "@/hooks/useChildren";
import { useAppointments } from "@/hooks/useAppointments";
import { format, parseISO, isFuture, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import PageTransition from "@/components/PageTransition";

const contentCards = [
  { title: "Diversification alimentaire à 8 mois", tag: "Nutrition", icon: Apple, color: "bg-medical-light-green text-medical-green", slug: "diversification-alimentaire" },
  { title: "Le sommeil de bébé : les bons réflexes", tag: "Sommeil", icon: Moon, color: "bg-medical-light-blue text-primary", slug: "sommeil-bebe" },
  { title: "Stimuler la motricité fine", tag: "Éveil", icon: Brain, color: "bg-medical-light-orange text-medical-orange", slug: "diversification-alimentaire" },
  { title: "Quand consulter en urgence ?", tag: "Santé", icon: Heart, color: "bg-medical-light-red text-medical-red", slug: "diversification-alimentaire" },
];

const Home = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: children, isLoading } = useChildren();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);
  const parentName = profile?.first_name || "Parent";

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {parentName[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Bonjour {parentName} 👋</h1>
              <p className="text-sm text-muted-foreground">
                {firstChild ? `Comment va ${firstChild.first_name} aujourd'hui ?` : "Ajoutez votre enfant pour commencer"}
              </p>
            </div>
          </div>
          <button className="relative p-2" onClick={() => navigate("/notifications")} aria-label="Notifications">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>
        </div>

        {/* Child selector */}
        {firstChild ? (
          <button className="medical-card flex items-center gap-3 bg-accent w-full text-left" onClick={() => navigate("/child-profile")}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Baby className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{firstChild.first_name}</p>
              <p className="text-xs text-muted-foreground">{childAge}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <button
            className="medical-card-elevated flex items-center gap-3 w-full text-left bg-gradient-to-r from-primary/5 to-accent"
            onClick={() => navigate("/child-profile")}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Baby className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">Ajouter votre enfant</p>
              <p className="text-xs text-muted-foreground">Pour personnaliser le suivi</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Alerts */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">À faire cette semaine</h2>
          <div className="medical-card flex items-center gap-3 border-l-4 border-medical-orange">
            <div className="w-10 h-10 rounded-xl bg-medical-light-orange flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-medical-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Visite du 9ème mois</p>
              <p className="text-xs text-muted-foreground">Dans 18 jours · Obligatoire</p>
            </div>
            <button className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg active:scale-95 transition-transform shrink-0" onClick={() => navigate("/tracking")}>
              Prendre RDV
            </button>
          </div>

          <div className="medical-card flex items-center gap-3 border-l-4 border-medical-red">
            <div className="w-10 h-10 rounded-xl bg-medical-light-red flex items-center justify-center shrink-0">
              <Syringe className="w-5 h-5 text-medical-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Vaccin ROR</p>
              <p className="text-xs text-muted-foreground">Recommandé avant 12 mois</p>
            </div>
            <button className="text-xs font-semibold text-primary bg-accent px-3 py-1.5 rounded-lg active:scale-95 transition-transform shrink-0" onClick={() => navigate("/tracking")}>
              Voir
            </button>
          </div>
        </section>

        {/* RDV quick access */}
        <section>
          <button
            className="medical-card-elevated w-full flex items-center gap-3 bg-gradient-to-r from-primary/5 to-accent active:scale-[0.98] transition-transform"
            onClick={() => navigate("/appointments")}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-foreground">Rendez-vous médicaux</h3>
              <p className="text-xs text-muted-foreground">Planifier et gérer les consultations</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </section>

        {/* Content carousel */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              {firstChild ? `Pour ${firstChild.first_name}` : "Contenus santé"}
            </h2>
            <button className="text-xs font-semibold text-primary" onClick={() => navigate("/contents")}>
              Voir tout
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {contentCards.map((card, i) => (
              <div key={i} className="medical-card min-w-[200px] flex-shrink-0 space-y-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" onClick={() => navigate(`/article/${card.slug}`)}>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-foreground leading-tight">{card.title}</p>
                <span className="inline-block text-[11px] font-medium text-primary bg-accent px-2 py-0.5 rounded-full">{card.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI Assistant CTA */}
        <section>
          <div className="medical-card-elevated bg-gradient-to-br from-primary/5 to-accent cursor-pointer space-y-3 active:scale-[0.98] transition-transform" onClick={() => navigate("/assistant")}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Assistant Parents</h3>
                <p className="text-xs text-muted-foreground">Réponses en quelques secondes</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {["Mon bébé a de la fièvre", "Quand introduire les solides ?", "Mon enfant ne dort pas bien"].map((q, i) => (
                <span key={i} className="text-xs bg-card text-muted-foreground px-3 py-1.5 rounded-full whitespace-nowrap border border-border">{q}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Weight mini chart */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            {firstChild ? `Suivi de ${firstChild.first_name}` : "Suivi de croissance"}
          </h2>
          <div className="medical-card space-y-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/tracking")}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Courbe de poids</p>
              <span className="text-xs text-muted-foreground">Dernière mesure : 7.8 kg</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[4.2, 5.1, 5.8, 6.5, 7.0, 7.4, 7.8].map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-primary/20" style={{ height: `${(w / 8) * 100}%` }}>
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

        {/* Prochains RDV */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Prochains rendez-vous</h2>
            <button className="text-xs font-semibold text-primary" onClick={() => navigate("/tracking")}>Voir tous</button>
          </div>
          {[
            { name: "Visite du 9ème mois", doctor: "Dr. Sophie Martin", date: "20 mars 2026", time: "10h30", type: "Pédiatre" },
            { name: "Vaccin ROR", doctor: "Dr. Pierre Leroy", date: "15 juin 2026", time: "14h00", type: "Vaccination" },
          ].map((rdv, i) => (
            <div key={i} className="medical-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-medical-light-blue flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{rdv.name}</p>
                <p className="text-xs text-muted-foreground">{rdv.doctor}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{rdv.date} à {rdv.time}</span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-primary bg-accent px-2 py-1 rounded-full shrink-0">{rdv.type}</span>
            </div>
          ))}
        </section>

        {/* Documents CTA */}
        <section>
          <div className="medical-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/documents")}>
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <span className="text-lg">📁</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Documents médicaux</p>
              <p className="text-xs text-muted-foreground">Coffre-fort numérique sécurisé</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
