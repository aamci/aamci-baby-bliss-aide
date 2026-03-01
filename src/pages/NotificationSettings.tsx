import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    visits: true,
    vaccines: true,
    content: true,
    assistant: false,
    coparent: true,
    quiet: true,
    quietStart: "22:00",
    quietEnd: "07:00",
    push: true,
    email: true,
    sms: false,
  });

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${value ? "bg-primary" : "bg-muted"}`}
      role="switch"
      aria-checked={value}
    >
      <div className={`w-6 h-6 rounded-full bg-card shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Types de notifications</h2>
            <div className="medical-card space-y-4">
              {[
                { key: "visits" as const, label: "Rappels visites médicales", desc: "30 jours, 7 jours et la veille" },
                { key: "vaccines" as const, label: "Rappels vaccins", desc: "7 jours et la veille" },
                { key: "content" as const, label: "Nouveaux contenus", desc: "Max 1 notification par jour" },
                { key: "assistant" as const, label: "Suggestions assistant", desc: "Questions suggérées par l'IA" },
                { key: "coparent" as const, label: "Alertes co-parent", desc: "Documents ajoutés, RDV pris" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Toggle value={settings[item.key]} onChange={(v) => setSettings({ ...settings, [item.key]: v })} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Mode silencieux</h2>
            <div className="medical-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Heures calmes</p>
                  <p className="text-xs text-muted-foreground">Pas de notifications pendant la nuit</p>
                </div>
                <Toggle value={settings.quiet} onChange={(v) => setSettings({ ...settings, quiet: v })} />
              </div>
              {settings.quiet && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground block mb-1">De</label>
                    <input
                      type="time"
                      value={settings.quietStart}
                      onChange={(e) => setSettings({ ...settings, quietStart: e.target.value })}
                      className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground block mb-1">À</label>
                    <input
                      type="time"
                      value={settings.quietEnd}
                      onChange={(e) => setSettings({ ...settings, quietEnd: e.target.value })}
                      className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Canaux</h2>
            <div className="medical-card space-y-4">
              {[
                { key: "push" as const, label: "Notifications push" },
                { key: "email" as const, label: "Email" },
                { key: "sms" as const, label: "SMS" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <Toggle value={settings[item.key]} onChange={(v) => setSettings({ ...settings, [item.key]: v })} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
