import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  COOKIE_POLICY_VERSION,
  CookieConsent,
  DEFAULT_CONSENT,
  getStoredConsent,
  storeConsent,
} from "@/lib/legal";
import { supabase } from "@/integrations/supabase/client";

const EVENT_OPEN = "bb:open-cookie-banner";
export const openCookieBanner = () => window.dispatchEvent(new Event(EVENT_OPEN));

const logConsent = async (action: string, consent: CookieConsent) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("consent_logs").insert({
      user_id: user?.id ?? null,
      action,
      categories: consent,
      policy_version: COOKIE_POLICY_VERSION,
      user_agent: navigator.userAgent,
    });
  } catch (e) {
    // Non-blocking: cookie consent must work even if logging fails
    console.warn("consent log failed", e);
  }
};

const CookieBanner = () => {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored || stored.version !== COOKIE_POLICY_VERSION) {
      setOpen(true);
    } else {
      setConsent(stored.consent);
    }
    const onOpen = () => {
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(EVENT_OPEN, onOpen);
    return () => window.removeEventListener(EVENT_OPEN, onOpen);
  }, []);

  const close = () => setOpen(false);

  const acceptAll = () => {
    const next: CookieConsent = { necessary: true, analytics: true, functional: true };
    storeConsent(next);
    setConsent(next);
    logConsent("accept_all", next);
    close();
  };

  const rejectAll = () => {
    const next: CookieConsent = { necessary: true, analytics: false, functional: false };
    storeConsent(next);
    setConsent(next);
    logConsent("reject_all", next);
    close();
  };

  const savePrefs = () => {
    const next: CookieConsent = { ...consent, necessary: true };
    storeConsent(next);
    setConsent(next);
    logConsent("custom", next);
    close();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
    >
      <div className="mx-auto max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground">Vos préférences cookies</h2>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">
              Nous utilisons des cookies pour faire fonctionner l'application, mesurer son
              audience et améliorer votre expérience. Vous pouvez accepter, refuser ou
              personnaliser vos choix à tout moment.{" "}
              <Link to="/legal/confidentialite" className="text-primary font-semibold underline">
                En savoir plus
              </Link>
            </p>
          </div>
          <button onClick={close} className="text-muted-foreground p-1" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {details && (
          <div className="space-y-2 border-t border-border pt-3">
            <CategoryRow
              label="Strictement nécessaires"
              desc="Authentification, sécurité, sauvegarde de vos préférences. Toujours actifs."
              checked
              disabled
            />
            <CategoryRow
              label="Mesure d'audience"
              desc="Statistiques anonymisées d'utilisation pour améliorer le service."
              checked={consent.analytics}
              onChange={(v) => setConsent({ ...consent, analytics: v })}
            />
            <CategoryRow
              label="Fonctionnels"
              desc="Personnalisation avancée, mémorisation des choix d'affichage."
              checked={consent.functional}
              onChange={(v) => setConsent({ ...consent, functional: v })}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="h-10 text-[12px] font-semibold" onClick={rejectAll}>
            Tout refuser
          </Button>
          <Button
            variant="outline"
            className="h-10 text-[12px] font-semibold"
            onClick={() => (details ? savePrefs() : setDetails(true))}
          >
            {details ? "Valider mes choix" : "Personnaliser"}
          </Button>
          <Button className="h-10 text-[12px] font-semibold" onClick={acceptAll}>
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
};

const CategoryRow = ({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      className="mt-0.5 w-4 h-4 accent-primary"
    />
    <div className="min-w-0">
      <p className="text-[12px] font-semibold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
    </div>
  </label>
);

export default CookieBanner;