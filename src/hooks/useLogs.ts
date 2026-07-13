import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export type SleepLog = { id: string; child_id: string; start_at: string; end_at: string | null; duration_min: number | null; kind: "night" | "nap"; notes: string | null };
export type FeedingLog = { id: string; child_id: string; fed_at: string; kind: "breast" | "bottle" | "solid"; side: string | null; amount_ml: number | null; food: string | null; duration_min: number | null; notes: string | null };
export type DiaperLog = { id: string; child_id: string; changed_at: string; kind: "wet" | "dirty" | "both"; notes: string | null };

// SLEEP
export const useSleepLogs = (childId?: string, days = 30) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!childId) return;
    const ch = supabase
      .channel(`sleep-${childId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sleep_logs", filter: `child_id=eq.${childId}` }, () => {
        qc.invalidateQueries({ queryKey: ["sleep_logs", childId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [childId, qc]);

  return useQuery({
    queryKey: ["sleep_logs", childId, days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await supabase.from("sleep_logs").select("*").eq("child_id", childId!).gte("start_at", since).order("start_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SleepLog[];
    },
    enabled: !!childId,
  });
};

export const useAddSleepLog = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (m: { child_id: string; start_at: string; end_at?: string | null; kind: "night" | "nap"; notes?: string }) => {
      const duration = m.end_at ? Math.round((new Date(m.end_at).getTime() - new Date(m.start_at).getTime()) / 60000) : null;
      const { data, error } = await supabase.from("sleep_logs").insert({ ...m, duration_min: duration, recorded_by: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["sleep_logs", v.child_id] }),
  });
};

export const useDeleteSleepLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, child_id }: { id: string; child_id: string }) => {
      const { error } = await supabase.from("sleep_logs").delete().eq("id", id);
      if (error) throw error;
      return { child_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["sleep_logs", d.child_id] }),
  });
};

// FEEDING
export const useFeedingLogs = (childId?: string, days = 30) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!childId) return;
    const ch = supabase
      .channel(`feed-${childId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feeding_logs", filter: `child_id=eq.${childId}` }, () => {
        qc.invalidateQueries({ queryKey: ["feeding_logs", childId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [childId, qc]);

  return useQuery({
    queryKey: ["feeding_logs", childId, days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await supabase.from("feeding_logs").select("*").eq("child_id", childId!).gte("fed_at", since).order("fed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FeedingLog[];
    },
    enabled: !!childId,
  });
};

export const useAddFeedingLog = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (m: Partial<FeedingLog> & { child_id: string; kind: FeedingLog["kind"] }) => {
      const { data, error } = await supabase.from("feeding_logs").insert({ ...m, recorded_by: user!.id, fed_at: m.fed_at || new Date().toISOString() }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["feeding_logs", v.child_id] }),
  });
};

export const useDeleteFeedingLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, child_id }: { id: string; child_id: string }) => {
      const { error } = await supabase.from("feeding_logs").delete().eq("id", id);
      if (error) throw error;
      return { child_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["feeding_logs", d.child_id] }),
  });
};

// DIAPER
export const useDiaperLogs = (childId?: string, days = 30) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!childId) return;
    const ch = supabase
      .channel(`diaper-${childId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "diaper_logs", filter: `child_id=eq.${childId}` }, () => {
        qc.invalidateQueries({ queryKey: ["diaper_logs", childId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [childId, qc]);

  return useQuery({
    queryKey: ["diaper_logs", childId, days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await supabase.from("diaper_logs").select("*").eq("child_id", childId!).gte("changed_at", since).order("changed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DiaperLog[];
    },
    enabled: !!childId,
  });
};

export const useAddDiaperLog = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (m: { child_id: string; kind: DiaperLog["kind"]; changed_at?: string; notes?: string }) => {
      const { data, error } = await supabase.from("diaper_logs").insert({ ...m, recorded_by: user!.id, changed_at: m.changed_at || new Date().toISOString() }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["diaper_logs", v.child_id] }),
  });
};

export const useDeleteDiaperLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, child_id }: { id: string; child_id: string }) => {
      const { error } = await supabase.from("diaper_logs").delete().eq("id", id);
      if (error) throw error;
      return { child_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["diaper_logs", d.child_id] }),
  });
};