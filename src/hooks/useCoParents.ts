import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCoParents = (childId?: string) => {
  return useQuery({
    queryKey: ["coparents", childId],
    queryFn: async () => {
      const { data: links, error } = await supabase.from("child_parents").select("parent_id, role").eq("child_id", childId!);
      if (error) throw error;
      if (!links?.length) return [];
      const ids = links.map((l) => l.parent_id);
      const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name").in("id", ids);
      return links.map((l) => ({
        parent_id: l.parent_id,
        role: l.role,
        profile: profiles?.find((p) => p.id === l.parent_id) ?? null,
      }));
    },
    enabled: !!childId,
  });
};

export const useMyInvites = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my_invites", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("co_parent_invites").select("*").eq("invited_by", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useRevokeInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("co_parent_invites").update({ status: "revoked" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my_invites"] }),
  });
};

export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-coparent?action=accept&token=${encodeURIComponent(token)}`,
        { method: "GET", headers: { Authorization: `Bearer ${session.session?.access_token}` } },
      );
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Erreur");
      return json;
    },
  });
};