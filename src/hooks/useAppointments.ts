import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAppointments = (childId: string | undefined) => {
  return useQuery({
    queryKey: ["visits", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .eq("child_id", childId!)
        .order("visit_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
};

export const useAddAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appt: {
      child_id: string;
      name: string;
      doctor_name?: string;
      visit_date: string;
      visit_time?: string;
      notes?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("visits")
        .insert({ ...appt, status: appt.status || "upcoming" } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["visits", v.child_id] }),
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, child_id, ...updates }: {
      id: string;
      child_id: string;
      status?: string;
      visit_date?: string;
      visit_time?: string;
      notes?: string;
      name?: string;
      doctor_name?: string;
    }) => {
      const { error } = await supabase.from("visits").update(updates as any).eq("id", id);
      if (error) throw error;
      return { child_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["visits", d.child_id] }),
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, child_id }: { id: string; child_id: string }) => {
      const { error } = await supabase.from("visits").delete().eq("id", id);
      if (error) throw error;
      return { child_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["visits", d.child_id] }),
  });
};
