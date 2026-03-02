import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Fingerprint } from "lucide-react";
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
        <div className="px-4 pt-6 pb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="flex-1 px-6 flex flex-col justify-center pb-12">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary-foreground">B</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Bon retour !</h1>
            <p className="text-sm text-muted-foreground mt-1">Connectez-vous à votre compte BébéSanté</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@email.com"
                autoComplete="email"
                className="w-full bg-muted rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-muted rounded-xl px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" aria-label="Afficher le mot de passe">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
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
              className="w-full h-14 text-base font-semibold rounded-xl mt-2"
              style={{ boxShadow: "var(--shadow-button)" }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <button className="w-full h-14 bg-muted rounded-xl text-sm font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <Fingerprint className="w-5 h-5 text-primary" /> Connexion biométrique
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
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
