export const CGU_VERSION = "1.0.0";
export const PRIVACY_VERSION = "1.0.0";
export const COOKIE_POLICY_VERSION = "1.0.0";
export const LEGAL_EFFECTIVE_DATE = "2026-06-01";

export type CookieCategory = "necessary" | "analytics" | "functional";
export type CookieConsent = Record<CookieCategory, boolean>;

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  functional: false,
};

const STORAGE_KEY = "cookieConsent_v1";

export const getStoredConsent = (): { consent: CookieConsent; version: string; date: string } | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const storeConsent = (consent: CookieConsent) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ consent, version: COOKIE_POLICY_VERSION, date: new Date().toISOString() })
  );
};

export const clearStoredConsent = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};