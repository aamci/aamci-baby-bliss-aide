# Tests End-to-End Playwright — BébéSanté

Ce document décrit les scénarios E2E automatisés. Ils s'exécutent via Playwright
depuis le sandbox de développement (voir `npm run test:e2e` si configuré) ou
via le script Python Playwright utilisé pour l'audit.

## Scénarios couverts

### 1. Dashboard — chargement des graphiques
- Naviguer vers `/dashboard` avec une session authentifiée et un enfant
- Vérifier la présence des 6 KPI cards (sommeil, repas, couches, poids, vaccin, jalons)
- Vérifier le rendu des sections : Croissance, Sommeil 14 jours, Alimentation, Jalons radar, Couches heatmap
- Basculer Poids/Taille sur la courbe de croissance (rôle `tab`, `aria-selected`)
- Vérifier l'absence d'erreur console et d'overflow horizontal

### 2. Capsules vidéo — lecture
- Naviguer vers `/contents`, onglet Capsules vidéo
- Ouvrir une capsule : le `role="dialog"` du lecteur s'affiche
- Vérifier le focus initial sur le bouton Fermer
- Vérifier la fermeture par la touche Échap
- Vérifier la présence d'un `<video>` ou `<iframe>` avec titre accessible

### 3. Co-parentalité — invitation et révocation
- Naviguer vers `/coparenting`
- Vérifier la liste « Parents actifs »
- Saisir un email et cliquer « Envoyer l'invitation »
- Vérifier l'apparition de l'invitation en attente avec boutons Copier/Révoquer (aria-labels)
- Révoquer et vérifier la disparition de l'invitation (région `aria-live`)

### 4. Calendrier médical
- Naviguer vers `/calendar`
- Vérifier la grille mois avec jours navigables (44px minimum)
- Basculer Mois/Semaine, naviguer périodes précédente/suivante
- Sélectionner un jour et vérifier la liste d'événements annoncée

### 5. Actualités santé
- Naviguer vers `/news`
- Filtrer par catégorie (rôle `tab`)
- Déplier un article, vérifier `aria-expanded` et le bouton « Écouter »
- Vérifier le filtrage par âge quand un enfant existe

## Exécution

Les tests sont exécutés par le script Python Playwright d'audit
(`/tmp/browser/audit/`), qui couvre également le responsive multi-viewports
(360px mobile, 768px tablette, 1280px desktop) et capture des captures
d'écran de chaque page clé.