/**
 * Mesure d'audience respectueuse du RGPD.
 *
 * Principes :
 * - Aucune collecte tant que le consentement « Mesure d'audience » n'est pas donné.
 * - Aucun tiers : les événements sont stockés en first-party (Supabase, hébergement UE/HDS).
 * - Aucune donnée personnelle : pas d'user_id, pas d'IP, pas d'empreinte navigateur.
 * - Identifiant de session pseudonyme, aléatoire, conservé uniquement en sessionStorage
 *   (il disparaît à la fermeture de l'onglet) et régénéré au retrait du consentement.
 */
import { supabase } from "@/integrations/supabase/client";
import { getStoredConsent } from "@/lib/legal";

const SESSION_KEY = "bb_analytics_session";
export const CONSENT_CHANGED_EVENT = "bb:consent-changed";

export const hasAnalyticsConsent = () => getStoredConsent()?.consent.analytics === true;

/** Identifiant de session anonyme, non rattachable à un compte. */
const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "ephemeral";
  }
};

export const resetAnalyticsSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* stockage indisponible : rien à nettoyer */
  }
};

/** Supprime tout identifiant d'URL susceptible d'être personnel (token, email…). */
const sanitizePath = (path: string) => path.split("?")[0].split("#")[0];

export const trackEvent = async (
  event: string,
  properties: Record<string, string | number | boolean> = {},
  path: string = typeof window !== "undefined" ? window.location.pathname : ""
) => {
  if (!hasAnalyticsConsent()) return;
  try {
    await supabase.from("analytics_events").insert({
      session_id: getSessionId(),
      event,
      path: sanitizePath(path),
      properties,
    });
  } catch (e) {
    // La mesure d'audience ne doit jamais bloquer l'usage de l'application.
    console.warn("analytics event dropped", e);
  }
};

export const trackPageView = (path: string) => trackEvent("page_view", {}, path);

export const notifyConsentChanged = () => {
  if (!hasAnalyticsConsent()) resetAnalyticsSession();
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
};
