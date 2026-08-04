import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useNewsHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["news_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_read_history" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; news_slug: string; action: string; created_at: string }[];
    },
    enabled: !!user,
  });
};

export const useTrackNewsAction = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ news_slug, action }: { news_slug: string; action: "read" | "listen" }) => {
      if (!user) return;
      // Upsert-like: check existing same slug+action to avoid duplicates
      const { data: existing } = await supabase
        .from("news_read_history" as any)
        .select("id")
        .eq("news_slug", news_slug)
        .eq("action", action)
        .limit(1);
      if (existing && existing.length > 0) return;
      const { error } = await supabase.from("news_read_history" as any).insert({
        user_id: user.id,
        news_slug,
        action,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news_history"] }),
  });
};