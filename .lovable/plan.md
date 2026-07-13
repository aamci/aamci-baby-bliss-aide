## Audit & enrichissement complet BébéSanté

Itération unique découpée en 4 phases séquentielles. Toutes les priorités que tu as cochées sont incluses, plus l'audit responsive final.

---

### Phase 1 — Nouveaux domaines de suivi (sommeil, alimentation, couches)

**Base de données** (une migration)
- Table `sleep_logs` (child_id, start_at, end_at, duration_min, kind: 'night'|'nap', notes)
- Table `feeding_logs` (child_id, fed_at, kind: 'breast'|'bottle'|'solid', side, amount_ml, food, duration_min, notes)
- Table `diaper_logs` (child_id, changed_at, kind: 'wet'|'dirty'|'both', notes)
- GRANTS + RLS scopées via `is_child_parent(auth.uid(), child_id)` (fonction déjà existante)
- Triggers `updated_at`

**Frontend**
- Onglets ajoutés dans `Tracking.tsx` : Sommeil, Repas, Couches
- Saisie rapide "one-hand" (gros boutons, timer sommeil live, presets biberon)
- Hooks React Query `useSleepLogs`, `useFeedingLogs`, `useDiaperLogs` + mutations

---

### Phase 2 — Dashboard statistiques pro

Nouvelle page `/dashboard` (déjà routée, à re-designer complètement).

**KPIs (cartes)**
- Sommeil 24h, moyenne 7j, dernière tétée/biberon, couches du jour, poids actuel + delta P3/P50/P97 OMS
- Prochain vaccin, prochaine visite, % jalons acquis par domaine

**Graphiques (Recharts)**
- Courbe poids / taille / PC vs bandes OMS P3–P50–P97 (fille/garçon)
- Barres sommeil 14 derniers jours (nuit vs sieste, empilées)
- Aire alimentation (ml/jour) 7j + camembert sein/biberon/solide
- Timeline vaccins (fait / à venir / en retard)
- Radar jalons par domaine (moteur, langage, social, cognitif)
- Heatmap couches (heure × jour)

**Données OMS**
- Constantes P3/P50/P97 poids/taille/PC 0–48 mois (fichier `src/lib/whoStandards.ts`)

---

### Phase 3 — Co-parentalité bout-en-bout + Capsules vidéo

**Co-parentalité**
- Audit `invite-coparent` edge function : envoi email via Resend si `RESEND_API_KEY` (sinon retour du lien à copier)
- Page `/coparenting` : liste invites envoyées/reçues, accepter/refuser, révoquer, badge role
- Route `/coparenting/accept?token=…` qui lie le user à l'enfant via `child_parents`
- Realtime activé sur `measurements`, `sleep_logs`, `feeding_logs`, `diaper_logs`, `milestones`, `documents` → les 2 parents voient tout en direct
- Badge "co-parent connecté" quand plusieurs parents sur l'enfant

**Capsules vidéo expertes** (Supabase Storage, bucket privé `videos`)
- Table `video_capsules` (title, description, category, age_min_months, age_max_months, storage_path, thumbnail_path, duration_sec, author, source_url, published_at) — lecture publique authentifiée
- Bucket `videos` privé + policies (lecture authenticated via signed URL, écriture service_role uniquement)
- Section "Capsules vidéo" dans `Contents.tsx` avec filtres âge/catégorie
- Lecteur plein écran mobile avec contrôles natifs
- Seed initial : 6 capsules démo (URL YouTube-nocookie ou placeholder .mp4) avec sources pro (HAS, Ameli, mpedia)
- Note : pas d'upload utilisateur (tu as choisi capsules éditoriales)

---

### Phase 4 — Audit responsive mobile 100%

- Passe systématique sur toutes les pages : `overflow-x: hidden`, `min-w-0`, `truncate`, `text-balance`, safe-areas (`env(safe-area-inset-*)`)
- Vérif tap targets ≥ 44×44px
- Tests Playwright multi-viewports (iPhone SE 375×667, iPhone 15 393×852, Pixel 7 412×915, tablette 768×1024) sur : `/`, `/login`, `/signup`, `/home`, `/dashboard`, `/tracking` (4 onglets), `/contents`, `/appointments`, `/profile`, `/documents`, `/coparenting`
- Captures dans `/tmp/browser/screenshots/` + rapport des problèmes détectés et corrigés

---

### Livrables

- **1 migration** (3 tables suivi + 1 table capsules + bucket videos + policies)
- **~15 fichiers créés** (hooks, composants graphiques, pages, seed vidéos, WHO standards)
- **~10 fichiers édités** (Tracking, Dashboard, Contents, CoParenting, Home KPIs)
- **1 edge function** ajustée (`invite-coparent` avec Resend optionnel)
- **Rapport responsive** avec captures multi-écrans

C'est gros mais faisable en une session. Je démarre par la migration dès validation.
