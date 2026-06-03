import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message);
    } else {
      toast.success("Connexion réussie !");
      navigate("/home");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Entrez votre email pour réinitialiser");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Email de réinitialisation envoyé !");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
    if (error) toast.error(error.message);
  };

  return (
    <PageTransition>
      <div className="h-[100dvh] overflow-hidden bg-background max-w-lg mx-auto flex flex-col">
        <div className="px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2 shrink-0">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-6 flex flex-col justify-center pb-[max(env(safe-area-inset-bottom),0.5rem)] gap-3">
          {/* Logo */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-primary-foreground">B</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Bon retour !</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Connectez-vous à BébéSanté</p>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@email.com"
                autoComplete="email"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-muted rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" aria-label="Afficher le mot de passe">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-border" />
                Se souvenir de moi
              </label>
              <button onClick={handleForgotPassword} className="text-xs font-semibold text-primary">
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-sm font-semibold rounded-xl mt-1"
              style={{ boxShadow: "var(--shadow-button)" }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <button
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-muted rounded-xl text-sm font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-1">
            Pas encore de compte ?{" "}
            <button onClick={() => navigate("/signup")} className="text-primary font-semibold">
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
