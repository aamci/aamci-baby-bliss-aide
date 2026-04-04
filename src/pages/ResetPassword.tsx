import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Lien de réinitialisation invalide");
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async () => {
    if (password.length < 8) { toast.error("8 caractères minimum"); return; }
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Mot de passe mis à jour !"); navigate("/"); }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-muted-foreground mb-8">Choisissez un nouveau mot de passe sécurisé</p>
        <div className="w-full space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full bg-muted rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmer" className="w-full bg-muted rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <Button onClick={handleReset} disabled={loading} className="w-full h-14 text-base font-semibold rounded-xl" style={{ boxShadow: "var(--shadow-button)" }}>
            {loading ? "Mise à jour..." : "Valider"}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
