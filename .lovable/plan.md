# Plan — Conformité légale & RGPD BébéSanté

## 1. Pages légales intégrées dans l'app
Créer 3 pages React rendant le contenu juridique (à partir du MD existant) directement dans l'app, avec mise en page mobile, scroll interne, en-tête + bouton retour :

- `src/pages/legal/Cgu.tsx` — route `/legal/cgu` — contenu complet repris de `CGU_BebeSante_v1.md` (15 articles), rendu via composant `<LegalDocument />` (Markdown + Tailwind typography).
- `src/pages/legal/MentionsLegales.tsx` — route `/legal/mentions-legales` — éditeur, directeur de publication, hébergeur HDS (OVHcloud), hébergeur app (Lovable / Supabase EU), DPO, RCS, contact, médiation conso.
- `src/pages/legal/Confidentialite.tsx` — route `/legal/confidentialite` — politique de confidentialité détaillée par traitement :
  - Assistant IA (Gemini, finalité, base légale art.6.1.a + 9.2.a, durée, transfert, sous-traitants)
  - Coffre-fort médical (HDS, chiffrement, logs d'audit, durée)
  - Rappels & notifications push (VAPID, opt-in)
  - Co-parentalité, comptes enfants, profils
  - Cookies & traceurs (renvoi vers centre cookies)
  - Droits RGPD + lien vers `/legal/rgpd`

Liens « CGU » et « Politique de confidentialité » dans `Signup.tsx` → pointent vers ces routes (ouverture nouvelle page, retour formulaire conservé).

## 2. Acceptation CGU + preuve persistée
- Table `cgu_acceptances` (user_id, cgu_version, privacy_version, accepted_at, ip, user_agent) avec RLS : l'utilisateur lit/insère ses propres lignes, service_role full.
- À l'inscription : si checkbox CGU cochée, on insère une ligne juste après `signUp` réussi (via session active). Version CGU stockée en constante `CGU_VERSION = "1.0.0"` (`src/lib/legal.ts`).
- Au login, si la version courante > dernière acceptée → modale bloquante « Mise à jour CGU » avant accès à l'app (composant `<CguGate />` monté dans `AppLayout`).

## 3. Bandeau consentement cookies (RGPD/DSA)
- Composant `<CookieBanner />` monté à la racine (App.tsx) visible tant que pas de choix.
- 3 catégories : Nécessaires (toujours actif), Mesure d'audience, Fonctionnels. Choix granulaire + boutons « Tout accepter » / « Tout refuser » / « Personnaliser » de même poids visuel.
- Stockage local `localStorage.cookieConsent` + table `consent_logs` (user_id nullable, categories jsonb, action, version, ip, ua, created_at) avec RLS lecture par propriétaire ou anonyme via service_role pour journalisation serveur-side (Edge Function `log-consent`).
- Lien permanent « Gérer mes cookies » dans le footer Profil pour rouvrir le panneau.

## 4. Centre RGPD
- Page `src/pages/legal/Rgpd.tsx` route `/legal/rgpd` (lien depuis Profil) :
  - Demande d'accès / portabilité → Edge Function `rgpd-export` génère JSON (profil, enfants, documents, rendez-vous, logs IA) + URL signée temporaire.
  - Demande de suppression → insert dans `rgpd_requests` (type, status, requested_at, processed_at), confirmation par modale, traitement async (status `pending`).
  - Gestion des consentements (cookies, marketing, IA) — toggles reliés à `user_consents` (user_id, scope, granted, updated_at).
  - Historique des demandes de l'utilisateur.
- Table `rgpd_requests` (user_id, type enum: access/export/delete/rectification, status, payload jsonb, requested_at, processed_at) + RLS owner.

## 5. Routes & navigation
- Ajouter dans `App.tsx` : `/legal/cgu`, `/legal/mentions-legales`, `/legal/confidentialite`, `/legal/rgpd` (public sauf RGPD center qui est protégé).
- Section « Légal & confidentialité » dans `Profile.tsx` : liens vers les 4 pages + bouton « Gérer mes cookies ».

## Détails techniques
- Markdown rendering : ajouter `react-markdown` + `remark-gfm`. Style via `prose prose-sm` Tailwind.
- Migration unique créant 4 tables (`cgu_acceptances`, `consent_logs`, `user_consents`, `rgpd_requests`) + GRANTS + RLS + triggers updated_at.
- Edge Functions : `log-consent` (anonyme), `rgpd-export` (auth requise, retourne URL signée d'un blob storage temporaire).
- Versioning : `src/lib/legal.ts` exporte `CGU_VERSION`, `PRIVACY_VERSION`, `COOKIE_POLICY_VERSION`.
- Tests : ajouter `src/test/legalConsent.test.ts` couvrant insertion `cgu_acceptances`, refus RLS croisé, journalisation consent_logs.

## Livrable
6 nouvelles pages, 1 migration (4 tables), 2 edge functions, 2 composants (`CookieBanner`, `CguGate`), 1 helper versions, 1 fichier de tests, modifications de `App.tsx`, `Signup.tsx`, `Profile.tsx`.
