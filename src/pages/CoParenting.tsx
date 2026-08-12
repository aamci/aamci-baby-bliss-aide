import { ArrowLeft, Users, Mail, MessageSquare, Check, Shield, Copy, Loader2, X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { useCoParents, useMyInvites, useRevokeInvite } from "@/hooks/useCoParents";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";

const CoParenting = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const { data: coparents = [] } = useCoParents(firstChild?.id);
  const { data: invites = [] } = useMyInvites();
  const revoke = useRevokeInvite();
  const pendingInvites = invites.filter((i) => i.status === "pending" && (!firstChild || i.child_id === firstChild.id));
  const [inviteMethod, setInviteMethod] = useState<"email" | "sms">("email");
  const [inviteValue, setInviteValue] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const handleInvite = async () => {
    if (!inviteValue.trim()) {
      toast.error(inviteMethod === "email" ? "Entrez un email" : "Entrez un numéro de téléphone");
      return;
    }
    if (!firstChild || !user) {
      toast.error("Ajoutez d'abord un enfant");
      return;
    }

    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-coparent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          child_id: firstChild.id,
          invite_email: inviteMethod === "email" ? inviteValue : null,
          invite_phone: inviteMethod === "sms" ? inviteValue : null,
        }),
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);

      setInviteLink(result.invite_link || "");
      setSent(true);
      toast.success("Invitation créée !");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    }
    setSending(false);
  };

  const copyLink = () => {
    const link = inviteLink || `${window.location.origin}/accept-invite`;
    navigator.clipboard.writeText(link);
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

  const parentName = profile?.first_name || "Parent";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-foreground" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Co-parentalité</h1>
              <p className="text-xs text-muted-foreground">
                {firstChild ? `Partagez le suivi de ${firstChild.first_name}` : "Partagez le suivi"}
              </p>
            </div>
          </div>

          {/* Current co-parents */}
          <div className="medical-card space-y-3 mb-6" role="region" aria-label="Parents actifs">
            <h2 className="text-sm font-bold text-foreground">Parents actifs ({coparents.length || 1})</h2>
            {(coparents.length > 0 ? coparents : [{ parent_id: user?.id, role: "parent", profile: { first_name: parentName, last_name: "" } }]).map((cp: any) => {
              const name = cp.profile?.first_name ? `${cp.profile.first_name} ${cp.profile.last_name || ""}`.trim() : "Parent";
              const isMe = cp.parent_id === user?.id;
              return (
                <div key={cp.parent_id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">{name[0]?.toUpperCase() || "P"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{name}{isMe ? " · Vous" : ""}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">{cp.role || "parent"}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-success bg-medical-light-green px-2 py-1 rounded-full shrink-0">Actif</span>
                </div>
              );
            })}
          </div>

          {/* Pending invites */}
          <button
            onClick={() => navigate("/messages")}
            className="w-full medical-card flex items-center gap-3 mb-6 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Messagerie</p>
              <p className="text-xs text-muted-foreground truncate">Discuter avec les co-parents, le pro et partager des notes</p>
            </div>
          </button>

          {pendingInvites.length > 0 && (
            <div className="medical-card space-y-3 mb-6" role="region" aria-label="Invitations en attente" aria-live="polite">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-medical-orange" aria-hidden="true" /> Invitations en attente ({pendingInvites.length})</h2>
              {pendingInvites.map((inv: any) => {
                const link = `${window.location.origin}/coparenting/accept?token=${inv.token}`;
                return (
                  <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-9 h-9 rounded-xl bg-medical-light-orange flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-medical-orange" aria-hidden="true" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{inv.invite_email || inv.invite_phone}</p>
                      <p className="text-[10px] text-muted-foreground">Envoyé le {new Date(inv.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(link); toast.success("Lien copié !"); }} aria-label={`Copier le lien d'invitation pour ${inv.invite_email || inv.invite_phone}`} className="p-2 min-h-11 min-w-11 flex items-center justify-center text-primary active:scale-95"><Copy className="w-4 h-4" aria-hidden="true" /></button>
                    <button onClick={() => revoke.mutate(inv.id, { onSuccess: () => toast.success("Invitation révoquée") })} aria-label={`Révoquer l'invitation de ${inv.invite_email || inv.invite_phone}`} className="p-2 min-h-11 min-w-11 flex items-center justify-center text-destructive active:scale-95"><X className="w-4 h-4" aria-hidden="true" /></button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Invite */}
          {!sent ? (
            <div className="medical-card-elevated space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Inviter un co-parent</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Le co-parent aura accès au profil complet{firstChild ? ` de ${firstChild.first_name}` : ""} et pourra contribuer au suivi médical.
              </p>

              <div className="flex gap-2" role="tablist" aria-label="Méthode d'invitation">
                <button role="tab" aria-selected={inviteMethod === "email"} onClick={() => setInviteMethod("email")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors min-h-11 ${inviteMethod === "email" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Mail className="w-4 h-4" aria-hidden="true" /> Email
                </button>
                <button role="tab" aria-selected={inviteMethod === "sms"} onClick={() => setInviteMethod("sms")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors min-h-11 ${inviteMethod === "sms" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <MessageSquare className="w-4 h-4" aria-hidden="true" /> SMS
                </button>
              </div>

              <label htmlFor="invite-contact" className="sr-only">
                {inviteMethod === "email" ? "Adresse email du co-parent" : "Numéro de téléphone du co-parent"}
              </label>
              <input
                id="invite-contact"
                type={inviteMethod === "email" ? "email" : "tel"}
                value={inviteValue}
                onChange={(e) => setInviteValue(e.target.value)}
                placeholder={inviteMethod === "email" ? "thomas@email.com" : "+33 6 12 34 56 78"}
                className="w-full bg-muted rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <Button onClick={handleInvite} disabled={sending || !firstChild} className="w-full h-12 text-sm font-semibold rounded-xl" style={{ boxShadow: "var(--shadow-button)" }}>
                {sending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi...</> : "Envoyer l'invitation"}
              </Button>

              {!firstChild && <p className="text-xs text-destructive text-center">Ajoutez d'abord un enfant</p>}

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
                Un lien sécurisé a été créé pour <span className="font-semibold text-foreground">{inviteValue}</span>. Le co-parent aura accès au profil{firstChild ? ` de ${firstChild.first_name}` : ""} dès l'acceptation.
              </p>
              {inviteLink && (
                <button onClick={copyLink} className="text-xs text-primary font-semibold flex items-center gap-1 mx-auto">
                  <Copy className="w-3 h-3" /> Copier le lien
                </button>
              )}
              <button onClick={() => { setSent(false); setInviteValue(""); }} className="text-xs text-primary font-semibold">
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
