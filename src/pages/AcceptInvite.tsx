import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useAcceptInvite } from "@/hooks/useCoParents";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const accept = useAcceptInvite();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (loading || !token) return;
    if (!session) { navigate(`/login?redirect=${encodeURIComponent(`/coparenting/accept?token=${token}`)}`); return; }
    if (state !== "idle") return;
    setState("loading");
    accept.mutate(token, { onSuccess: () => setState("ok"), onError: (e: any) => { setErr(e.message); setState("err"); } });
  }, [loading, session, token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="medical-card-elevated max-w-sm w-full text-center space-y-4">
        {state === "loading" && <><Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" /><p className="text-sm text-foreground">Traitement de l'invitation…</p></>}
        {state === "ok" && <><div className="w-14 h-14 rounded-full bg-medical-light-green mx-auto flex items-center justify-center"><Check className="w-7 h-7 text-success" /></div><h1 className="font-bold text-foreground">Invitation acceptée</h1><p className="text-xs text-muted-foreground">Vous êtes maintenant co-parent.</p><Button onClick={() => navigate("/home")} className="w-full rounded-xl">Aller à l'accueil</Button></>}
        {state === "err" && <><div className="w-14 h-14 rounded-full bg-medical-light-red mx-auto flex items-center justify-center"><AlertCircle className="w-7 h-7 text-destructive" /></div><h1 className="font-bold text-foreground">Invitation invalide</h1><p className="text-xs text-muted-foreground">{err}</p><Button onClick={() => navigate("/home")} className="w-full rounded-xl">Retour</Button></>}
      </div>
    </div>
  );
}