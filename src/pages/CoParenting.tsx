import { ArrowLeft, Users, Mail, MessageSquare, Check, Shield, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const CoParenting = () => {
  const navigate = useNavigate();
  const [inviteMethod, setInviteMethod] = useState<"email" | "sms">("email");
  const [inviteValue, setInviteValue] = useState("");
  const [sent, setSent] = useState(false);

  const handleInvite = () => {
    if (!inviteValue.trim()) {
      toast.error(inviteMethod === "email" ? "Entrez un email" : "Entrez un numéro de téléphone");
      return;
    }
    setSent(true);
    toast.success("Invitation envoyée !");
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://bebesante.app/invite/abc123");
    toast.success("Lien copié !");
  };

  const rights = [
    "Voir tous les documents médicaux",
    "Ajouter des mesures (poids, taille)",
    "Prendre / Modifier / Annuler des RDV",
    "Consulter l'assistant IA",
    "Accéder aux contenus personnalisés",
    "Ajouter des documents",
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Co-parentalité</h1>
              <p className="text-xs text-muted-foreground">Partagez le suivi d'Emma</p>
            </div>
          </div>

          {/* Current co-parents */}
          <div className="medical-card space-y-3 mb-6">
            <h2 className="text-sm font-bold text-foreground">Parents actuels</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">M</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Marie Dupont</p>
                <p className="text-xs text-muted-foreground">Parent principal · Vous</p>
              </div>
              <span className="text-[10px] font-semibold text-success bg-medical-light-green px-2 py-1 rounded-full">Actif</span>
            </div>
          </div>

          {/* Invite */}
          {!sent ? (
            <div className="medical-card-elevated space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Inviter un co-parent</h2>
              </div>
              <p className="text-xs text-muted-foreground">Le co-parent aura accès au profil complet d'Emma et pourra contribuer au suivi médical.</p>

              <div className="flex gap-2">
                <button onClick={() => setInviteMethod("email")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${inviteMethod === "email" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button onClick={() => setInviteMethod("sms")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${inviteMethod === "sms" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <MessageSquare className="w-4 h-4" /> SMS
                </button>
              </div>

              <input
                type={inviteMethod === "email" ? "email" : "tel"}
                value={inviteValue}
                onChange={(e) => setInviteValue(e.target.value)}
                placeholder={inviteMethod === "email" ? "thomas@email.com" : "+33 6 12 34 56 78"}
                className="w-full bg-muted rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <Button onClick={handleInvite} className="w-full h-12 text-sm font-semibold rounded-xl" style={{ boxShadow: "var(--shadow-button)" }}>
                Envoyer l'invitation
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button onClick={copyLink} className="w-full py-3 bg-muted rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                <Copy className="w-4 h-4 text-primary" /> Copier le lien d'invitation
              </button>
            </div>
          ) : (
            <div className="medical-card-elevated text-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-medical-light-green mx-auto flex items-center justify-center">
                <Check className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-bold text-foreground">Invitation envoyée !</h3>
              <p className="text-xs text-muted-foreground">
                Un lien sécurisé a été envoyé à <span className="font-semibold text-foreground">{inviteValue}</span>. Le co-parent aura accès au profil d'Emma dès la création de son compte.
              </p>
              <button onClick={() => setSent(false)} className="text-xs text-primary font-semibold">
                Envoyer une autre invitation
              </button>
            </div>
          )}

          {/* Rights */}
          <div className="medical-card space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Droits du co-parent</h2>
            </div>
            <div className="space-y-2">
              {rights.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="text-xs text-foreground">{r}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-border">
              <span className="text-medical-orange text-xs">⚠️</span>
              <span className="text-[11px] text-muted-foreground">La suppression d'un document envoie une notification à l'autre parent</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CoParenting;
