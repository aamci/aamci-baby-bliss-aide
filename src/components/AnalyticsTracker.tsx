import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CONSENT_CHANGED_EVENT, hasAnalyticsConsent, trackPageView } from "@/lib/analytics";

/** Envoie une vue de page à chaque navigation, uniquement si le consentement est actif. */
const AnalyticsTracker = () => {
  const location = useLocation();
  const [consent, setConsent] = useState(hasAnalyticsConsent());

  useEffect(() => {
    const onChange = () => setConsent(hasAnalyticsConsent());
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!consent) return;
    trackPageView(location.pathname);
  }, [consent, location.pathname]);

  return null;
};

export default AnalyticsTracker;
