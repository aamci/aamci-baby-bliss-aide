import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren, useChildAge } from "@/hooks/useChildren";
import { useAppointments } from "@/hooks/useAppointments";
import { Baby, ChevronRight, Sparkles, Calendar, Clock, CalendarDays, Newspaper, MessageCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO, isFuture, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);
  const parentName = profile?.first_name || "Parent";
  const { data: appointments = [] } = useAppointments(firstChild?.id);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const upcomingAppts = appointments
    .filter((a) => a.visit_date && a.status !== "done" && isFuture(parseISO(a.visit_date)))
    .slice(0, 3);

  const formatApptDate = (dateStr: string, visitTime?: string | null) => {
    const d = parseISO(dateStr);
    const timeStr = visitTime ? ` à ${visitTime.slice(0, 5)}` : "";
    if (isToday(d)) return `Aujourd'hui${timeStr}`;
    if (isTomorrow(d)) return `Demain${timeStr}`;
    return format(d, "d MMM yyyy", { locale: fr }) + timeStr;
  };

  return (
    <PageTransition>
      <div className="h-[calc(100dvh-5rem)] flex flex-col relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent via-background to-background" />

        {/* Decorative circles */}
        <motion.div
          className="absolute top-[-10%] right-[-20%] w-[60vw] h-[60vw] max-w-[300px] max-h-[300px] rounded-full bg-primary/5"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[-15%] w-[40vw] h-[40vw] max-w-[200px] max-h-[200px] rounded-full bg-primary/5"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center z-10">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="mb-6"
          >
            {firstChild ? (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                style={{ boxShadow: "0 12px 40px -8px hsl(200 95% 45% / 0.35)" }}>
                <Baby className="w-12 h-12 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            )}
          </motion.div>

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-2xl font-extrabold text-foreground mb-1"
          >
            {greeting}, {parentName} 👋
          </motion.h1>

          {/* Child info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {firstChild ? (
              <div className="space-y-1">
                <p className="text-base text-muted-foreground">
                  {firstChild.first_name} · <span className="text-primary font-semibold">{childAge}</span>
                </p>
                {children && children.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    et {children.length - 1} autre{children.length > 2 ? "s" : ""} enfant{children.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground max-w-xs">
                Commencez par ajouter votre enfant pour personnaliser le suivi
              </p>
            )}
          </motion.div>

          {/* Upcoming appointments */}
          {upcomingAppts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-6 w-full max-w-sm"
            >
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Prochains RDV</h2>
                  <button
                    onClick={() => navigate("/my-appointments")}
                    className="text-xs font-semibold text-primary flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {upcomingAppts.map((rdv) => (
                  <button
                    key={rdv.id}
                    onClick={() => navigate("/my-appointments")}
                    className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{rdv.name}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {formatApptDate(rdv.visit_date!, rdv.visit_time)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick access */}
          {firstChild && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.5 }}
              className="mt-3 w-full max-w-sm grid grid-cols-2 gap-2"
            >
              <button
                onClick={() => navigate("/calendar")}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">Calendrier</p>
                  <p className="text-[10px] text-muted-foreground">Visites & vaccins</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/news")}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-medical-light-green flex items-center justify-center shrink-0">
                  <Newspaper className="w-4 h-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">Actualités</p>
                  <p className="text-[10px] text-muted-foreground">Santé 0-4 ans</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/messages")}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">Messagerie</p>
                  <p className="text-[10px] text-muted-foreground">Co-parents & pro</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/coparenting")}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 flex items-center gap-2.5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-medical-light-orange flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-medical-orange" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">Co-parentalité</p>
                  <p className="text-[10px] text-muted-foreground">Inviter un parent</p>
                </div>
              </button>
            </motion.div>
          )}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative z-10 px-8 pb-6"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={{ boxShadow: "var(--shadow-button)" }}
          >
            Accéder au tableau de bord
            <ChevronRight className="w-5 h-5" />
          </button>

          {!firstChild && (
            <button
              onClick={() => navigate("/child-profile")}
              className="w-full mt-3 h-12 rounded-2xl border border-primary/20 bg-card text-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <Baby className="w-4 h-4" />
              Ajouter mon enfant
            </button>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Home;
