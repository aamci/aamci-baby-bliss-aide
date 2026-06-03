import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Fingerprint, Check, X, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [greetingName, setGreetingName] = useState<string | null>(null);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const emailValid = EMAIL_RE.test(email);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 350);
  };

  const showGreetingThenGo = async (userId: string) => {
    let firstName: string | null = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .single();
      firstName = data?.first_name ?? null;
    } catch {
      firstName = null;
    }
    setGreetingName(firstName && firstName.trim() ? `Bonjour, ${firstName}` : "Bienvenue");
    setGreetingVisible(true);
    window.setTimeout(() => {
      setGreetingVisible(false);
      window.setTimeout(() => navigate("/home"), 280);
    }, 1500);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      triggerShake();
      return;
    }
    if (!emailValid) {
      toast.error("Format d'email invalide");
      triggerShake();
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message);
      triggerShake();
      return;
    }
    setSuccess(true);
    if (data.user?.id) {
      await showGreetingThenGo(data.user.id);
    } else {
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
    else toast.success("Email de réinitialisation envoyé");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
    if (error) toast.error(error.message);
  };

  return (
    <>
      <style>{`
        @keyframes loginShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .login-shake { animation: loginShake 300ms ease-in-out; }
        @keyframes loginFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .login-fade-in { animation: loginFadeIn 300ms ease-out both; }
      `}</style>

      <div
        className="fixed inset-0 bg-white z-[100] flex items-center justify-center transition-opacity duration-300"
        style={{
          opacity: greetingVisible ? 1 : 0,
          pointerEvents: greetingVisible ? "auto" : "none",
        }}
        aria-hidden={!greetingVisible}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#212121] text-center px-6">
          {greetingName}
        </h2>
      </div>

      <div
        className="fixed inset-0 flex bg-white overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* LEFT PANEL */}
        <aside
          className="hidden md:flex md:w-[42%] flex-col justify-between p-8 lg:p-10 text-white"
          style={{ background: "linear-gradient(180deg, #0477B4 0%, #023E6E 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold text-lg">
              B
            </div>
            <span className="font-semibold text-lg tracking-tight">BébéSanté</span>
          </div>

          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="text-6xl leading-none mb-2 font-serif" style={{ color: "#9AD6F2" }}>
              &ldquo;
            </div>
            <blockquote className="italic font-light text-xl lg:text-[22px] leading-snug">
              Chaque nuit que vous avez dormi sereinement parce que vous aviez la bonne réponse au bon moment s&rsquo;appelle BébéSanté.
            </blockquote>
            <div className="w-16 h-px bg-white/30 my-6" />
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-sm font-medium">
              4,9 sur 5 — 12 000 parents satisfaits
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {[
              "Réponses médicales certifiées par des pédiatres",
              "Données de santé 100% privées et chiffrées",
              "Hébergement certifié HDS en France",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2.5} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT PANEL */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-4 overflow-y-auto">
            <div
              ref={formRef}
              className={`w-full max-w-[420px] ${shake ? "login-shake" : ""}`}
            >
              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: "#0596DE" }}
                >
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#212121" }}>BébéSanté</span>
              </div>

              <h1 className="text-[24px] font-bold text-center" style={{ color: "#212121" }}>
                Bon retour parmi vous
              </h1>
              <p className="text-[15px] text-center mt-1 mb-5" style={{ color: "#757575" }}>
                Votre enfant vous attend dans l&rsquo;application
              </p>

              <div className="space-y-3">
                {/* EMAIL */}
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    autoComplete="email"
                    className="peer w-full h-[52px] rounded-[10px] border bg-white px-3 pt-4 pb-1 pr-10 text-[15px] outline-none transition-colors"
                    style={{
                      borderColor: emailFocus ? "#0596DE" : "#E2E8F0",
                      color: "#212121",
                    }}
                  />
                  <label
                    htmlFor="login-email"
                    className={`absolute left-3 pointer-events-none transition-all ${
                      email || emailFocus ? "top-1 text-[11px]" : "top-1/2 -translate-y-1/2 text-[15px]"
                    }`}
                    style={{ color: emailFocus ? "#0596DE" : "#757575" }}
                  >
                    Email
                  </label>
                  {email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? (
                        <Check className="w-4 h-4 text-green-600" strokeWidth={2.5} />
                      ) : (
                        <X className="w-4 h-4 text-red-500" strokeWidth={2.5} />
                      )}
                    </span>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocus(true)}
                    onBlur={() => setPwFocus(false)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                    className="peer w-full h-[52px] rounded-[10px] border bg-white px-3 pt-4 pb-1 pr-10 text-[15px] outline-none transition-colors"
                    style={{
                      borderColor: pwFocus ? "#0596DE" : "#E2E8F0",
                      color: "#212121",
                    }}
                  />
                  <label
                    htmlFor="login-password"
                    className={`absolute left-3 pointer-events-none transition-all ${
                      password || pwFocus ? "top-1 text-[11px]" : "top-1/2 -translate-y-1/2 text-[15px]"
                    }`}
                    style={{ color: pwFocus ? "#0596DE" : "#757575" }}
                  >
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center"
                    style={{ color: "#757575" }}
                    aria-label="Afficher le mot de passe"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* ROW */}
                <div className="flex items-center justify-between text-[13px]">
                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px]" style={{ color: "#757575" }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "#0596DE" }}
                    />
                    Se souvenir de moi
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium hover:underline min-h-[44px]"
                    style={{ color: "#0596DE" }}
                  >
                    Mot de passe oublié
                  </button>
                </div>

                {/* SUBMIT */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading || success}
                  className="w-full h-[52px] rounded-[10px] text-white text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-80"
                  style={{ backgroundColor: "#0596DE" }}
                >
                  {success ? (
                    <>
                      <Check className="w-5 h-5 login-fade-in" strokeWidth={3} />
                      <span>Connexion réussie</span>
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>

                {/* DIVIDER */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px" style={{ backgroundColor: "#E2E8F0" }} />
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>ou</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#E2E8F0" }} />
                </div>

                {/* GOOGLE */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-12 rounded-[10px] bg-white border flex items-center justify-center gap-2 text-[14px] font-medium hover:bg-[#F8FAFC] transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#212121" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuer avec Google
                </button>

                {/* BIOMETRIC */}
                <button
                  type="button"
                  className="w-full h-12 rounded-[10px] bg-white border flex items-center justify-center gap-2 text-[14px] font-medium hover:bg-[#F8FAFC] transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#212121" }}
                >
                  <Fingerprint className="w-5 h-5" style={{ color: "#0596DE" }} />
                  Connexion biométrique
                </button>

                <p className="text-center text-[14px] pt-1" style={{ color: "#757575" }}>
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="font-bold hover:underline"
                    style={{ color: "#0596DE" }}
                  >
                    Rejoindre l&rsquo;application
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;
