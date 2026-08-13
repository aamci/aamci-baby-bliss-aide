import { useReminders } from "@/hooks/useReminders";

/**
 * Compteur affiché sur la cloche : nombre de rappels du parcours de soins
 * réellement actionnables aujourd'hui (fenêtre ouverte ou bientôt ouverte,
 * non reportés, non faits). Données réelles, calculées depuis la date de
 * naissance de l'enfant et l'état partagé entre co-parents.
 */
export const useUnreadNotifications = () => {
  const { active } = useReminders();
  return { count: active.length };
};
