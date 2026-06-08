import { useEffect, useState } from "react";
import { ArrowLeft, Download, Trash2, FileCheck2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import { openCookieBanner } from "@/components/legal/CookieBanner";

type Scope = "analytics" | "functional" | "marketing" | "ai_processing";
type RgpdRequest = {
  id: string;
  type: string;
  status: string;
  requested_at: string;
  result_url: string | null;
};

const SCOPES: { key: Scope; label: string; desc: string }[] = [
  { key: "ai_processing", label: "Assistant IA médical", desc: "Traitement de vos questions par Gemini via le Lovable AI Gateway." },
  { key: "analytics", label: "Mesure d'audience", desc: "Statistiques anonymisées d'utilisation." },
  { key: "functional", label: "Cookies fonctionnels", desc: "Personnalisation avancée et préférences d'affichage." },
  { key: "marketing", label: "Communications marketing", desc: "Emails d'actualités et nouveautés produits." },
];

const Rgpd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consents, setConsents] = useState<Record<Scope, boolean>>({
    analytics: false,
    functional: false,
    marketing: false,
    ai_processing: true,
  });
  const [requests, setRequests] = useState<RgpdRequest[]>([]);
  const [busy, setBusy] = useState(false);

  const loadConsents = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_consents").select("scope, granted").eq("user_id", user.id);
    if (data) {
      const next = { ...consents };
      data.forEach((r: any) => { (next as any)[r.scope] = r.granted; });
      setConsents(next);
    }
  };

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("rgpd_requests")
      .select("id, type, status, requested_at, result_url")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });
    if (data) setRequests(data as RgpdRequest[]);
  };

  useEffect(() => { loadConsents(); loadRequests(); /* eslint-disable-next-line */ }, [user?.id]);

  const toggle = async (scope: Scope, granted: boolean) => {
    if (!user) return;
    setConsents({ ...consents, [scope]: granted });
    const { error } = await supabase
      .from("user_consents")
      .upsert({ user_id: user.id, scope, granted }, { onConflict: "user_id,scope" });
    if (error) { toast.error("Mise à jour impossible"); return; }
    toast.success(granted ? "Consentement enregistré" : "Consentement retiré");
  };

  const createRequest = async (type: "access" | "export" | "delete" | "rectification") => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("rgpd_requests").insert({ user_id: user.id, type });
    setBusy(false);
    if (error) { toast.error("Demande impossible"); return; }
    toast.success("Demande enregistrée. Vous serez notifié sous 30 jours.");
    loadRequests();
  };

  return (
    <PageTransition>
      <div className="min-h-[100dvh] bg-background max-w-2xl mx-auto flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground">Centre RGPD</h1>
            <p className="text-[11px] text-muted-foreground">Vos données, vos droits</p>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 space-y-5 pb-10">
          <section className="medical-card space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Mes consentements</h2>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Activez ou retirez vos consentements à tout moment. Le retrait n'affecte pas la
              licéité des traitements effectués avant le retrait.
            </p>
            <div className="space-y-2">
              {SCOPES.map((s) => (
                <label key={s.key} className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                  <input
                    type="checkbox"
                    checked={consents[s.key]}
                    onChange={(e) => toggle(s.key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-primary"
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <Button variant="outline" className="w-full h-10 text-[12px] font-semibold" onClick={openCookieBanner}>
              Rouvrir le bandeau cookies
            </Button>
          </section>

          <section className="medical-card space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Mes demandes RGPD</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11 text-[12px] font-semibold" disabled={busy} onClick={() => createRequest("access")}>
                Droit d'accès
              </Button>
              <Button variant="outline" className="h-11 text-[12px] font-semibold" disabled={busy} onClick={() => createRequest("export")}>
                <Download className="w-3.5 h-3.5 mr-1" /> Portabilité
              </Button>
              <Button variant="outline" className="h-11 text-[12px] font-semibold" disabled={busy} onClick={() => createRequest("rectification")}>
                Rectification
              </Button>
              <Button variant="destructive" className="h-11 text-[12px] font-semibold" disabled={busy} onClick={() => {
                if (confirm("Confirmer la demande de suppression de votre compte et de toutes vos données ? Cette action est irréversible.")) {
                  createRequest("delete");
                }
              }}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Suppression
              </Button>
            </div>

            <div className="space-y-1.5">
              {requests.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Aucune demande en cours.</p>
              )}
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-[11px] bg-muted rounded-lg px-3 py-2">
                  <span className="font-semibold text-foreground capitalize">{r.type}</span>
                  <span className="text-muted-foreground">{new Date(r.requested_at).toLocaleDateString("fr-FR")}</span>
                  <span className="px-2 py-0.5 rounded-full bg-background text-foreground text-[10px] font-semibold">{r.status}</span>
                </div>
              ))}
            </div>
          </section>

          <p className="text-[11px] text-muted-foreground text-center">
            Pour toute question, contactez notre DPO :{" "}
            <a href="mailto:[EMAIL_DPO]" className="text-primary font-semibold">[EMAIL_DPO]</a>
          </p>
        </main>
      </div>
    </PageTransition>
  );
};

export default Rgpd;