import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptCgu: false,
    acceptComm: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwRules = [
    { label: "8 caractères minimum", ok: form.password.length >= 8 },
    { label: "1 majuscule", ok: /[A-Z]/.test(form.password) },
    { label: "1 chiffre", ok: /\d/.test(form.password) },
    { label: "1 caractère spécial", ok: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const pwMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const pwValid = pwRules.every((r) => r.ok);

  const update = (key: string, value: string | boolean) => setForm({ ...form, [key]: value });

  const handleSignup = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (!pwValid) { toast.error("Le mot de passe ne respecte pas les critères"); return; }
    if (!pwMatch) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (!form.acceptCgu) { toast.error("Veuillez accepter les CGU"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
      navigate("/login");
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
    if (error) toast.error(error.message);
  };
  return (
    <PageTransition>
      <div className="h-[100dvh] overflow-hidden bg-background max-w-lg mx-auto flex flex-col">
        <div className="px-4 pt-[max(env(safe-area-inset-top),0.5rem)] pb-1 shrink-0">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex flex-col justify-center">
          <div className="mb-2">
            <h1 className="text-lg font-bold text-foreground">Créer un compte</h1>
            <p className="text-[11px] text-muted-foreground">Rejoignez BébéSanté</p>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-0.5">Prénom *</label>
                <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Marie" className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-0.5">Nom *</label>
                <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Dupont" className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-0.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="marie@email.com" autoComplete="email" className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-0.5">Téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-0.5">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-muted rounded-lg px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" aria-label="Voir le mot de passe">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-1 grid grid-cols-2 gap-0.5">
                  {pwRules.map((r, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {r.ok ? <Check className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-destructive" />}
                      <span className={`text-[10px] ${r.ok ? "text-success" : "text-muted-foreground"}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-0.5">Confirmer *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${form.confirmPassword && !pwMatch ? "focus:ring-destructive ring-1 ring-destructive" : "focus:ring-ring"}`}
              />
              {form.confirmPassword && !pwMatch && (
                <p className="text-[10px] text-destructive mt-0.5">Mots de passe différents</p>
              )}
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input type="checkbox" checked={form.acceptCgu} onChange={(e) => update("acceptCgu", e.target.checked)} className="rounded border-border mt-0.5" />
              <span className="text-[11px] text-muted-foreground leading-snug">
                J'accepte les <button className="text-primary font-semibold underline">CGU</button> et la <button className="text-primary font-semibold underline">politique de confidentialité</button> *
              </span>
            </label>

            <Button onClick={handleSignup} disabled={loading} className="w-full h-11 text-sm font-semibold rounded-xl mt-1" style={{ boxShadow: "var(--shadow-button)" }}>
              {loading ? "Création..." : "Créer mon compte"}
            </Button>

            <button
              onClick={handleGoogleSignup}
              className="w-full h-10 bg-muted rounded-xl text-xs font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Déjà un compte ?{" "}
            <button onClick={() => navigate("/login")} className="text-primary font-semibold">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;
