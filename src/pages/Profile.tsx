import { Baby, Bell, Lock, CreditCard, LogOut, ChevronRight, Shield, Users, FileText, Heart, Settings, Save, Scale, Cookie, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { openCookieBanner } from "@/components/legal/CookieBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import ListenButton from "@/components/ListenButton";
import { useTTSSettings, VOICE_OPTIONS, LANGUAGE_OPTIONS, SPEED_OPTIONS } from "@/hooks/useTTS";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { data: children } = useChildren();
  const [editHealth, setEditHealth] = useState(false);
  const [healthForm, setHealthForm] = useState({
    blood_type: "",
    allergies: [] as string[],
    medical_history: "",
    doctor_name: "",
  });
  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { voice, language, speed, setVoice, setLanguage, setSpeed } = useTTSSettings();

  useEffect(() => {
    if (profile) {
      setHealthForm({
        blood_type: profile.blood_type || "",
        allergies: profile.allergies || [],
        medical_history: profile.medical_history || "",
        doctor_name: profile.doctor_name || "",
      });
    }
  }, [profile]);

  const handleSaveHealth = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        blood_type: healthForm.blood_type || null,
        allergies: healthForm.allergies,
        medical_history: healthForm.medical_history || null,
        doctor_name: healthForm.doctor_name || null,
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Informations santé mises à jour");
      setEditHealth(false);
      refreshProfile();
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setHealthForm({ ...healthForm, allergies: [...healthForm.allergies, allergyInput.trim()] });
      setAllergyInput("");
    }
  };

  const removeAllergy = (i: number) => {
    setHealthForm({ ...healthForm, allergies: healthForm.allergies.filter((_, idx) => idx !== i) });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "?"
    : "?";

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() || "Utilisateur" : "Chargement...";
  const childNames = children?.map((c) => c.first_name).join(", ") || "Aucun enfant";

  const menuItems = [
    { icon: Baby, label: "Profils enfants", desc: childNames, path: "/child-profile" },
    { icon: Users, label: "Co-parentalité", desc: "Inviter un co-parent", path: "/coparenting" },
    { icon: Heart, label: "Contenus sauvegardés", desc: "Mes favoris", path: "/saved-contents" },
    { icon: Bell, label: "Notifications", desc: "Push, email, SMS", path: "/notification-settings" },
    { icon: FileText, label: "Documents médicaux", desc: "Coffre-fort numérique", path: "/documents" },
    { icon: Lock, label: "Sécurité", desc: "Mot de passe, biométrie, 2FA", path: null },
    { icon: CreditCard, label: "Abonnement", desc: "Gratuit", path: null },
  ];

  const legalItems = [
    { icon: Shield, label: "Centre RGPD", desc: "Vos consentements, accès, suppression", action: () => navigate("/legal/rgpd") },
    { icon: BookOpen, label: "Politique de confidentialité", desc: "Vos données et vos droits", action: () => navigate("/legal/confidentialite") },
    { icon: Scale, label: "CGU", desc: "Conditions générales d'utilisation", action: () => navigate("/legal/cgu") },
    { icon: FileText, label: "Mentions légales", desc: "Éditeur, hébergeur HDS", action: () => navigate("/legal/mentions-legales") },
    { icon: Cookie, label: "Gérer mes cookies", desc: "Revoir mes préférences", action: () => openCookieBanner() },
  ];

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{fullName}</h1>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0" aria-label="Paramètres">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Parent health */}
        <div className="medical-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Informations santé du parent</h3>
            <button
              onClick={() => setEditHealth(!editHealth)}
              className="text-xs font-semibold text-primary"
            >
              {editHealth ? "Annuler" : "Modifier"}
            </button>
          </div>

          {!editHealth ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-muted-foreground">Groupe sanguin</p>
                <p className="font-semibold text-foreground mt-0.5">{profile?.blood_type || "Non renseigné"}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-muted-foreground">Allergies</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {profile?.allergies?.length ? profile.allergies.join(", ") : "Aucune"}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-muted-foreground">Antécédents</p>
                <p className="font-semibold text-foreground mt-0.5">{profile?.medical_history || "Aucun"}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-muted-foreground">Médecin</p>
                <p className="font-semibold text-foreground mt-0.5">{profile?.doctor_name || "Non renseigné"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Groupe sanguin</label>
                <select
                  value={healthForm.blood_type}
                  onChange={(e) => setHealthForm({ ...healthForm, blood_type: e.target.value })}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Non renseigné</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Allergies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                    placeholder="Ex: Pénicilline"
                    className="flex-1 bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button onClick={addAllergy} className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">+</button>
                </div>
                {healthForm.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {healthForm.allergies.map((a, i) => (
                      <span key={i} className="text-xs bg-medical-light-red text-medical-red px-2.5 py-1 rounded-full flex items-center gap-1">
                        {a}
                        <button onClick={() => removeAllergy(i)} className="font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Antécédents médicaux</label>
                <textarea
                  value={healthForm.medical_history}
                  onChange={(e) => setHealthForm({ ...healthForm, medical_history: e.target.value })}
                  placeholder="Chirurgies, maladies chroniques..."
                  rows={2}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Médecin traitant</label>
                <input
                  value={healthForm.doctor_name}
                  onChange={(e) => setHealthForm({ ...healthForm, doctor_name: e.target.value })}
                  placeholder="Dr. Martin"
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button onClick={handleSaveHealth} disabled={saving} className="w-full h-11 text-sm font-semibold rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          )}
        </div>

        {/* Premium CTA */}
        <div className="medical-card-elevated bg-gradient-to-r from-primary/10 to-accent space-y-2 cursor-pointer active:scale-[0.98] transition-transform">
          <h3 className="font-bold text-sm text-foreground">Passez à Premium ✨</h3>
          <p className="text-xs text-muted-foreground">Questions IA illimitées, 5 Go de stockage, contenus exclusifs</p>
          <button className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl mt-1">
            Découvrir l'offre
          </button>
        </div>

        {/* Menu */}
        <div className="space-y-1">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        {/* Légal & confidentialité */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-3">
            Légal & confidentialité
          </p>
          {legalItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        {/* Lecture audio */}
        <div className="medical-card space-y-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Lecture audio (voix naturelle)</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Voix humaines premium pour écouter articles, CGU et politiques. Choisissez la voix qui vous convient.
            </p>
          </div>
          <div>
            <label htmlFor="tts-voice" className="text-xs font-semibold text-foreground block mb-1">Voix</label>
            <select
              id="tts-voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value as any)}
              className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tts-lang" className="text-xs font-semibold text-foreground block mb-1">Langue de lecture</label>
            <select
              id="tts-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Dioula et Baoulé ne sont pas encore disponibles pour la synthèse vocale (aucun modèle actuel ne les supporte). Nous ajouterons ces langues dès qu'un modèle de qualité sera disponible.
            </p>
          </div>
          <div>
            <label htmlFor="tts-speed" className="text-xs font-semibold text-foreground block mb-1">Vitesse de lecture</label>
            <select
              id="tts-speed"
              value={String(speed)}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s.value} value={String(s.value)}>{s.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Réduisez la vitesse pour une écoute plus posée (fatigue, apprentissage du français), augmentez-la pour parcourir plus vite.
            </p>
          </div>
          <div className="pt-1">
            <ListenButton
              text={
                language === "en"
                  ? "Hello, this is a preview of the selected voice."
                  : language === "es"
                    ? "Hola, esta es una prueba de la voz seleccionada."
                    : language === "ar"
                      ? "مرحباً، هذا اختبار للصوت المختار."
                      : "Bonjour, ceci est un aperçu de la voix sélectionnée pour la lecture des articles."
              }
              label="Écouter un aperçu"
              size="sm"
            />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-medical-light-red active:bg-medical-light-red/80 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-medical-light-red flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <p className="font-semibold text-sm text-destructive">Se déconnecter</p>
        </button>

        <p className="text-[10px] text-center text-muted-foreground">
          BébéSanté v1.0 · Hébergement HDS · Données chiffrées AES-256
        </p>
      </div>
    </PageTransition>
  );
};

export default Profile;
