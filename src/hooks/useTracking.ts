import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMeasurements = (childId: string | undefined) => {
  return useQuery({
    queryKey: ["measurements", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .eq("child_id", childId!)
        .order("measured_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
};

export const useAddMeasurement = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (m: { child_id: string; measurement_type: string; value: number; measured_at: string }) => {
      const { data, error } = await supabase.from("measurements").insert({ ...m, recorded_by: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["measurements", v.child_id] }),
  });
};

export const useVaccines = (childId: string | undefined) => {
  return useQuery({
    queryKey: ["vaccines", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccines")
        .select("*")
        .eq("child_id", childId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
};

export const useVisits = (childId: string | undefined) => {
  return useQuery({
    queryKey: ["visits", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("child_id", childId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
};

export const useMilestones = (childId: string | undefined) => {
  return useQuery({
    queryKey: ["milestones", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("child_id", childId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
};

export const useToggleMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, acquired, child_id }: { id: string; acquired: boolean; child_id: string }) => {
      const { error } = await supabase.from("milestones").update({
        acquired,
        acquired_at: acquired ? new Date().toISOString().split("T")[0] : null,
      }).eq("id", id);
      if (error) throw error;
      return { child_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["milestones", d.child_id] }),
  });
};
