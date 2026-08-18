import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationPrefs {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  visits_enabled: boolean;
  vaccines_enabled: boolean;
  screening_enabled: boolean;
  content_enabled: boolean;
  coparent_enabled: boolean;
  quiet_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  timezone: string;
}

export const DEFAULT_PREFS: Omit<NotificationPrefs, "user_id"> = {
  push_enabled: true,
  email_enabled: true,
  sms_enabled: false,
  visits_enabled: true,
  vaccines_enabled: true,
  screening_enabled: true,
  content_enabled: true,
  coparent_enabled: true,
  quiet_enabled: true,
  quiet_start: "22:00",
  quiet_end: "07:00",
  timezone: "Europe/Paris",
};

export const useNotificationPrefs = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notification-prefs", user?.id],
    queryFn: async (): Promise<NotificationPrefs> => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          ...(data as any),
          quiet_start: String((data as any).quiet_start).slice(0, 5),
          quiet_end: String((data as any).quiet_end).slice(0, 5),
        };
      }
      return { user_id: user!.id, ...DEFAULT_PREFS };
    },
    enabled: !!user,
  });
};

export const useSaveNotificationPrefs = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<NotificationPrefs>) => {
      if (!user) throw new Error("Non connecté");
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_PREFS.timezone;
      const { error } = await supabase.from("notification_preferences").upsert(
        { ...DEFAULT_PREFS, timezone: tz, ...patch, user_id: user.id } as any,
        { onConflict: "user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-prefs"] }),
  });
};
