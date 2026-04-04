import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren, useChildAge } from "@/hooks/useChildren";
import { Baby, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);
  const parentName = profile?.first_name || "Parent";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

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
            className="mb-8"
          >
            {firstChild ? (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                style={{ boxShadow: "0 12px 40px -8px hsl(200 95% 45% / 0.35)" }}>
                <Baby className="w-14 h-14 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                <Sparkles className="w-14 h-14 text-primary" />
              </div>
            )}
          </motion.div>

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-3xl font-extrabold text-foreground mb-2"
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
                <p className="text-lg text-muted-foreground">
                  {firstChild.first_name} · <span className="text-primary font-semibold">{childAge}</span>
                </p>
                {children && children.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    et {children.length - 1} autre{children.length > 2 ? "s" : ""} enfant{children.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base text-muted-foreground max-w-xs">
                Commencez par ajouter votre enfant pour personnaliser le suivi
              </p>
            )}
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative z-10 px-8 pb-8"
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
