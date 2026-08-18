import { ArrowLeft, Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotificationPrefs, useSaveNotificationPrefs, type NotificationPrefs } from "@/hooks/useNotificationPrefs";
import { toast } from "sonner";

const PushNotificationBanner = () => {
  const { isSupported, permission, subscribe } = usePushNotifications();
  const [loading, setLoading] = useState(false);

  if (!isSupported || permission === "granted") return null;

  const handleEnable = async () => {
    setLoading(true);
    const ok = await subscribe();
    setLoading(false);
    if (ok) toast.success("Notifications push activées !");
    else toast.error("Impossible d'activer les notifications");
  };

  return (
    <section className="mb-2">
      <div className="medical-card bg-primary/5 border border-primary/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Activer les notifications push</p>
          <p className="text-xs text-muted-foreground">Rappels de vos rendez-vous et du parcours de soins</p>
        </div>
        <button
          onClick={handleEnable}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl active:scale-95 transition-transform shrink-0"
        >
          {loading ? "..." : "Activer"}
        </button>
      </div>
    </section>
  );
};

const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${value ? "bg-primary" : "bg-muted"}`}
    role="switch"
    aria-checked={value}
    aria-label={label}
  >
    <div className={`w-6 h-6 rounded-full bg-card shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
  </button>
);

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { data: prefs, isLoading } = useNotificationPrefs();
  const saveMut = useSaveNotificationPrefs();

  const update = (patch: Partial<NotificationPrefs>) => {
    saveMut.mutate(patch, { onError: (e: any) => toast.error(e.message) });
  };

  const types: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: "visits_enabled", label: "Rappels visites médicales", desc: "Ouverture de la fenêtre, date idéale et derniers jours" },
    { key: "vaccines_enabled", label: "Rappels vaccins", desc: "Selon le calendrier vaccinal français" },
    { key: "screening_enabled", label: "Repères de développement", desc: "Invitations douces à observer votre enfant" },
    { key: "content_enabled", label: "Nouveaux contenus", desc: "Max 1 notification par jour" },
    { key: "coparent_enabled", label: "Alertes co-parent", desc: "Documents ajoutés, RDV pris" },
  ];

  const channels: { key: keyof NotificationPrefs; label: string }[] = [
    { key: "push_enabled", label: "Notifications push" },
    { key: "email_enabled", label: "Email" },
    { key: "sms_enabled", label: "SMS" },
  ];

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {saveMut.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-label="Enregistrement" />}
        </div>

        {isLoading || !prefs ? (
          <p className="text-sm text-muted-foreground">Chargement de vos préférences…</p>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Types de notifications</h2>
              <div className="medical-card space-y-4">
                {types.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Toggle
                      label={item.label}
                      value={Boolean(prefs[item.key])}
                      onChange={(v) => update({ ...prefs, [item.key]: v })}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Mode silencieux</h2>
              <div className="medical-card space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Heures calmes</p>
                    <p className="text-xs text-muted-foreground">Aucune notification pendant la nuit</p>
                  </div>
                  <Toggle label="Heures calmes" value={prefs.quiet_enabled} onChange={(v) => update({ ...prefs, quiet_enabled: v })} />
                </div>
                {prefs.quiet_enabled && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-1">
                      <label htmlFor="quiet-start" className="text-xs text-muted-foreground block mb-1">De</label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={prefs.quiet_start}
                        onChange={(e) => update({ ...prefs, quiet_start: e.target.value })}
                        className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="quiet-end" className="text-xs text-muted-foreground block mb-1">À</label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={prefs.quiet_end}
                        onChange={(e) => update({ ...prefs, quiet_end: e.target.value })}
                        className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Les rappels prévus pendant cette plage sont envoyés dès la fin des heures calmes.
                </p>
              </div>
            </section>

            <PushNotificationBanner />

            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Canaux</h2>
              <div className="medical-card space-y-4">
                {channels.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <Toggle label={item.label} value={Boolean(prefs[item.key])} onChange={(v) => update({ ...prefs, [item.key]: v })} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
