import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Child = {
  id: string;
  first_name: string;
  birth_date: string;
  gender: string | null;
  blood_type: string | null;
  allergies: string[];
  doctor_name: string | null;
  birth_weight: number | null;
  birth_height: number | null;
  avatar_url: string | null;
};

export const useChildren = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      const { data: memberships } = await supabase
        .from("child_parents")
        .select("child_id")
        .eq("parent_id", user!.id);

      if (!memberships?.length) return [];

      const childIds = memberships.map((m) => m.child_id);
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .in("id", childIds);

      if (error) throw error;
      return (data ?? []) as Child[];
    },
    enabled: !!user,
  });
};

export const useCreateChild = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (child: Omit<Child, "id">) => {
      // Create child
      const { data, error } = await supabase
        .from("children")
        .insert(child)
        .select()
        .single();
      if (error) throw error;

      // Link to parent
      const { error: linkError } = await supabase
        .from("child_parents")
        .insert({ child_id: data.id, parent_id: user!.id, role: "parent" });
      if (linkError) throw linkError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

export const useUpdateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Child> & { id: string }) => {
      const { data, error } = await supabase
        .from("children")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

export const useDeleteChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childId: string) => {
      // Best-effort cleanup of related rows (RLS allows parents)
      await supabase.from("visits").delete().eq("child_id", childId);
      await supabase.from("vaccines").delete().eq("child_id", childId);
      await supabase.from("milestones").delete().eq("child_id", childId);
      await supabase.from("measurements").delete().eq("child_id", childId);
      await supabase.from("documents").delete().eq("child_id", childId);
      await supabase.from("child_parents").delete().eq("child_id", childId);
      const { error } = await supabase.from("children").delete().eq("id", childId);
      if (error) throw error;
      return childId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
};

export const useChildAge = (birthDate: string | undefined) => {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30.44);
  const days = Math.floor(totalDays % 30.44);

  if (months < 1) return `${totalDays} jours`;
  if (months < 24) return `${months} mois et ${days} jours`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return `${years} an${years > 1 ? "s" : ""} et ${remMonths} mois`;
};
